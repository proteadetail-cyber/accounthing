const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { requireActiveAccess } = require('../middleware/authMiddleware');

// Apply access control middleware
router.use(requireActiveAccess);

// GET /api/questions - List questions filtered by paper_type, exam_type, topic, etc.
router.get('/', (req, res) => {
  const { paper_type, exam_type, topic, subtopic, difficulty, limit = 50 } = req.query;

  let query = 'SELECT id, paper_type, exam_type, topic_en, topic_af, subtopic_en, subtopic_af, difficulty, question_text_en, question_text_af, info_section_en, info_section_af, table_config_json, question_type, total_marks, created_at FROM questions WHERE 1=1';
  const params = [];

  if (paper_type) {
    query += ' AND paper_type = ?';
    params.push(paper_type);
  }
  if (exam_type) {
    query += ' AND exam_type = ?';
    params.push(exam_type);
  }
  if (topic) {
    query += ' AND (topic_en = ? OR topic_af = ?)';
    params.push(topic, topic);
  }
  if (difficulty) {
    query += ' AND difficulty = ?';
    params.push(difficulty);
  }

  query += ' ORDER BY id ASC LIMIT ?';
  params.push(parseInt(limit, 10));

  const questions = db.prepare(query).all(...params);

  // Fetch field summaries without answers
  const fieldStmt = db.prepare(`
    SELECT id, question_id, field_name_en, field_name_af, field_label_en, field_label_af, answer_type, marks, sort_order
    FROM answer_fields WHERE question_id = ? ORDER BY sort_order ASC
  `);

  const result = questions.map(q => {
    const fields = fieldStmt.all(q.id);
    return {
      ...q,
      fields
    };
  });

  res.json(result);
});

// GET /api/questions/:id - Fetch single question with field structure (NO ANSWERS EXPOSED)
router.get('/:id', (req, res) => {
  const qStmt = db.prepare('SELECT id, paper_type, exam_type, topic_en, topic_af, subtopic_en, subtopic_af, difficulty, question_text_en, question_text_af, info_section_en, info_section_af, table_config_json, question_type, total_marks FROM questions WHERE id = ?');
  const question = qStmt.get(req.params.id);

  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const fieldStmt = db.prepare(`
    SELECT id, question_id, field_name_en, field_name_af, field_label_en, field_label_af, answer_type, marks, sort_order
    FROM answer_fields WHERE question_id = ? ORDER BY sort_order ASC
  `);
  
  const fields = fieldStmt.all(question.id);

  res.json({
    ...question,
    fields
  });
});

module.exports = router;
