import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Question, AttemptResult, PaperType } from '../types';
import { 
  CheckCircle2, XCircle, HelpCircle, ArrowRight, 
  RotateCcw, Sparkles, FileText, Award, Layers, BookOpen 
} from 'lucide-react';

interface PracticeModeProps {
  initialPaper?: PaperType;
  initialTopic?: string;
  practiceMode?: string;
  selectedQuestionId?: number;
  onFinish?: () => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({ initialPaper, initialTopic, practiceMode, selectedQuestionId }) => {
  const { paperType, glassClass, accentColor, accentBorder } = useTheme();
  const { t, language } = useLanguage();
  const { student, token } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, [paperType, initialTopic, practiceMode, selectedQuestionId]);

  const loadQuestions = async () => {
    setLoading(true);
    setResult(null);
    setUserAnswers({});
    try {
      let url = `/api/questions?paper_type=${paperType}`;
      if (initialTopic) url += `&topic=${encodeURIComponent(initialTopic)}`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Questions request failed: ${res.status}`);
      const data: Question[] = await res.json();
      setQuestions(data);
      if (selectedQuestionId) {
        const idx = data.findIndex(q => q.id === selectedQuestionId);
        if (idx !== -1) setCurrentIndex(idx);
        else setCurrentIndex(0);
      } else {
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Failed to load practice questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentIndex];

  const handleInputChange = (fieldId: number, val: string) => {
    setUserAnswers(prev => ({ ...prev, [fieldId]: val }));
  };

  const handleSubmit = async () => {
    if (!currentQ || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/attempts/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: student?.id || 1,
          question_id: currentQ.id,
          submitted_answers: userAnswers,
          lang: language
        })
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setResult(null);
    setUserAnswers({});
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      loadQuestions();
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center space-y-3">
        <span className="text-sm font-mono font-bold text-slate-950 uppercase tracking-widest bg-[#EBE7DF] px-6 py-3 rounded-2xl border border-slate-300 shadow-sm">
          {language === 'af' ? 'Laai Eksamenvraestel...' : 'Loading Examination Paper...'}
        </span>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="max-w-3xl mx-auto my-12 p-8 rock-panel-paper1 rounded-3xl text-center space-y-4">
        <FileText className="w-12 h-12 text-slate-950 mx-auto" />
        <h2 className="text-xl font-extrabold text-slate-950">
          {language === 'af' ? 'Geen Vrae Beskikbaar Nie' : 'No Questions Available'}
        </h2>
        <p className="text-sm text-slate-800 font-mono font-bold">
          {language === 'af' 
            ? `Geen oefenvrae gevind vir ${paperType === 'paper_1' ? 'Vraestel 1' : 'Vraestel 2'} nie.` 
            : `No practice questions found for ${paperType === 'paper_1' ? 'Paper 1' : 'Paper 2'}.`}
        </p>
        <button
          onClick={loadQuestions}
          className="px-6 py-2.5 rounded-xl font-mono text-xs font-bold uppercase bg-slate-950 text-white hover:bg-slate-800 transition-all shadow-md"
        >
          {language === 'af' ? 'Herlaai Vrae' : 'Reload Questions'}
        </button>
      </div>
    );
  }

  const topicName = language === 'af' ? currentQ.topic_af : currentQ.topic_en;
  const questionText = language === 'af' ? currentQ.question_text_af : currentQ.question_text_en;
  const isPaper1 = paperType === 'paper_1';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Question Exam Header Card */}
      <div className={`${glassClass} p-6 sm:p-8 rounded-3xl space-y-6`}>
        
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300/80 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-950 text-white shadow-sm">
              {language === 'af' ? `Vraag ${currentIndex + 1} van ${questions.length}` : `Question ${currentIndex + 1} of ${questions.length}`}
            </span>
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-950 text-white shadow-sm">
              {language === 'af' ? (isPaper1 ? 'Vraestel 1' : 'Vraestel 2') : (isPaper1 ? 'Paper 1' : 'Paper 2')} • {currentQ.exam_type.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-slate-950 font-bold">
            <span>{language === 'af' ? 'Moeilikheidsgraad:' : 'Difficulty:'} <strong className="text-slate-950 uppercase font-extrabold">{currentQ.difficulty}</strong></span>
            <span>•</span>
            <span className="text-amber-800 font-extrabold">{currentQ.total_marks} {language === 'af' ? 'PUNTE' : 'MARKS'}</span>
          </div>
        </div>

        {/* Topic Title */}
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-800 font-bold flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-800" />
            {topicName}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 leading-relaxed">
            {questionText}
          </h2>
        </div>

        {/* EXAM INFORMATION SHEET & TRANSACTIONS (INLIGTING) */}
        {(currentQ.info_section_en || currentQ.info_section_af) && (
          <div className="p-5 rounded-2xl bg-[#EBE7DF] border-2 border-slate-900 space-y-3 font-mono text-xs shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-400 pb-2">
              <span className="font-extrabold text-slate-950 uppercase flex items-center gap-2 text-xs">
                <BookOpen className="w-4 h-4 text-cyan-800" />
                {language === 'af' ? 'EKSAMEN INLIGTINGSBLAD (INLIGTING A & TRANSAKSIES)' : 'EXAM INFORMATION SHEET (INFORMATION A & TRANSACTIONS)'}
              </span>
              <span className="text-[11px] font-extrabold bg-slate-950 text-white px-2.5 py-0.5 rounded-md uppercase">
                {language === 'af' ? 'GAUTENG NSC VRAESTEL' : 'GAUTENG NSC PAST PAPER'}
              </span>
            </div>
            <pre className="whitespace-pre-wrap break-words font-mono text-xs sm:text-sm leading-relaxed p-4 bg-white/80 rounded-xl border border-slate-300 text-slate-950 font-bold shadow-inner overflow-hidden">
              {language === 'af' ? currentQ.info_section_af || currentQ.info_section_en : currentQ.info_section_en}
            </pre>
          </div>
        )}

        {/* Answering Table / Inputs (Official NSC Grade 12 Accounting Exam Sheet Style) */}
        <div className="space-y-4 pt-2">
          {currentQ.table_config_json ? (
            (() => {
              try {
                const config = JSON.parse(currentQ.table_config_json);
                const cols = language === 'af' ? config.columns_af : config.columns_en;
                const title = language === 'af' ? config.title_af : config.title_en;

                return (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-mono uppercase tracking-wider text-slate-950 font-extrabold flex items-center justify-between">
                      <span>{title}</span>
                      <span className="text-[11px] text-slate-800 font-mono font-bold bg-slate-300 px-2 py-0.5 rounded">
                        {language === 'af' ? 'ANTWOORDEBOEK TEMPLAAT' : 'ANSWER BOOK TEMPLATE'}
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border-2 border-slate-900 bg-[#EBE7DF] shadow-md">
                      <table className="w-full text-left border-collapse font-sans text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-slate-950 text-white font-mono uppercase tracking-wider">
                            {cols.map((col: string, idx: number) => (
                              <th key={idx} className="p-3 border-r border-slate-800 last:border-r-0 font-extrabold">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {config.rows.map((row: any, rIdx: number) => {
                            const rowLabel = language === 'af' ? row.label_af : row.label_en;
                            if (row.isHeader) {
                              return (
                                <tr key={row.id || rIdx} className="bg-slate-300/80 font-bold border-b border-slate-400">
                                  <td colSpan={cols.length} className="p-2.5 font-extrabold uppercase text-slate-950 text-xs">
                                    {rowLabel}
                                  </td>
                                </tr>
                              );
                            }

                            return (
                              <tr key={row.id || rIdx} className={`border-b border-slate-300/80 hover:bg-[#E2DCD0] transition-colors ${row.isTotalRow ? 'bg-slate-300/90 font-extrabold border-t-2 border-b-4 border-slate-900' : ''}`}>
                                <td className="p-3 font-semibold text-slate-950 border-r border-slate-300/80">
                                  <div>
                                    <span>{rowLabel}</span>
                                    {(row.note_en || row.note_af) && (
                                      <div className="text-[11px] font-mono text-slate-600 font-normal italic">
                                        {language === 'af' ? row.note_af : row.note_en}
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {row.fields?.map((f: any, fIdx: number) => {
                                  if (f.readOnly) {
                                    return (
                                      <td key={fIdx} className="p-2 border-r border-slate-300/80 last:border-r-0 text-center font-mono font-extrabold text-slate-700 bg-slate-200/50">
                                        {f.staticValue || '-'}
                                      </td>
                                    );
                                  }

                                  const matchedQField = currentQ.fields.find(qf => qf.field_name_en === f.field_name || qf.field_name_af === f.field_name);
                                  if (!matchedQField) {
                                    return <td key={fIdx} className="p-2 border-r border-slate-300/80 last:border-r-0 text-center text-slate-400">-</td>;
                                  }

                                  const isEvaluated = result !== null;
                                  const fieldRes = result?.field_results.find(r => r.field_id === matchedQField.id);

                                  return (
                                    <td key={fIdx} className="p-2 border-r border-slate-300/80 last:border-r-0 min-w-[130px]">
                                      <div className="relative flex items-center">
                                        <input
                                          type="text"
                                          value={userAnswers[matchedQField.id] || ''}
                                          onChange={(e) => handleInputChange(matchedQField.id, e.target.value)}
                                          disabled={isEvaluated || isSubmitting}
                                          placeholder={language === 'af' ? 'Voer bedrag in...' : 'Enter amount...'}
                                          className={`w-full px-3 py-2 rounded-xl bg-white text-slate-950 font-black text-black text-xs sm:text-sm font-mono tracking-wider focus:ring-2 focus:outline-none transition-all placeholder:text-slate-400/40 ${
                                            fieldRes?.is_correct === true
                                              ? 'border-2 border-emerald-600 bg-emerald-50 text-emerald-950'
                                              : fieldRes?.is_correct === false
                                              ? 'border-2 border-rose-600 bg-rose-50 text-rose-950'
                                              : 'border border-slate-400 focus:border-cyan-600'
                                          }`}
                                        />
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              } catch (err) {
                console.error('Failed to parse table_config_json:', err);
                return null;
              }
            })()
          ) : (
            <>
              <div className="text-xs font-mono uppercase tracking-wider text-slate-950 font-extrabold">
                {language === 'af' ? 'ANTWOORDEBLAD — VOER JOU WAARDES HIERONDER IN:' : 'ANSWER SHEET — ENTER YOUR VALUES BELOW:'}
              </div>

              <div className="space-y-3 bg-[#DFD9CD] p-4 sm:p-6 rounded-2xl border border-slate-300/80">
                {currentQ.fields.map((field, idx) => {
                  const fieldLabel = language === 'af' ? (field.field_label_af || field.field_name_af) : (field.field_label_en || field.field_name_en);
                  const isEvaluated = result !== null;
                  const fieldRes = result?.field_results.find(r => r.field_id === field.id);
                  const isBigField = field.marks > 3;

                  if (isBigField) {
                    return (
                      <div key={field.id} className="flex flex-col gap-2 p-4 rounded-xl bg-[#EBE7DF] hover:bg-[#E0DACF] border border-slate-300/80 transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-slate-950 flex items-center justify-center text-xs font-mono font-bold text-white shadow-sm">
                              {idx + 1}
                            </span>
                            <span className="text-sm font-extrabold text-slate-950">
                              {fieldLabel}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-extrabold text-cyan-900 bg-cyan-100 px-2.5 py-0.5 rounded border border-cyan-300 uppercase">
                              {language === 'af' ? `BEWERKINGS / BEREKENINGSBLOK (${field.marks} PUNTE)` : `WORKING / CALCULATION BLOCK (${field.marks} MARKS)`}
                            </span>
                            <span className="text-xs font-mono text-slate-950 font-extrabold">
                              [{field.marks}m]
                            </span>
                          </div>
                        </div>

                        <textarea
                          rows={4}
                          value={userAnswers[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          disabled={isEvaluated || isSubmitting}
                          placeholder={language === 'af' ? 'Wys alle berekeninge, bewerkings en finale antwoord...' : 'Show all calculations, workings, and final answer...'}
                          className={`w-full p-3 rounded-xl bg-white text-slate-950 font-black text-black placeholder-slate-400/40 text-sm font-mono tracking-wider focus:ring-2 focus:outline-none shadow-inner ${
                            fieldRes?.is_correct === true
                              ? 'border-2 border-emerald-600 bg-emerald-50 text-emerald-950'
                              : fieldRes?.is_correct === false
                              ? 'border-2 border-rose-600 bg-rose-50 text-rose-950'
                              : 'border border-slate-400'
                          }`}
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={field.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#EBE7DF] hover:bg-[#E0DACF] border border-slate-300/80 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-950 flex items-center justify-center text-xs font-mono font-bold text-white shadow-sm">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-extrabold text-slate-950">
                          {fieldLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-64">
                        <input
                          type={field.answer_type === 'number' ? 'text' : 'text'}
                          value={userAnswers[field.id] || ''}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          disabled={isEvaluated || isSubmitting}
                          placeholder={language === 'af' ? 'Voer antwoord in...' : 'Enter answer...'}
                          className={`w-full px-4 py-2.5 rounded-xl bg-white text-slate-950 font-black text-black placeholder-slate-400/40 text-sm font-mono tracking-wider focus:ring-2 focus:outline-none ${
                            fieldRes?.is_correct === true
                              ? 'border-2 border-emerald-600 bg-emerald-50 text-emerald-950'
                              : fieldRes?.is_correct === false
                              ? 'border-2 border-rose-600 bg-rose-50 text-rose-950'
                              : 'border border-slate-400'
                          }`}
                        />
                        <span className="text-xs font-mono text-slate-950 min-w-[50px] text-right font-extrabold">
                          [{field.marks}m]
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Submit / Action Button */}
        {!result ? (
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || Object.keys(userAnswers).length === 0}
              className="px-8 py-4 rounded-2xl font-mono font-bold text-xs tracking-widest uppercase transition-all duration-300 bg-slate-950 hover:bg-slate-800 text-white shadow-xl active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? t('submitting') : t('check_answer')}</span>
            </button>
          </div>
        ) : null}

      </div>

      {/* Result Panel Reveal */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`p-6 sm:p-8 rounded-3xl ${glassClass} space-y-6`}
          >
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300/80 pb-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-slate-800 font-extrabold">
                  {language === 'af' ? 'DETERMINISTIESE EVALUERINGSUITSLAG' : 'DETERMINISTIC EVALUATION RESULT'}
                </span>
                <h3 className="text-3xl font-extrabold text-slate-950 font-mono mt-1">
                  {result.marks_earned} / {result.total_marks} {language === 'af' ? 'Punte' : 'Marks'} ({result.percentage}%)
                </h3>
              </div>

              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-xl font-mono text-xs font-bold tracking-wider uppercase bg-slate-950 text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>{t('next_question')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Field breakdown list */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-950 font-extrabold">
                {language === 'af' ? 'STAP-VIR-STAP NASIENUITEENSETTING:' : 'STEP-BY-STEP MARKING BREAKDOWN:'}
              </h4>

              {result.field_results.map((fr, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    fr.is_correct 
                      ? 'bg-emerald-100/90 border-emerald-400 text-emerald-950' 
                      : 'bg-rose-100/90 border-rose-400 text-rose-950'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {fr.is_correct ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-700 shrink-0" />
                      )}
                      <div>
                        <div className="text-sm font-extrabold text-slate-950">
                          {fr.field_name}
                        </div>
                        <div className="text-xs font-mono text-slate-900 font-bold mt-0.5">
                          {t('your_answer')}: <code className="text-slate-950 font-extrabold">{fr.submitted || (language === 'af' ? 'Skoon' : 'Blank')}</code>
                          {!fr.is_correct && (
                            <span className="ml-3 text-emerald-900 font-extrabold">
                              • {t('correct_answer')}: <code className="font-extrabold">{fr.correct_answer}</code>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className={`text-xs font-mono font-extrabold px-2.5 py-1 rounded-lg ${
                      fr.is_correct ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'
                    }`}>
                      {fr.marks_earned} / {fr.total_marks} m
                    </span>
                  </div>

                  {fr.explanation && (
                    <div className="mt-3 pt-3 border-t border-slate-300/80 text-xs text-slate-900 flex items-start gap-2 font-medium">
                      <HelpCircle className="w-4 h-4 text-cyan-800 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-cyan-900 uppercase font-mono font-extrabold">{t('why')}:</strong> {fr.explanation}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Working solution box */}
            {result.working_solution && (
              <div className="p-4 rounded-2xl bg-[#DFD9CD] border border-slate-300/80 space-y-1">
                <span className="text-xs font-mono text-cyan-900 uppercase font-extrabold">
                  {language === 'af' ? 'AMPTELIKE BEWERKINGSOPLOSSING:' : 'OFFICIAL WORKING SOLUTION:'}
                </span>
                <p className="text-xs text-slate-950 font-mono leading-relaxed whitespace-pre-wrap font-bold">
                  {result.working_solution}
                </p>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
