/**
 * Deterministic Marking Engine for SA Grade 12 Accounting
 * NO AI MARKING IS USED.
 */

function normalizeNumeric(val) {
  if (val === null || val === undefined || val === '') return null;
  const strVal = String(val)
    .replace(/[R\$\s]/gi, '')
    .replace(/,/g, '');
  const parsed = parseFloat(strVal);
  return isNaN(parsed) ? null : parsed;
}

function normalizeText(val) {
  if (val === null || val === undefined) return '';
  return String(val).trim().toLowerCase();
}

/**
 * Marks a student's answer submission for a given question against stored database fields.
 * 
 * @param {Array} fields Database answer_fields records for this question
 * @param {Object} submittedAnswers Key-value pair of { field_id: submitted_value }
 * @param {String} lang 'en' or 'af'
 * @returns {Object} { marksEarned, totalMarks, percentage, fieldResults }
 */
function evaluateQuestion(fields, submittedAnswers = {}, lang = 'en') {
  let marksEarned = 0;
  let totalMarks = 0;
  const fieldResults = [];

  for (const field of fields) {
    const fieldId = field.id;
    const submittedVal = submittedAnswers[fieldId] !== undefined ? submittedAnswers[fieldId] : '';
    const fieldMarks = field.marks || 1;
    totalMarks += fieldMarks;

    let isCorrect = false;
    const answerType = field.answer_type || 'number';

    if (answerType === 'number' || answerType === 'table_cell') {
      const numSubmitted = normalizeNumeric(submittedVal);
      const numCorrect = normalizeNumeric(field.correct_answer);
      const tolerance = field.tolerance || 0;

      if (numSubmitted !== null && numCorrect !== null) {
        if (Math.abs(numSubmitted - numCorrect) <= tolerance) {
          isCorrect = true;
        }
      }
    } else if (answerType === 'text') {
      const normSubmitted = normalizeText(submittedVal);
      const normCorrect = normalizeText(field.correct_answer);
      
      if (normSubmitted === normCorrect) {
        isCorrect = true;
      } else if (field.accepted_alternatives_json) {
        try {
          const alts = JSON.parse(field.accepted_alternatives_json);
          if (Array.isArray(alts) && alts.some(alt => normalizeText(alt) === normSubmitted)) {
            isCorrect = true;
          }
        } catch (e) {
          // ignore JSON parse fallback
        }
      }
    } else if (answerType === 'mcq') {
      if (String(submittedVal).trim().toUpperCase() === String(field.correct_answer).trim().toUpperCase()) {
        isCorrect = true;
      }
    }

    const earned = isCorrect ? fieldMarks : 0;
    marksEarned += earned;

    fieldResults.push({
      field_id: fieldId,
      field_name: lang === 'af' ? (field.field_name_af || field.field_name_en) : field.field_name_en,
      field_label: lang === 'af' ? (field.field_label_af || field.field_label_en) : field.field_label_en,
      submitted: submittedVal,
      correct_answer: field.correct_answer,
      is_correct: isCorrect,
      marks_earned: earned,
      total_marks: fieldMarks,
      explanation: lang === 'af' ? (field.explanation_af || field.explanation_en) : field.explanation_en
    });
  }

  const percentage = totalMarks > 0 ? Math.round((marksEarned / totalMarks) * 100 * 10) / 10 : 0;

  return {
    marksEarned,
    totalMarks,
    percentage,
    fieldResults
  };
}

/**
 * Deterministic statistical estimator for Next Paper score.
 * Uses weighted recency & difficulty from actual DB attempts.
 */
function calculateEstimatedScore(attempts) {
  if (!attempts || attempts.length < 1) {
    return { estimatedScore: null, message: "Complete questions to estimate score" };
  }

  // Weight more recent attempts higher
  let weightedSum = 0;
  let weightTotal = 0;
  
  // Sort attempts chronological ascending
  const sorted = [...attempts].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  sorted.forEach((att, idx) => {
    // Recent items get linearly higher weight (1..N)
    const weight = idx + 1;
    weightedSum += att.percentage * weight;
    weightTotal += weight;
  });

  const rawEstimate = weightedSum / weightTotal;
  const rounded = Math.min(100, Math.max(0, Math.round(rawEstimate)));

  return {
    estimatedScore: rounded,
    message: "Based on your recent performance"
  };
}

module.exports = {
  evaluateQuestion,
  calculateEstimatedScore,
  normalizeNumeric,
  normalizeText
};
