const test = require('node:test');
const assert = require('node:assert');
const { validateMockExamQuestions } = require('../services/mockExam');

const questions = [
  { id: 1, paper_type: 'paper_1', total_marks: 60 },
  { id: 2, paper_type: 'paper_1', total_marks: 35 },
  { id: 3, paper_type: 'paper_1', total_marks: 35 },
  { id: 4, paper_type: 'paper_1', total_marks: 20 }
];

test('accepts a distinct mock paper totaling exactly 150 marks', () => {
  assert.doesNotThrow(() => validateMockExamQuestions(questions, 'paper_1'));
});

test('rejects repeated questions in a mock paper', () => {
  assert.throws(
    () => validateMockExamQuestions([...questions.slice(0, 3), questions[0]], 'paper_1'),
    /same question more than once/
  );
});

test('rejects mock papers that do not total 150 marks', () => {
  assert.throws(
    () => validateMockExamQuestions(questions.slice(0, 3), 'paper_1'),
    /exactly 150 marks/
  );
});

test('rejects questions from another paper', () => {
  const mixedPaper = [...questions.slice(0, 3), { ...questions[3], paper_type: 'paper_2' }];
  assert.throws(
    () => validateMockExamQuestions(mixedPaper, 'paper_1'),
    /selected paper/
  );
});
