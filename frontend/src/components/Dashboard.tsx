import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { DashboardStats, PaperType } from '../types';
import { 
  TrendingUp, CheckCircle2, XCircle, Award, 
  Target, AlertTriangle, Play, Clock, ArrowRight, BookOpen, Activity 
} from 'lucide-react';

interface DashboardProps {
  onStartPractice: (paper: PaperType, topic?: string, mode?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartPractice }) => {
  const { paperType, setPaperType, glassClass, accentColor } = useTheme();
  const { t, language } = useLanguage();
  const { student, token } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [paperType]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attempts/stats?student_id=${student?.id || 1}&paper_type=${paperType}&exam_type=all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Dashboard stats request failed: ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const isPaper1 = paperType === 'paper_1';
  const diagnosticMsg = language === 'af' 
    ? stats?.diagnostic_analysis?.message_af 
    : stats?.diagnostic_analysis?.message_en;
  const primaryWeakness = language === 'af' 
    ? stats?.diagnostic_analysis?.primary_weakness_af 
    : stats?.diagnostic_analysis?.primary_weakness_en;

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto px-4 sm:px-6 pt-4">
      
      {/* Top Clean Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading tracking-wider text-slate-950 flex items-center gap-3 flex-wrap">
            <span className="whitespace-nowrap">{t('good_morning').toUpperCase()}</span>
          </h1>
        </div>

      </div>

      {/* SINGLE CONSOLIDATED MAIN BLOCK: ESTIMATED NEXT PAPER + ALL METRICS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${glassClass} p-6 sm:p-8 rounded-3xl relative overflow-hidden space-y-6`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-300/60 pb-6 flex-wrap">
          <div className="space-y-1">
            <span className="text-xs font-heading tracking-widest text-slate-700 uppercase flex items-center gap-2 whitespace-nowrap">
              <Target className="w-4 h-4 shrink-0" style={{ color: isPaper1 ? '#0284C7' : '#E11D48' }} />
              {t('estimated_next_paper')}
            </span>
            <div className="flex items-baseline gap-3 flex-wrap">
              {stats?.estimated_score !== null && stats?.estimated_score !== undefined ? (
                <>
                  <span className="text-5xl sm:text-6xl md:text-7xl font-heading tracking-wider text-slate-950">
                    {stats.estimated_score}%
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
                    {t('based_on_performance')}
                  </span>
                </>
              ) : (
                <div className="space-y-1">
                  <span className="text-5xl font-heading text-slate-400">—</span>
                  <p className="text-xs text-slate-600 font-medium">
                    {t('complete_more_questions')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="text-left md:text-right font-mono text-xs text-slate-600 space-y-1">
            <div>Paper Environment: <strong className="text-slate-950 uppercase">{isPaper1 ? 'Paper 1' : 'Paper 2'}</strong></div>
            <div className="flex items-center gap-1 text-cyan-700 font-bold">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>{stats?.estimation_message || t('based_on_performance')}</span>
            </div>
          </div>
        </div>

        {/* Integrated Sub-Metrics Grid (Questions Completed, Overall Avg, Correct & Incorrect) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          
          <div className="p-4 rounded-2xl bg-[#DFD9CD] hover:bg-[#D4CDBE] border border-slate-300/60 transition-all duration-200 cursor-pointer">
            <span className="text-[11px] font-heading tracking-wider text-slate-700 uppercase block mb-1 truncate">
              {t('questions_completed')}
            </span>
            <span className="text-2xl sm:text-3xl font-heading text-slate-950">
              {loading ? '...' : stats?.completed_count || 0}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#DFD9CD] hover:bg-[#D4CDBE] border border-slate-300/60 transition-all duration-200 cursor-pointer">
            <span className="text-[11px] font-heading tracking-wider text-slate-700 uppercase block mb-1 truncate">
              {t('overall_average')}
            </span>
            <span className="text-2xl sm:text-3xl font-heading text-slate-950">
              {loading ? '...' : `${stats?.average_percentage || 0}%`}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#DFD9CD] hover:bg-[#D4CDBE] border border-slate-300/60 transition-all duration-200 cursor-pointer">
            <span className="text-[11px] font-heading tracking-wider text-slate-700 uppercase block mb-1 truncate">
              {t('correct_answers')}
            </span>
            <span className="text-2xl sm:text-3xl font-heading text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              {loading ? '...' : stats?.correct_count || 0}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#DFD9CD] hover:bg-[#D4CDBE] border border-slate-300/60 transition-all duration-200 cursor-pointer">
            <span className="text-[11px] font-heading tracking-wider text-slate-700 uppercase block mb-1 truncate">
              {t('incorrect_answers')}
            </span>
            <span className="text-2xl sm:text-3xl font-heading text-rose-700 flex items-center gap-1.5">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              {loading ? '...' : stats?.incorrect_count || 0}
            </span>
          </div>

        </div>
      </motion.div>

      {/* UNBLOCKED SECTION 1: SMART DIAGNOSTIC ANALYSIS (NO WEIRD OUTLINES, TURNS DARKER ON HOVER) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-300/80 pb-3 gap-2 flex-wrap">
          <h2 className="text-base sm:text-lg font-heading tracking-wider text-slate-950 flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-950 shrink-0" />
            <span>DIAGNOSTIC ANALYSIS — FOCUS RECOMMENDATIONS</span>
          </h2>
          <span className="font-calligraphy text-lg sm:text-xl font-normal text-slate-800 whitespace-nowrap">
            Smart Diagnostic
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-[#E2DCD0] hover:bg-[#D6CFC1] border border-slate-300/60 space-y-4 transition-all duration-250 cursor-pointer shadow-sm">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-slate-950 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-mono font-bold text-slate-950 uppercase">
                WHAT YOU ARE GETTING WRONG MOSTLY:
              </h3>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {diagnosticMsg}
              </p>
            </div>
          </div>

          {primaryWeakness && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onStartPractice(paperType, primaryWeakness, 'weak_topics')}
                className="px-6 py-2.5 rounded-xl font-heading text-xs tracking-widest uppercase bg-rose-700 hover:bg-rose-800 text-white flex items-center gap-2 transition-all shadow-md"
              >
                <span>PRACTICE WEAK TOPIC NOW ({primaryWeakness.toUpperCase()})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* UNBLOCKED SECTION 2: STUDY ENVIRONMENT SELECTION */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-300/80 pb-3 gap-2 flex-wrap">
          <h2 className="text-base sm:text-lg font-heading tracking-wider text-slate-950 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-700 shrink-0" />
            <span>{t('what_do_you_want_to_study')}</span>
          </h2>
          <span className="font-calligraphy text-lg sm:text-xl font-normal whitespace-nowrap" style={{ color: isPaper1 ? '#0284C7' : '#E11D48' }}>
            Choose Environment
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Paper 1 Practice */}
          <div
            onClick={() => {
              setPaperType('paper_1');
              onStartPractice('paper_1');
            }}
            className="cursor-pointer p-6 rounded-3xl bg-[#E2DCD0] hover:bg-[#D6CFC1] border border-slate-300/60 group transition-all duration-250 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-slate-900 text-white">
                PAPER 1
              </span>
              {isPaper1 && <span className="text-xs font-mono text-cyan-700 font-bold">● Active</span>}
            </div>

            <h3 className="text-2xl font-heading text-slate-950 mb-2 group-hover:text-cyan-800 transition-colors">
              {t('paper_1_title')}
            </h3>
            <p className="text-xs text-slate-700 mb-6 font-medium">
              {t('paper_1_subtitle')}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-300/60">
              <span className="text-xs font-mono text-slate-600">Independent Question Bank</span>
              <button className="px-4 py-2 rounded-xl text-xs font-heading tracking-widest uppercase bg-slate-900 text-white flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm">
                <span>START P1</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>

          {/* Paper 2 Practice */}
          <div
            onClick={() => {
              setPaperType('paper_2');
              onStartPractice('paper_2');
            }}
            className="cursor-pointer p-6 rounded-3xl bg-[#E2DCD0] hover:bg-[#D6CFC1] border border-slate-300/60 group transition-all duration-250 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-slate-900 text-white">
                PAPER 2
              </span>
              {!isPaper1 && <span className="text-xs font-mono text-rose-700 font-bold">● Active</span>}
            </div>

            <h3 className="text-2xl font-heading text-slate-950 mb-2 group-hover:text-rose-800 transition-colors">
              {t('paper_2_title')}
            </h3>
            <p className="text-xs text-slate-700 mb-6 font-medium">
              {t('paper_2_subtitle')}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-300/60">
              <span className="text-xs font-mono text-slate-600">Independent Question Bank</span>
              <button className="px-4 py-2 rounded-xl text-xs font-heading tracking-widest uppercase bg-slate-900 text-white flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm">
                <span>START P2</span>
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
