const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { evaluateQuestion, calculateEstimatedScore } = require('../services/markingEngine');
const { requireActiveAccess } = require('../middleware/authMiddleware');

// Apply access control middleware
router.use(requireActiveAccess);

// Ensure student exists or create fallback
function ensureStudent(studentId, licenseKey = 'DEMO-2026-PASS') {
  const getStmt = db.prepare('SELECT * FROM students WHERE id = ?');
  let student = getStmt.get(studentId);
  if (!student) {
    db.prepare('INSERT OR IGNORE INTO students (id, license_key) VALUES (?, ?)').run(studentId, licenseKey);
    student = getStmt.get(studentId);
  }
  return student;
}

// POST /api/attempts/submit - Deterministic marking of a question submission
router.post('/submit', (req, res) => {
  try {
    const { student_id = 1, question_id, submitted_answers = {}, lang = 'en' } = req.body;

    if (!question_id) {
      return res.status(400).json({ error: 'Question ID is required' });
    }

    ensureStudent(student_id);

    const qStmt = db.prepare('SELECT * FROM questions WHERE id = ?');
    const question = qStmt.get(question_id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const fieldsStmt = db.prepare('SELECT * FROM answer_fields WHERE question_id = ? ORDER BY sort_order ASC');
    const fields = fieldsStmt.all(question_id);

    const submittedAnswers = submitted_answers || {};
    const evalResult = evaluateQuestion(fields, submittedAnswers, lang);

    const insertAttempt = db.prepare(`
      INSERT INTO attempts (
        student_id, question_id, paper_type, exam_type,
        submitted_answers_json, marks_earned, total_marks, percentage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const attemptInfo = insertAttempt.run(
      student_id,
      question_id,
      question.paper_type,
      question.exam_type,
      JSON.stringify(submittedAnswers),
      evalResult.marksEarned,
      evalResult.totalMarks,
      evalResult.percentage
    );

    return res.json({
      attempt_id: attemptInfo.lastInsertRowid,
      question_id: question.id,
      paper_type: question.paper_type,
      exam_type: question.exam_type,
      marks_earned: evalResult.marksEarned,
      total_marks: evalResult.totalMarks,
      percentage: evalResult.percentage,
      field_results: evalResult.fieldResults,
      working_solution: lang === 'af' ? (question.working_solution_af || question.working_solution_en) : question.working_solution_en
    });
  } catch (err) {
    console.error('Submit Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/attempts/stats - Compute REAL database statistics & diagnostic analysis
router.get('/stats', (req, res) => {
  try {
    const sId = parseInt(req.query.student_id, 10) || 1;
    const { paper_type = 'paper_1', exam_type = 'all' } = req.query;

    ensureStudent(sId);

    let attemptQuery = 'SELECT * FROM attempts WHERE student_id = ? AND paper_type = ?';
    const params = [sId, paper_type];

    if (exam_type && exam_type !== 'all') {
      attemptQuery += ' AND exam_type = ?';
      params.push(exam_type);
    }

    attemptQuery += ' ORDER BY created_at DESC';

    let attempts = db.prepare(attemptQuery).all(...params);

    // Fallback: If no attempts found for specific paper_type, fetch all student attempts
    if (attempts.length === 0) {
      let fallbackQuery = 'SELECT * FROM attempts WHERE student_id = ?';
      const fallbackParams = [sId];
      if (exam_type && exam_type !== 'all') {
        fallbackQuery += ' AND exam_type = ?';
        fallbackParams.push(exam_type);
      }
      fallbackQuery += ' ORDER BY created_at DESC';
      attempts = db.prepare(fallbackQuery).all(...fallbackParams);
    }

    const completedCount = attempts.length;
    let averagePercentage = 0;
    let correctCount = 0;
    let incorrectCount = 0;

    if (completedCount > 0) {
      const totalPct = attempts.reduce((acc, a) => acc + a.percentage, 0);
      averagePercentage = Math.round((totalPct / completedCount) * 10) / 10;
      
      attempts.forEach(a => {
        if (a.percentage >= 50) {
          correctCount++;
        } else {
          incorrectCount++;
        }
      });
    }

    // Calculate streak
    let streak = 0;
    for (const att of attempts) {
      if (att.percentage >= 50) {
        streak++;
      } else {
        break;
      }
    }

    // Calculate deterministic estimated score for next paper
    const estimation = calculateEstimatedScore(attempts);

    // Topic performance query
    let topicQuery = `
      SELECT q.topic_en, q.topic_af, AVG(a.percentage) as avg_pct, COUNT(a.id) as attempt_count
      FROM attempts a
      JOIN questions q ON a.question_id = q.id
      WHERE a.student_id = ? AND a.paper_type = ?
    `;
    const topicParams = [sId, paper_type];

    if (exam_type && exam_type !== 'all') {
      topicQuery += ' AND a.exam_type = ?';
      topicParams.push(exam_type);
    }

    topicQuery += ' GROUP BY q.topic_en ORDER BY avg_pct ASC';

    let rawTopics = db.prepare(topicQuery).all(...topicParams);

    // Fallback for topic performance if specific paper_type is empty
    if (rawTopics.length === 0 && completedCount > 0) {
      let fallbackTopicQuery = `
        SELECT q.topic_en, q.topic_af, AVG(a.percentage) as avg_pct, COUNT(a.id) as attempt_count
        FROM attempts a
        JOIN questions q ON a.question_id = q.id
        WHERE a.student_id = ?
      `;
      const fallbackTopicParams = [sId];
      if (exam_type && exam_type !== 'all') {
        fallbackTopicQuery += ' AND a.exam_type = ?';
        fallbackTopicParams.push(exam_type);
      }
      fallbackTopicQuery += ' GROUP BY q.topic_en ORDER BY avg_pct ASC';
      rawTopics = db.prepare(fallbackTopicQuery).all(...fallbackTopicParams);
    }

    const topicPerformance = rawTopics.map(t => ({
      topic_en: t.topic_en,
      topic_af: t.topic_af,
      average_pct: Math.round(t.avg_pct * 10) / 10,
      attempt_count: t.attempt_count
    }));

    const weakTopics = topicPerformance.filter(t => t.average_pct < 65);

    // Smart Diagnostic Analysis Engine
    let diagnosticAnalysis = {
      message_en: "Complete more practice questions to enable detailed diagnostic analysis.",
      message_af: "Voltooi meer oefenvrae om gedetailleerde diagnostiese ontleding te aktiveer.",
      primary_weakness_en: null,
      primary_weakness_af: null
    };

    if (completedCount > 0 && topicPerformance.length > 0) {
      const worstTopic = topicPerformance[0]; // lowest accuracy topic
      if (worstTopic.average_pct < 75) {
        diagnosticAnalysis = {
          message_en: `Based on your recent attempts, you are mostly struggling with "${worstTopic.topic_en}" (Average ${worstTopic.average_pct}%). Focus on practicing this topic to improve your score.`,
          message_af: `Gebaseer op jou onlangse pogings, sukkel jy veral met "${worstTopic.topic_af}" (Gemiddeld ${worstTopic.average_pct}%). Fokus op die oefening van hierdie onderwerp om jou telling te verbeter.`,
          primary_weakness_en: worstTopic.topic_en,
          primary_weakness_af: worstTopic.topic_af
        };
      } else {
        diagnosticAnalysis = {
          message_en: `Great performance! You maintain high accuracy across all practiced topics. Keep reviewing to maintain your score.`,
          message_af: `Uitstekende prestasie! Jy handhaaf hoë akkuraatheid oor alle geoefende onderwerpe. Hou aan hersien om jou telling te behou.`,
          primary_weakness_en: null,
          primary_weakness_af: null
        };
      }
    }

    let recentQuery = `
      SELECT a.id, a.question_id, a.paper_type, a.exam_type, a.marks_earned, a.total_marks, a.percentage, a.created_at,
             q.topic_en, q.topic_af
      FROM attempts a
      JOIN questions q ON a.question_id = q.id
      WHERE a.student_id = ? AND a.paper_type = ?
      ORDER BY a.created_at DESC LIMIT 10
    `;
    let recentActivity = db.prepare(recentQuery).all(sId, paper_type);

    if (recentActivity.length === 0 && completedCount > 0) {
      let fallbackRecent = `
        SELECT a.id, a.question_id, a.paper_type, a.exam_type, a.marks_earned, a.total_marks, a.percentage, a.created_at,
               q.topic_en, q.topic_af
        FROM attempts a
        JOIN questions q ON a.question_id = q.id
        WHERE a.student_id = ?
        ORDER BY a.created_at DESC LIMIT 10
      `;
      recentActivity = db.prepare(fallbackRecent).all(sId);
    }

    res.json({
      paper_type,
      exam_type,
      completed_count: completedCount,
      average_percentage: averagePercentage,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      streak,
      estimated_score: estimation.estimatedScore,
      estimation_message: estimation.message,
      diagnostic_analysis: diagnosticAnalysis,
      topic_performance: topicPerformance,
      weak_topics: weakTopics,
      recent_activity: recentActivity
    });
  } catch (err) {
    console.error('Stats Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/attempts/mock-submit - Submit full mock exam
router.post('/mock-submit', (req, res) => {
  try {
    const { student_id = 1, paper_type, exam_type, submissions = [], duration_seconds = 0, lang = 'en' } = req.body;

    ensureStudent(student_id);

    let totalScore = 0;
    let totalMarksPossible = 0;
    const questionResults = [];

    for (const sub of submissions) {
      const qStmt = db.prepare('SELECT * FROM questions WHERE id = ?');
      const question = qStmt.get(sub.question_id);
      if (!question) continue;

      const fieldsStmt = db.prepare('SELECT * FROM answer_fields WHERE question_id = ? ORDER BY sort_order ASC');
      const fields = fieldsStmt.all(sub.question_id);

      const evalResult = evaluateQuestion(fields, sub.submitted_answers, lang);

      totalScore += evalResult.marksEarned;
      totalMarksPossible += evalResult.totalMarks;

      db.prepare(`
        INSERT INTO attempts (
          student_id, question_id, paper_type, exam_type,
          submitted_answers_json, marks_earned, total_marks, percentage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        student_id,
        sub.question_id,
        paper_type,
        exam_type,
        JSON.stringify(sub.submitted_answers),
        evalResult.marksEarned,
        evalResult.totalMarks,
        evalResult.percentage
      );

      questionResults.push({
        question_id: question.id,
        topic_en: question.topic_en,
        topic_af: question.topic_af,
        marks_earned: evalResult.marksEarned,
        total_marks: evalResult.totalMarks,
        percentage: evalResult.percentage,
        field_results: evalResult.fieldResults
      });
    }

    const overallPercentage = totalMarksPossible > 0 ? Math.round((totalScore / totalMarksPossible) * 100 * 10) / 10 : 0;

    const mockInsert = db.prepare(`
      INSERT INTO mock_exams (
        student_id, paper_type, exam_type, score, total_marks, percentage, duration_seconds
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const mockInfo = mockInsert.run(
      student_id,
      paper_type,
      exam_type,
      totalScore,
      totalMarksPossible,
      overallPercentage,
      duration_seconds
    );

    res.json({
      mock_id: mockInfo.lastInsertRowid,
      paper_type,
      exam_type,
      score: totalScore,
      total_marks: totalMarksPossible,
      percentage: overallPercentage,
      duration_seconds,
      question_results: questionResults
    });
  } catch (err) {
    console.error('Mock Submit Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
