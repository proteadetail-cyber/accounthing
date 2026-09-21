import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Question, PaperType } from '../types';
import { 
  Clock, AlertCircle, CheckCircle2, ShieldCheck, 
  ArrowRight, ArrowLeft, Send, Award, FileSpreadsheet, BookOpen 
} from 'lucide-react';

export const MockExam: React.FC = () => {
  const { paperType, glassClass, accentColor, showFormulaTitles } = useTheme();
  const { t, language } = useLanguage();
  const { student, token } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [examType, setExamType] = useState<'prelims' | 'final'>('final');
  const [answers, setAnswers] = useState<Record<number, Record<number, string>>>({});
  const [timeLeft, setTimeLeft] = useState(7200); // 120 minutes (2 Hours for 150 Marks)
  const [isExamActive, setIsExamActive] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInfoBooklet, setShowInfoBooklet] = useState(false);
  const [showFormulaSheet, setShowFormulaSheet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);

  useEffect(() => {
    let timer: any;
    if (isExamActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isExamActive) {
      handleFinalSubmit();
    }
    return () => clearInterval(timer);
  }, [isExamActive, timeLeft]);

  const [selectedSet, setSelectedSet] = useState<number>(1);

  const startExam = async () => {
    try {
      const res = await fetch(`/api/questions?paper_type=${paperType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Questions request failed: ${res.status}`);
      const data = await res.json();
      const startIdx = (selectedSet - 1) * 4;
      const setQs = data.slice(startIdx, startIdx + 4);
      setQuestions(setQs.length > 0 ? setQs : data.slice(0, 4));
      setCurrentIndex(0);
      setAnswers({});
      setExamResult(null);
      setTimeLeft(7200);
      setIsExamActive(true);
    } catch (err) {
      console.error('Failed to start mock exam:', err);
    }
  };

  const handleInputChange = (questionId: number, fieldId: number, val: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [fieldId]: val
      }
    }));
  };

  const handleFinalSubmit = async () => {
    setShowConfirm(false);
    setIsSubmitting(true);

    const submissions = questions.map(q => ({
      question_id: q.id,
      submitted_answers: answers[q.id] || {}
    }));

    try {
      const res = await fetch('/api/attempts/mock-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: student?.id || 1,
          paper_type: paperType,
          exam_type: 'final',
          submissions,
          duration_seconds: 7200 - timeLeft,
          lang: language
        })
      });

      const data = await res.json();
      setExamResult(data);
      setIsExamActive(false);
    } catch (err) {
      console.error('Failed to submit mock exam:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isPaper1 = paperType === 'paper_1';

  // Screen 1: Start Screen
  if (!isExamActive && !examResult) {
    return (
      <div className="max-w-2xl mx-auto my-12 px-4">
        <div className={`${glassClass} p-8 rounded-3xl space-y-6 text-center`}>
          <div className="w-16 h-16 rounded-2xl bg-[#DFD9CD] mx-auto flex items-center justify-center text-slate-950 border border-slate-300 shadow-sm">
            <FileSpreadsheet className="w-8 h-8 text-slate-950" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-950 font-extrabold">
              {language === 'af' 
                ? 'GESIMULEERDE EKSAMENOMGEWING (150 PUNTE • 2 UUR)' 
                : 'SIMULATED EXAMINATION ENVIRONMENT (150 MARKS • 2 HOURS)'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-heading">
              {language === 'af'
                ? (isPaper1 ? 'Vraestel 1 Proefeksamen' : 'Vraestel 2 Proefeksamen')
                : (isPaper1 ? 'Paper 1 Mock Exam' : 'Paper 2 Mock Exam')}
            </h2>
            <p className="text-sm text-slate-950 font-bold leading-relaxed">
              {language === 'af'
                ? 'Ervaar n outentieke Suid-Afrikaanse Graad 12 Rekeningkunde-eksamen onder getimede toestande (150 Punte, 120 Minute). Insluitend Vraestel & Inligtingsboekie.'
                : 'Experience an authentic South African Grade 12 Accounting exam under timed conditions (150 Marks, 120 Minutes). Includes Question Paper & Info Booklet.'}
            </p>
          </div>

          {/* Exam Set Selector (4 Full Sets = 600m per Paper) */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-mono text-slate-700 font-extrabold uppercase block">
              {language === 'af' ? 'KIES EKSAMENVRAESTEL REEKS (150 PUNTE ELK):' : 'SELECT NSC EXAM PAPER SET (150 MARKS EACH):'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((setNum) => (
                <button
                  key={setNum}
                  type="button"
                  onClick={() => setSelectedSet(setNum)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-mono font-extrabold uppercase transition-all border ${
                    selectedSet === setNum
                      ? 'bg-slate-950 text-white border-slate-950 shadow-md'
                      : 'bg-[#DFD9CD] text-slate-900 border-slate-300 hover:bg-[#D4CDBE]'
                  }`}
                >
                  {language === 'af' ? `Reeks ${setNum}` : `Set ${setNum}`}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startExam}
            className={`w-full py-4 rounded-2xl font-mono text-xs font-extrabold tracking-widest uppercase text-white transition-all shadow-md ${
              isPaper1 
                ? 'bg-cyan-700 hover:bg-cyan-800' 
                : 'bg-rose-700 hover:bg-rose-800'
            }`}
          >
            {language === 'af' 
              ? `BEGIN 150-PUNT EKSAMEN (REEKS ${selectedSet})` 
              : `START 150-MARK MOCK EXAM (SET ${selectedSet})`}
          </button>
        </div>
      </div>
    );
  }

  // Screen 2: Exam Completed Report
  if (examResult) {
    return (
      <div className="max-w-3xl mx-auto my-8 px-4 space-y-6">
        <div className={`${glassClass} p-8 rounded-3xl space-y-6 text-center`}>
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-900 mx-auto flex items-center justify-center border border-emerald-300">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-900 font-extrabold">
              {t('exam_completed')}
            </span>
            <h2 className="text-4xl font-extrabold text-slate-950 font-mono mt-1">
              {examResult.score} / {examResult.total_marks} {language === 'af' ? 'Punte' : 'Marks'} ({examResult.percentage}%)
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 text-left border-y border-slate-300/80">
            <div>
              <span className="text-[11px] font-mono text-slate-700 uppercase font-bold">
                {language === 'af' ? 'Eksamenvraestel' : 'Exam Paper'}
              </span>
              <div className="text-sm font-extrabold text-slate-950 uppercase font-mono">
                {language === 'af' ? (isPaper1 ? 'Vraestel 1' : 'Vraestel 2') : examResult.paper_type} ({examResult.exam_type})
              </div>
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-700 uppercase font-bold">
                {language === 'af' ? 'Tydsduur' : 'Duration'}
              </span>
              <div className="text-sm font-extrabold text-slate-950 font-mono">{formatTimer(examResult.duration_seconds)}</div>
            </div>
          </div>

          <button
            onClick={() => setExamResult(null)}
            className="px-8 py-3 rounded-xl font-mono text-xs font-bold uppercase bg-slate-950 text-white hover:bg-slate-800 transition-all shadow-lg"
          >
            {language === 'af' ? 'KEER TERUG NA PROEFEKSAMENS' : 'RETURN TO MOCK EXAMS'}
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  if (!currentQ) return null;

  const topicName = language === 'af' ? currentQ.topic_af : currentQ.topic_en;
  const questionText = language === 'af' ? currentQ.question_text_af : currentQ.question_text_en;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Exam Header bar with Timer & Info Booklet & Navigation */}
      <div className={`${glassClass} p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-lg bg-slate-950 text-xs font-mono font-bold text-white uppercase">
            {language === 'af' ? `V${currentIndex + 1} van ${questions.length}` : `Q${currentIndex + 1} of ${questions.length}`}
          </span>
          <span className="text-xs font-mono text-slate-950 font-extrabold hidden sm:inline">{topicName}</span>
        </div>

        {/* Question Paper, Info Booklet & Formula Sheet Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfoBooklet(true)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-extrabold uppercase text-white transition-all shadow-md ${
              isPaper1 ? 'bg-cyan-900 hover:bg-cyan-800' : 'bg-rose-900 hover:bg-rose-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>{language === 'af' ? 'VOLLEDIGE BOEKIE' : 'FULL BOOKLET'}</span>
          </button>
          
          <button
            onClick={() => setShowFormulaSheet(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-extrabold uppercase bg-slate-800 hover:bg-slate-700 text-white transition-all shadow-md border border-slate-500"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-300" />
            <span>{language === 'af' ? 'FORMULES' : 'FORMULAS'}</span>
          </button>
        </div>

        {/* Timer display */}
        <div className="flex items-center gap-2 font-mono text-sm font-bold px-4 py-1.5 rounded-xl bg-amber-100 text-amber-950 border border-amber-300">
          <Clock className="w-4 h-4 animate-pulse text-amber-800" />
          <span>{formatTimer(timeLeft)}</span>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          className="px-4 py-2 rounded-xl font-mono text-xs font-extrabold uppercase bg-rose-700 hover:bg-rose-800 text-white transition-all shadow-sm"
        >
          {t('submit_exam')}
        </button>
      </div>

      {/* Main Question Answer Sheet */}
      <div className={`${glassClass} p-6 sm:p-8 rounded-3xl space-y-6`}>
        <div className="flex justify-between items-center text-xs font-mono text-slate-950 border-b border-slate-300/80 pb-3 font-extrabold">
          <span>
            {language === 'af'
              ? (isPaper1 ? 'VRAESTEL 1 PROEF-OMGEWING (150 PUNTE TOTAAL)' : 'VRAESTEL 2 PROEF-OMGEWING (150 PUNTE TOTAAL)')
              : (isPaper1 ? 'PAPER 1 MOCK ENVIRONMENT (150 MARKS TOTAL)' : 'PAPER 2 MOCK ENVIRONMENT (150 MARKS TOTAL)')}
          </span>
          <span className="text-amber-900 font-extrabold">{currentQ.total_marks} {language === 'af' ? 'PUNTE' : 'MARKS'}</span>
        </div>

        <h3 className="text-xl font-extrabold text-slate-950 leading-relaxed">
          {questionText}
        </h3>

        {/* EXAM INFORMATION SHEET & TRANSACTIONS (INLIGTING) */}
        {(currentQ.info_section_en || currentQ.info_section_af) && (
          <div className="p-5 rounded-2xl bg-[#EBE7DF] border-2 border-slate-900 space-y-3 font-mono text-xs shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-400 pb-2">
              <span className="font-extrabold text-slate-950 uppercase flex items-center gap-2 text-xs">
                <BookOpen className="w-4 h-4 text-cyan-800" />
                {language === 'af' ? 'EKSAMEN INLIGTINGSBLAD (INLIGTING A & TRANSAKSIES)' : 'EXAM INFORMATION SHEET (INFORMATION A & TRANSACTIONS)'}
              </span>
              <button
                onClick={() => setShowInfoBooklet(true)}
                className="text-[11px] font-extrabold bg-slate-950 hover:bg-slate-800 text-white px-2.5 py-0.5 rounded-md flex items-center gap-1"
              >
                <span>{language === 'af' ? 'MAAK VOLLEDIGE BOEKIE OOP' : 'OPEN FULL BOOKLET'}</span>
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-words font-mono text-xs sm:text-sm leading-relaxed p-4 bg-white/80 rounded-xl border border-slate-300 text-slate-950 font-bold shadow-inner overflow-hidden">
              {language === 'af' ? currentQ.info_section_af || currentQ.info_section_en : currentQ.info_section_en}
            </pre>
          </div>
        )}

        {/* Answering Table / Inputs */}
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

                                  const val = answers[currentQ.id]?.[matchedQField.id] || '';
                                  const isBigField = matchedQField.marks > 3;

                                  return (
                                    <td key={fIdx} className="p-2 border-r border-slate-300/80 last:border-r-0 min-w-[140px]">
                                      <div className="relative flex items-center">
                                        {isBigField ? (
                                          <textarea
                                            rows={3}
                                            value={val}
                                            onChange={(e) => handleInputChange(currentQ.id, matchedQField.id, e.target.value)}
                                            placeholder={language === 'af' ? 'Wys berekeninge & voer bedrag in...' : 'Show calculations & enter amount...'}
                                            className="w-full p-2.5 rounded-xl bg-white text-slate-950 font-black text-black text-xs font-mono tracking-wider border border-slate-400 focus:ring-2 focus:ring-slate-950 focus:outline-none transition-all shadow-inner placeholder:text-slate-400/40"
                                          />
                                        ) : (
                                          <input
                                            type="text"
                                            value={val}
                                            onChange={(e) => handleInputChange(currentQ.id, matchedQField.id, e.target.value)}
                                            placeholder={language === 'af' ? 'Voer bedrag in...' : 'Enter amount...'}
                                            className="w-full px-3 py-2 rounded-xl bg-white text-slate-950 font-black text-black text-xs sm:text-sm font-mono tracking-wider border border-slate-400 focus:ring-2 focus:ring-slate-950 focus:outline-none transition-all placeholder:text-slate-400/40"
                                          />
                                        )}
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
                console.error('Failed to parse table_config_json in MockExam:', err);
                return null;
              }
            })()
          ) : (
            <div className="space-y-3 bg-[#DFD9CD] p-4 sm:p-6 rounded-2xl border border-slate-300/80">
              {currentQ.fields.map((field, idx) => {
                const fieldLabel = language === 'af' ? (field.field_label_af || field.field_name_af) : (field.field_label_en || field.field_name_en);
                const val = answers[currentQ.id]?.[field.id] || '';
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
                          <span className="text-[11px] font-mono font-extrabold text-cyan-900 bg-cyan-100 px-2 py-0.5 rounded border border-cyan-300">
                            {language === 'af' ? `BEWERKINGS / BEREKENINGSBLOK (${field.marks} PUNTE)` : `WORKING / CALCULATION BLOCK (${field.marks} MARKS)`}
                          </span>
                          <span className="text-xs font-mono text-slate-950 font-extrabold">
                            [{field.marks}m]
                          </span>
                        </div>
                      </div>

                      <textarea
                        rows={4}
                        value={val}
                        onChange={(e) => handleInputChange(currentQ.id, field.id, e.target.value)}
                        placeholder={language === 'af' ? 'Wys alle bewerkings, berekeninge en finale waarde...' : 'Show all workings, calculations, and final value...'}
                        className="w-full p-3 rounded-xl bg-white text-slate-950 font-black text-black text-sm font-mono tracking-wider border border-slate-400 focus:ring-2 focus:ring-slate-950 focus:outline-none shadow-inner placeholder:text-slate-400/40"
                      />
                    </div>
                  );
                }

                return (
                  <div key={field.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#EBE7DF] hover:bg-[#E0DACF] border border-slate-300/80 transition-all duration-200">
                    <span className="text-sm font-extrabold text-slate-950">
                      {idx + 1}. {fieldLabel} [{field.marks}m]
                    </span>

                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleInputChange(currentQ.id, field.id, e.target.value)}
                      placeholder={language === 'af' ? 'Voer waarde in...' : 'Enter value...'}
                      className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-white text-slate-950 font-black text-black placeholder-slate-400/40 text-sm font-mono tracking-wider border border-slate-400 focus:ring-2 focus:ring-slate-950 focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-300/80">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase bg-slate-950 text-white disabled:opacity-30 flex items-center gap-2 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'af' ? 'Vorige' : 'Previous'}</span>
          </button>

          <button
            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            disabled={currentIndex === questions.length - 1}
            className="px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase bg-slate-950 text-white disabled:opacity-30 flex items-center gap-2 shadow-sm"
          >
            <span>{language === 'af' ? 'Volgende' : 'Next'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PEEKING LEFT SIDE FOLDER TAB 1: FULL BOOKLET (MATCHES PAPER COLOR) */}
      {!showInfoBooklet && !showFormulaSheet && isExamActive && (
        <motion.div
          initial={{ x: -10 }}
          animate={{ x: 0 }}
          className="fixed left-0 top-[26%] z-40 flex items-center group cursor-pointer"
          onClick={() => setShowInfoBooklet(true)}
        >
          {/* Peeking Edge Folder Flap (Cyan for Paper 1, Rose for Paper 2) */}
          <div className={`relative border-y-2 border-r-2 text-white py-6 px-3.5 rounded-r-2xl shadow-2xl flex flex-col items-center gap-3 transition-all duration-300 group-hover:pl-5 group-hover:border-white ${
            isPaper1 
              ? 'bg-cyan-800 hover:bg-cyan-700 border-cyan-300 group-hover:shadow-cyan-600/30' 
              : 'bg-rose-800 hover:bg-rose-700 border-amber-300 group-hover:shadow-rose-600/30'
          }`}>
            <BookOpen className="w-5 h-5 text-amber-300 animate-pulse" />
            
            {/* Folder Label */}
            <span 
              className="text-[11px] font-mono font-black uppercase tracking-widest text-white whitespace-nowrap"
              style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
            >
              {language === 'af' ? 'VOLLEDIGE BOEKIE' : 'FULL BOOKLET'}
            </span>

            <div className="w-2 h-2 rounded-full bg-amber-300 animate-ping mt-1" />
          </div>

          {/* Hover Tooltip Flap */}
          <div className={`hidden group-hover:flex items-center ml-2 px-3 py-1.5 text-white font-mono text-[11px] font-bold rounded-lg shadow-xl border whitespace-nowrap ${
            isPaper1 ? 'bg-cyan-950 border-cyan-400' : 'bg-rose-950 border-rose-400'
          }`}>
            {language === 'af' ? 'Maak Vraestel & Inligtingsboekie oop' : 'Open Question Paper & Info Booklet'}
          </div>
        </motion.div>
      )}

      {/* PEEKING LEFT SIDE FOLDER TAB 2: FORMULA SHEET (DARK GREY FOLDER) */}
      {!showInfoBooklet && !showFormulaSheet && isExamActive && (
        <motion.div
          initial={{ x: -10 }}
          animate={{ x: 0 }}
          className="fixed left-0 top-[calc(26%+170px)] z-40 flex items-center group cursor-pointer"
          onClick={() => setShowFormulaSheet(true)}
        >
          {/* Peeking Edge Folder Flap (DARK GREY Style) */}
          <div className="relative bg-slate-800 hover:bg-slate-700 border-y-2 border-r-2 border-slate-400 text-white py-6 px-3.5 rounded-r-2xl shadow-2xl flex flex-col items-center gap-3 transition-all duration-300 group-hover:pl-5 group-hover:border-white group-hover:shadow-slate-700/40">
            <FileSpreadsheet className="w-5 h-5 text-slate-300 animate-bounce" />
            
            {/* Folder Label */}
            <span 
              className="text-[11px] font-mono font-black uppercase tracking-widest text-white whitespace-nowrap"
              style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
            >
              {language === 'af' ? 'FORMULEBLADSY' : 'FORMULA SHEET'}
            </span>

            <div className="w-2 h-2 rounded-full bg-slate-400 animate-ping mt-1" />
          </div>

          {/* Hover Tooltip Flap */}
          <div className="hidden group-hover:flex items-center ml-2 px-3 py-1.5 bg-slate-950 text-white font-mono text-[11px] font-bold rounded-lg shadow-xl border border-slate-500 whitespace-nowrap">
            {language === 'af' ? 'Graad 12 NSC Rekeningkunde Formulebladsy' : 'Grade 12 NSC Accounting Formula Sheet'}
          </div>
        </motion.div>
      )}

      {/* QUESTION PAPER & INFORMATION BOOKLET SLIDE-OUT DRAWER */}
      <AnimatePresence>
        {showInfoBooklet && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfoBooklet(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Slide-out Left Drawer Panel (Matching Paper Color) */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className={`relative w-full max-w-3xl h-full bg-[#EBE7DF] text-slate-950 shadow-2xl z-50 flex flex-col ${
                isPaper1 ? 'border-r-4 border-cyan-950' : 'border-r-4 border-rose-950'
              }`}
            >
              {/* Folder Drawer Header */}
              <div className={`p-5 sm:p-6 text-white flex items-center justify-between ${
                isPaper1 ? 'bg-cyan-950 border-b-4 border-cyan-400' : 'bg-rose-950 border-b-4 border-amber-400'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border shadow-sm ${
                    isPaper1 ? 'bg-cyan-900 border-cyan-400' : 'bg-rose-900 border-amber-400'
                  }`}>
                    <BookOpen className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded uppercase ${
                        isPaper1 ? 'bg-cyan-400 text-slate-950' : 'bg-amber-400 text-slate-950'
                      }`}>
                        {language === 'af' ? 'VOLLEDIGE BOEKIE' : 'FULL BOOKLET'}
                      </span>
                      <span className="text-xs font-mono text-amber-200 font-bold uppercase">
                        {language === 'af' ? (isPaper1 ? 'VRAESTEL 1' : 'VRAESTEL 2') : paperType.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold font-mono uppercase text-white mt-0.5">
                      {language === 'af' ? 'VRAESTEL & INLIGTINGSBOEKIE' : 'QUESTION PAPER & INFORMATION BOOKLET'}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setShowInfoBooklet(false)}
                  className="px-4 py-2 rounded-xl font-mono text-xs font-extrabold uppercase bg-slate-950 hover:bg-slate-900 text-white transition-all shadow-md border border-slate-700"
                >
                  <span>{language === 'af' ? 'SLUIT BOEKIE' : 'CLOSE BOOKLET'}</span>
                </button>
              </div>

              {/* Folder Drawer Body (Scrollable Questions & Information) */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                {questions.map((q, qIdx) => {
                  const qTopic = language === 'af' ? q.topic_af : q.topic_en;
                  const qInfo = language === 'af' ? q.info_section_af || q.info_section_en : q.info_section_en;

                  return (
                    <div key={q.id} className="p-6 rounded-2xl bg-white text-slate-950 space-y-4 border-2 border-slate-900 shadow-md">
                      <div className="flex items-center justify-between border-b-2 border-slate-300 pb-3 font-mono">
                        <span className="font-extrabold text-sm sm:text-base uppercase text-slate-950">
                          {language === 'af' 
                            ? `VRAAG ${qIdx + 1}: ${qTopic} (${q.total_marks} PUNTE)` 
                            : `QUESTION ${qIdx + 1}: ${qTopic} (${q.total_marks} MARKS)`}
                        </span>
                        <span className="text-xs bg-slate-950 text-white px-3 py-1 rounded-lg font-bold uppercase">
                          {q.difficulty}
                        </span>
                      </div>

                      <p className="font-bold text-sm text-slate-900 leading-relaxed">
                        {language === 'af' ? q.question_text_af : q.question_text_en}
                      </p>

                      {qInfo ? (
                        <div className="p-4 rounded-xl bg-[#F4F1EA] border border-slate-400 font-mono text-xs shadow-inner space-y-2">
                          <div className="font-extrabold text-cyan-950 uppercase text-xs flex items-center gap-2 border-b border-slate-300 pb-1.5">
                            <BookOpen className="w-4 h-4 text-cyan-800" />
                            <span>{language === 'af' ? 'INLIGTINGSBLAD / TRANSAKSIES:' : 'INFORMATION SHEET / TRANSACTIONS:'}</span>
                          </div>
                          <pre className="whitespace-pre-wrap break-words font-mono text-xs sm:text-sm leading-relaxed p-4 bg-white/80 rounded-xl border border-slate-300 text-slate-950 font-bold shadow-inner overflow-hidden">
                            {qInfo}
                          </pre>
                        </div>
                      ) : (
                        <p className="text-xs italic text-slate-600 font-mono">
                          {language === 'af' ? 'Geen afsonderlike inligtingsafdeling benodig vir hierdie vraag nie.' : 'No separate info section required for this question.'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Folder Drawer Footer */}
              <div className="p-4 bg-slate-200 border-t border-slate-300 flex justify-end">
                <button
                  onClick={() => setShowInfoBooklet(false)}
                  className="px-6 py-2.5 rounded-xl font-mono text-xs font-extrabold uppercase bg-slate-950 hover:bg-slate-800 text-white shadow-md"
                >
                  {language === 'af' ? 'KEER TERUG NA VRAESTEL' : 'RETURN TO EXAM PAPER'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FORMULA SHEET SLIDE-OUT DRAWER */}
      <AnimatePresence>
        {showFormulaSheet && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFormulaSheet(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Slide-out Left Drawer Panel (DARK GREY Style) */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full max-w-3xl h-full bg-[#FAF8F5] text-slate-950 shadow-2xl border-r-4 border-slate-950 z-50 flex flex-col"
            >
              {/* Dark Grey Folder Drawer Header */}
              <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b-4 border-slate-500 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-500 shadow-sm">
                    <FileSpreadsheet className="w-6 h-6 text-slate-200" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-extrabold bg-slate-700 text-white px-2 py-0.5 rounded uppercase">
                        {language === 'af' ? 'NSC DATABLAD' : 'NSC DATA SHEET'}
                      </span>
                      <span className="text-xs font-mono text-slate-300 font-bold uppercase">
                        {language === 'af' ? 'GRAAD 12 REKENINGKUNDE FORMULES' : 'GRADE 12 ACCOUNTING FORMULAS'}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold font-mono uppercase text-white mt-0.5">
                      {language === 'af' ? 'AMPTELIKE GRAAD 12 FORMULEBLADSY' : 'OFFICIAL GRADE 12 FORMULA SHEET (FORMULEBLADSY)'}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setShowFormulaSheet(false)}
                  className="px-4 py-2 rounded-xl font-mono text-xs font-extrabold uppercase bg-slate-950 hover:bg-slate-800 text-white transition-all shadow-md border border-slate-700"
                >
                  <span>{language === 'af' ? 'SLUIT FORMULES' : 'CLOSE FORMULAS'}</span>
                </button>
              </div>

              {/* Formula Sheet Body (Categorized by 5 Headings) */}
              <div className="flex-1 p-6 overflow-y-auto space-y-8 font-sans">
                
                {/* HEADING 1: FINANCIAL RATIOS */}
                <div className="p-6 rounded-2xl bg-white border-2 border-slate-900 shadow-md space-y-4">
                  {showFormulaTitles && (
                    <div className="flex items-center justify-between border-b-2 border-cyan-800 pb-2.5 font-mono">
                      <h4 className="text-base font-extrabold text-cyan-950 uppercase flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-cyan-950 text-white flex items-center justify-center text-xs">1</span>
                        1. FINANCIAL RATIOS (FINANSIËLE VERHOUDINGS) - PAPER 1
                      </h4>
                      <span className="text-[11px] font-extrabold bg-cyan-100 text-cyan-900 px-2.5 py-0.5 rounded border border-cyan-300">
                        VRAESTEL 1
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Bruto Wins op Verkope % / Gross Profit on Sales %</div>}
                      <div className="font-mono text-slate-800 font-semibold">(Bruto Wins ÷ Verkope) × 100</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Bruto Wins op Koste van Verkope % (Oorslag %)</div>}
                      <div className="font-mono text-slate-800 font-semibold">(Bruto Wins ÷ Koste van Verkope) × 100</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Bedryfswins op Verkope % / Operating Profit %</div>}
                      <div className="font-mono text-slate-800 font-semibold">(Bedryfswins ÷ Verkope) × 100</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Bedryfsuitgawes op Verkope %</div>}
                      <div className="font-mono text-slate-800 font-semibold">(Bedryfsuitgawes ÷ Verkope) × 100</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Netto Wins op Verkope % / Net Profit %</div>}
                      <div className="font-mono text-slate-800 font-semibold">(Netto Wins vir Jaar ÷ Verkope) × 100</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Bedryfsverhouding (Current Ratio)</div>}
                      <div className="font-mono text-slate-800 font-semibold">Bedryfsbates : Bedryfslaste</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Vuurproefverhouding (Acid-Test Ratio)</div>}
                      <div className="font-mono text-slate-800 font-semibold">(Bedryfsbates - Voorraad) : Bedryfslaste</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Solvabiliteitsverhouding (Solvency Ratio)</div>}
                      <div className="font-mono text-slate-800 font-semibold">Totale Bates : Totale Laste</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Skuld-Eiewaardeverhouding (Debt-Equity Ratio)</div>}
                      <div className="font-mono text-slate-800 font-semibold">Niewe-bedryfslaste (Lening) : Eiewaarde</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Opbrengs op Gemiddelde Eiewaarde (ROE %)</div>}
                      <div className="font-mono text-slate-800 font-semibold">(Netto Wins na Belasting ÷ Gemiddelde Eiewaarde) × 100</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Opbrengs op Totale Bates (ROTA %)</div>}
                      <div className="font-mono text-slate-800 font-semibold">[(Netto Wins voor Belasting + Rente) ÷ Gem Totale Bates] × 100</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Verdienste per Aandeel (EPS)</div>}
                      <div className="font-mono text-slate-800 font-semibold">(Netto Wins na Belasting ÷ Uitreikingsaandele) × 100 (sent)</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Dividende per Aandeel (DPS)</div>}
                      <div className="font-mono text-slate-800 font-semibold">(Totale Dividende ÷ Uitreikingsaandele) × 100 (sent)</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Netto Batewaarde per Aandeel (NAV)</div>}
                      <div className="font-mono text-slate-800 font-semibold">(Eiewaarde ÷ Uitreikingsaandele) × 100 (sent)</div>
                    </div>
                  </div>
                </div>

                {/* HEADING 2: COST & MANUFACTURING ACCOUNTING */}
                <div className="p-6 rounded-2xl bg-white border-2 border-slate-900 shadow-md space-y-4">
                  {showFormulaTitles && (
                    <div className="flex items-center justify-between border-b-2 border-rose-800 pb-2.5 font-mono">
                      <h4 className="text-base font-extrabold text-rose-950 uppercase flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-rose-950 text-white flex items-center justify-center text-xs">2</span>
                        2. COST & MANUFACTURING ACCOUNTING (KOSTE & VERVAARDIGING) - PAPER 2
                      </h4>
                      <span className="text-[11px] font-extrabold bg-rose-100 text-rose-900 px-2.5 py-0.5 rounded border border-rose-300">
                        VRAESTEL 2
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Primêre Koste (Prime Cost)</div>}
                      <div className="font-mono text-slate-800 font-semibold">Direkte Materiaalkoste + Direkte Arbeidskoste</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Fabrieksbokoste (Factory Overheads)</div>}
                      <div className="font-mono text-slate-800 font-semibold">Indirekte Materiaal + Indirekte Arbeid + Fabriekskoste</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1 col-span-1 md:col-span-2">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Totale Produksiekoste (Total Cost of Production)</div>}
                      <div className="font-mono text-slate-800 font-semibold">Primêre Koste + Fabrieksbokoste + Begin WIP - Eind WIP</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Eenheidsproduksiekoste (Unit Cost)</div>}
                      <div className="font-mono text-slate-800 font-semibold">Totale Produksiekoste ÷ Aantal Eenhede Geproduseer</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Gelykbreekpunt (Break-even Point)</div>}
                      <div className="font-mono text-slate-800 font-semibold">Totale Vaste Koste ÷ (Verkoopprys per eenheid - Veranderlike Koste per eenheid)</div>
                    </div>
                  </div>
                </div>

                {/* HEADING 3: INVENTORY VALUATION */}
                <div className="p-6 rounded-2xl bg-white border-2 border-slate-900 shadow-md space-y-4">
                  {showFormulaTitles && (
                    <div className="flex items-center justify-between border-b-2 border-amber-700 pb-2.5 font-mono">
                      <h4 className="text-base font-extrabold text-amber-950 uppercase flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-amber-950 text-white flex items-center justify-center text-xs">3</span>
                        3. INVENTORY VALUATION & MANAGEMENT (VOORRAADWAARDERING) - PAPER 2
                      </h4>
                      <span className="text-[11px] font-extrabold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded border border-amber-300">
                        VRAESTEL 2
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">EVEW Waardasiemetode (FIFO Method)</div>}
                      <div className="font-mono text-slate-800 font-semibold">Eindvoorraad gewaardeer teen mees onlangse aankooppryse (+ karriage)</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Geweegde Gemiddelde Koste per Eenheid</div>}
                      <div className="font-mono text-slate-800 font-semibold">(Beginvoorraad R + Netto Aankope R) ÷ (Begin Eenhede + Aangekoopte Eenhede)</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Voorraadomsetsnelheid (Stock Turnover Rate)</div>}
                      <div className="font-mono text-slate-800 font-semibold">Koste van Verkope ÷ Gemiddelde Voorraad</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Voorraadhoudingstydperk (Dae / Maande)</div>}
                      <div className="font-mono text-slate-800 font-semibold">(Gemiddelde Voorraad ÷ Koste van Verkope) × 365 dae (of 12 maande)</div>
                    </div>
                  </div>
                </div>

                {/* HEADING 4: DEBTORS & CREDITORS MANAGEMENT */}
                <div className="p-6 rounded-2xl bg-white border-2 border-slate-900 shadow-md space-y-4">
                  {showFormulaTitles && (
                    <div className="flex items-center justify-between border-b-2 border-emerald-800 pb-2.5 font-mono">
                      <h4 className="text-base font-extrabold text-emerald-950 uppercase flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-emerald-950 text-white flex items-center justify-center text-xs">4</span>
                        4. DEBTORS & CREDITORS MANAGEMENT (DEBITEURE & KREDITEURE) - PAPER 1 & 2
                      </h4>
                      <span className="text-[11px] font-extrabold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded border border-emerald-300">
                        BEIDE VRAESTOWWE
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Debiteure-invorderingstydperk (Debtors Collection Period)</div>}
                      <div className="font-mono text-slate-800 font-semibold">(Gemiddelde Debiteure ÷ Kredietverkope) × 365 dae (of 12 maande)</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Krediteure-betalingstydperk (Creditors Payment Period)</div>}
                      <div className="font-mono text-slate-800 font-semibold">(Gemiddelde Krediteure ÷ Koste van Verkope / Kredietaankope) × 365 dae</div>
                    </div>
                  </div>
                </div>

                {/* HEADING 5: VAT */}
                <div className="p-6 rounded-2xl bg-white border-2 border-slate-900 shadow-md space-y-4">
                  {showFormulaTitles && (
                    <div className="flex items-center justify-between border-b-2 border-purple-800 pb-2.5 font-mono">
                      <h4 className="text-base font-extrabold text-purple-950 uppercase flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-purple-950 text-white flex items-center justify-center text-xs">5</span>
                        5. VALUE ADDED TAX (VAT / BTW @ 15%) - PAPER 2
                      </h4>
                      <span className="text-[11px] font-extrabold bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded border border-purple-300">
                        VRAESTEL 2
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">BTW Bedrag (uit Ingeslote Bedrag)</div>}
                      <div className="font-mono text-slate-800 font-semibold">Ingeslote Bedrag × (15 ÷ 115)</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Uitgeslote Bedrag (uit Ingeslote Bedrag)</div>}
                      <div className="font-mono text-slate-800 font-semibold">Ingeslote Bedrag × (100 ÷ 115)</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Ingeslote Bedrag (uit Uitgeslote Bedrag)</div>}
                      <div className="font-mono text-slate-800 font-semibold">Uitgeslote Bedrag × 1.15</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F2EB] border border-slate-300 space-y-1">
                      {showFormulaTitles && <div className="font-bold text-slate-950">Netto BTW Betaalbaar/Eisbaar aan SARS</div>}
                      <div className="font-mono text-slate-800 font-semibold">BTW-Uitset (Verkope) - BTW-Inset (Aankope/Uitgawes)</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Formula Drawer Footer */}
              <div className="p-4 bg-slate-200 border-t border-slate-300 flex justify-end">
                <button
                  onClick={() => setShowFormulaSheet(false)}
                  className="px-6 py-2.5 rounded-xl font-mono text-xs font-extrabold uppercase bg-slate-950 hover:bg-slate-800 text-white shadow-md"
                >
                  {language === 'af' ? 'KEER TERUG NA VRAESTEL' : 'RETURN TO EXAM PAPER'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="liquid-glass p-6 sm:p-8 rounded-3xl max-w-md w-full border border-white/10 shadow-2xl text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">{t('confirm_submit')}</h3>
            <p className="text-xs text-slate-400 font-mono">
              {language === 'af' ? 'Jou antwoorde sal deterministies geëvalueer word.' : 'Your answers will be deterministically evaluated on the backend server.'}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="w-1/2 py-3 rounded-xl font-mono text-xs font-bold uppercase bg-white/10 hover:bg-white/20 text-white"
              >
                {language === 'af' ? 'Kanselleer' : 'Cancel'}
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="w-1/2 py-3 rounded-xl font-mono text-xs font-bold uppercase bg-rose-500 hover:bg-rose-400 text-slate-950 font-extrabold"
              >
                {isSubmitting ? (language === 'af' ? 'Evalueer...' : 'Evaluating...') : (language === 'af' ? 'Bevestig Inhandiging' : 'Confirm Submit')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

