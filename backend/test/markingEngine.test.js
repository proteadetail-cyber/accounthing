const test = require('node:test');
const assert = require('node:assert');
const { evaluateQuestion, normalizeNumeric } = require('../services/markingEngine');

const field = (id, correct, extra = {}) => ({
  id, correct_answer: correct, marks: 1, answer_type: 'table_cell', tolerance: 0, field_name_en: `f${id}`, ...extra
});

test('parses accounting number formats', () => {
  assert.strictEqual(normalizeNumeric('R4 500 000'), 4500000);
  assert.strictEqual(normalizeNumeric('(450 000)'), -450000);
  assert.strictEqual(normalizeNumeric('−450000'), -450000);
  assert.strictEqual(normalizeNumeric('abc'), null);
  assert.strictEqual(normalizeNumeric(''), null);
});

test('marks numeric and text table cells', () => {
  const fields = [field(1, '-450000'), field(2, '2.05'), field(3, 'Unqualified'), field(4, 'King IV')];
  const r = evaluateQuestion(fields, { 1: '(450 000)', 2: '2.05', 3: ' unqualified ', 4: 'king  iv' });
  assert.strictEqual(r.marksEarned, 4);
  assert.strictEqual(r.percentage, 100);
});

test('wrong and blank answers score zero', () => {
  const fields = [field(1, '100'), field(2, 'No'), field(3, '5')];
  const r = evaluateQuestion(fields, { 1: '101', 2: 'Yes' });
  assert.strictEqual(r.marksEarned, 0);
  assert.strictEqual(r.totalMarks, 3);
});

test('keeps the declared question total when authored field weights differ', () => {
  const fields = [
    field(1, '100', { marks: 1 }),
    field(2, '200', { marks: 3 })
  ];
  const r = evaluateQuestion(fields, { 1: '100', 2: '200' }, 'en', 10);
  assert.strictEqual(r.marksEarned, 10);
  assert.strictEqual(r.totalMarks, 10);
  assert.strictEqual(r.percentage, 100);
});
