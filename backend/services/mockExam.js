const MOCK_EXAM_TOTAL_MARKS = 150;

function validateMockExamQuestions(questions, paperType) {
  if (questions.length === 0) {
    throw new Error('A mock exam must contain questions.');
  }

  const questionIds = new Set();
  for (const question of questions) {
    if (questionIds.has(question.id)) {
      throw new Error('A mock exam cannot contain the same question more than once.');
    }
    questionIds.add(question.id);

    if (question.paper_type !== paperType) {
      throw new Error('All mock exam questions must belong to the selected paper.');
    }
  }

  const totalMarks = questions.reduce((sum, question) => sum + question.total_marks, 0);
  if (totalMarks !== MOCK_EXAM_TOTAL_MARKS) {
    throw new Error(`A mock exam must total exactly ${MOCK_EXAM_TOTAL_MARKS} marks; received ${totalMarks}.`);
  }
}

module.exports = { MOCK_EXAM_TOTAL_MARKS, validateMockExamQuestions };
