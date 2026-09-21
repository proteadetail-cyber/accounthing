import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Question, PaperType } from '../types';
import { Database, Filter, Play, CheckCircle } from 'lucide-react';

interface QuestionBankProps {
  onSelectQuestion: (questionId: number) => void;
}

export const QuestionBankPage: React.FC<QuestionBankProps> = ({ onSelectQuestion }) => {
  const { paperType, glassClass, accentColor } = useTheme();
  const { t, language } = useLanguage();
  const { token } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterExam, setFilterExam] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestionBank();
  }, [paperType, filterDifficulty, filterExam]);

  const fetchQuestionBank = async () => {
    setLoading(true);
    try {
      let url = `/api/questions?paper_type=${paperType}`;
      if (filterDifficulty !== 'all') url += `&difficulty=${filterDifficulty}`;
      if (filterExam !== 'all') url += `&exam_type=${filterExam}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Question bank request failed: ${res.status}`);
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      console.error('Failed to load question bank:', err);
    } finally {
      setLoading(false);
    }
  };

  const isPaper1 = paperType === 'paper_1';

  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 flex items-center gap-3">
            <Database className="w-6 h-6 text-cyan-700" />
            <span>QUESTION BANK — {isPaper1 ? 'PAPER 1' : 'PAPER 2'}</span>
          </h1>
          <p className="text-xs font-mono text-slate-700 font-bold mt-1">
            Database question records filtered for {isPaper1 ? 'Financial Reporting' : 'Managerial Accounting'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#EBE7DF] text-xs font-mono font-bold text-slate-950 border border-slate-300 shadow-sm"
          >
            <option value="all" className="bg-[#EBE7DF] text-slate-950 font-bold">All Difficulties</option>
            <option value="easy" className="bg-[#EBE7DF] text-slate-950 font-bold">Easy</option>
            <option value="medium" className="bg-[#EBE7DF] text-slate-950 font-bold">Medium</option>
            <option value="hard" className="bg-[#EBE7DF] text-slate-950 font-bold">Hard</option>
          </select>
        </div>
      </div>

      {/* Question Table / Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs font-mono text-slate-950 font-bold">Querying database...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q) => {
            const topic = language === 'af' ? q.topic_af : q.topic_en;
            const text = language === 'af' ? q.question_text_af : q.question_text_en;
            const isExpanded = expandedQuestionId === q.id;
            const infoText = language === 'af' ? q.info_section_af || q.info_section_en : q.info_section_en;

            return (
              <div key={q.id} className={`${glassClass} p-6 rounded-3xl space-y-4 flex flex-col justify-between hover:bg-[#E2DCD0] transition-all`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-white uppercase font-bold">
                      {q.exam_type}
                    </span>
                    <span className="text-amber-900 font-extrabold">{q.total_marks} MARKS</span>
                  </div>

                  <span className="text-[11px] font-mono text-cyan-900 font-extrabold block uppercase">
                    {topic}
                  </span>

                  <h3 className="text-base font-extrabold text-slate-950">
                    {text}
                  </h3>

                  {infoText && (
                    <button
                      onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                      className="text-xs font-mono font-bold text-cyan-950 hover:underline uppercase flex items-center gap-1 mt-2 bg-slate-200 px-3 py-1 rounded-lg border border-slate-300"
                    >
                      <span>{isExpanded ? (language === 'af' ? 'Verberg Inligtingstabel' : 'Hide Information Table') : (language === 'af' ? 'Bekyk Inligtingstabel' : 'View Information Table')}</span>
                    </button>
                  )}

                  {isExpanded && infoText && (
                    <div className="mt-3 p-4 rounded-xl bg-[#EBE7DF] border-2 border-slate-900 space-y-2 font-mono text-xs">
                      <div className="font-extrabold text-slate-950 uppercase text-[11px] border-b border-slate-400 pb-1">
                        {language === 'af' ? 'EKSAMEN INLIGTINGSBLAD & TABEL' : 'EXAM INFORMATION SHEET & TABLE'}
                      </div>
                      <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed p-3 bg-white rounded-lg border border-slate-300 text-slate-950 font-bold shadow-inner overflow-hidden">
                        {infoText}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-300/80 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-800 uppercase font-bold">
                    {q.fields?.length || 0} Answer Fields
                  </span>

                  <button
                    onClick={() => onSelectQuestion(q.id)}
                    className="px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase bg-slate-950 text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <span>PRACTICE</span>
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
