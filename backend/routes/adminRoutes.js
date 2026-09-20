const express = require('express');
const router = express.Router();
const db = require('../db/database');

const MASTER_KEY = process.env.MASTER_KEY || 'SA-ACC-MASTER-2026';

// Middleware for Admin authentication via master key header
function adminAuth(req, res, next) {
  const masterHeader = req.headers['x-master-key'];
  if (!masterHeader || masterHeader.trim() !== MASTER_KEY) {
    return res.status(403).json({ error: 'Admin access denied: Invalid or missing Master Key' });
  }
  next();
}

router.use(adminAuth);

// Create a new Question with Answer Fields
router.post('/questions', (req, res) => {
  const qData = req.body;

  if (!qData.paper_type || !qData.exam_type || !qData.topic_en || !qData.question_text_en) {
    return res.status(400).json({ error: 'Missing required question fields' });
  }

  const insertQ = db.prepare(`
    INSERT INTO questions (
      paper_type, exam_type, topic_en, topic_af, subtopic_en, subtopic_af,
      difficulty, question_text_en, question_text_af, question_type, total_marks,
      explanation_en, explanation_af, working_solution_en, working_solution_af
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = insertQ.run(
    qData.paper_type,
    qData.exam_type,
    qData.topic_en,
    qData.topic_af || qData.topic_en,
    qData.subtopic_en || '',
    qData.subtopic_af || qData.subtopic_en || '',
    qData.difficulty || 'medium',
    qData.question_text_en,
    qData.question_text_af || qData.question_text_en,
    qData.question_type || 'multi_field',
    qData.total_marks || 1,
    qData.explanation_en || '',
    qData.explanation_af || qData.explanation_en || '',
    qData.working_solution_en || '',
    qData.working_solution_af || qData.working_solution_en || ''
  );

  const questionId = info.lastInsertRowid;

  if (Array.isArray(qData.fields)) {
    const insertField = db.prepare(`
      INSERT INTO answer_fields (
        question_id, field_name_en, field_name_af, field_label_en, field_label_af,
        answer_type, correct_answer, accepted_alternatives_json, tolerance, marks,
        explanation_en, explanation_af, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    qData.fields.forEach((f, idx) => {
      insertField.run(
        questionId,
        f.field_name_en || f.label || `Field ${idx + 1}`,
        f.field_name_af || f.field_name_en || f.label || `Veld ${idx + 1}`,
        f.field_label_en || f.label || '',
        f.field_label_af || f.field_label_en || f.label || '',
        f.answer_type || 'number',
        String(f.correct_answer !== undefined ? f.correct_answer : f.answer || ''),
        JSON.stringify(f.accepted_alternatives || []),
        f.tolerance || 0,
        f.marks || 1,
        f.explanation_en || '',
        f.explanation_af || f.explanation_en || '',
        idx + 1
      );
    });
  }

  res.json({ message: 'Question created successfully', id: questionId });
});

// Bulk Import Questions with Validation Report
router.post('/import', (req, res) => {
  const { questions } = req.body;

  if (!Array.isArray(questions)) {
    return res.status(400).json({ error: 'Expected an array of question objects under "questions" key.' });
  }

  let successCount = 0;
  const errors = [];

  questions.forEach((qData, index) => {
    const rowNum = index + 1;

    // Validation
    if (!qData.paper_type || !['paper_1', 'paper_2'].includes(qData.paper_type)) {
      errors.push({ item: rowNum, error: 'Invalid or missing paper_type (must be paper_1 or paper_2)' });
      return;
    }
    if (!qData.exam_type || !['prelims', 'final'].includes(qData.exam_type)) {
      errors.push({ item: rowNum, error: 'Invalid or missing exam_type (must be prelims or final)' });
      return;
    }
    if (!qData.question_text_en && !qData.question_text) {
      errors.push({ item: rowNum, error: 'Missing question_text' });
      return;
    }

    try {
      const qTextEn = qData.question_text_en || qData.question_text;
      const qTextAf = qData.question_text_af || qTextEn;
      const topicEn = qData.topic_en || qData.topic || 'Accounting';
      const topicAf = qData.topic_af || topicEn;

      const insertQ = db.prepare(`
        INSERT INTO questions (
          paper_type, exam_type, topic_en, topic_af, subtopic_en, subtopic_af,
          difficulty, question_text_en, question_text_af, question_type, total_marks,
          explanation_en, explanation_af, working_solution_en, working_solution_af
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const info = insertQ.run(
        qData.paper_type,
        qData.exam_type,
        topicEn,
        topicAf,
        qData.subtopic_en || qData.subtopic || '',
        qData.subtopic_af || qData.subtopic_en || '',
        qData.difficulty || 'medium',
        qTextEn,
        qTextAf,
        qData.question_type || 'multi_field',
        qData.total_marks || 1,
        qData.explanation_en || qData.explanation || '',
        qData.explanation_af || qData.explanation_en || '',
        qData.working_solution_en || qData.working_solution || '',
        qData.working_solution_af || qData.working_solution_en || ''
      );

      const questionId = info.lastInsertRowid;

      const fields = Array.isArray(qData.fields) ? qData.fields : [];
      const insertField = db.prepare(`
        INSERT INTO answer_fields (
          question_id, field_name_en, field_name_af, field_label_en, field_label_af,
          answer_type, correct_answer, accepted_alternatives_json, tolerance, marks,
          explanation_en, explanation_af, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      fields.forEach((f, idx) => {
        insertField.run(
          questionId,
          f.field_name_en || f.label || `Field ${idx + 1}`,
          f.field_name_af || f.field_name_en || f.label || `Veld ${idx + 1}`,
          f.field_label_en || f.label || '',
          f.field_label_af || f.field_label_en || f.label || '',
          f.answer_type || 'number',
          String(f.correct_answer !== undefined ? f.correct_answer : f.answer || ''),
          JSON.stringify(f.accepted_alternatives || []),
          f.tolerance || 0,
          f.marks || 1,
          f.explanation_en || '',
          f.explanation_af || f.explanation_en || '',
          idx + 1
        );
      });

      successCount++;
    } catch (err) {
      errors.push({ item: rowNum, error: err.message });
    }
  });

  res.json({
    message: `Import processed. ${successCount} questions imported successfully.`,
    success_count: successCount,
    failed_count: errors.length,
    errors
  });
});

// Export all questions
router.get('/export', (req, res) => {
  const questions = db.prepare('SELECT * FROM questions').all();
  const getFields = db.prepare('SELECT * FROM answer_fields WHERE question_id = ? ORDER BY sort_order ASC');

  const exportData = questions.map(q => ({
    ...q,
    fields: getFields.all(q.id)
  }));

  res.json(exportData);
});

// Delete question
router.delete('/questions/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM questions WHERE id = ?').run(id);
  res.json({ message: 'Question deleted successfully' });
});

module.exports = router;
