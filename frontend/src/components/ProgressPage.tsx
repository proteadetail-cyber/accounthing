import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';
import { LineChart, Trophy, Target, Award, Layers } from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const { paperType, glassClass, accentColor } = useTheme();
  const { t, language } = useLanguage();
  const { student, token } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, [paperType]);

  const fetchProgressData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attempts/stats?student_id=${student?.id || 1}&paper_type=${paperType}&exam_type=all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`Progress stats request failed: ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to load progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = stats?.recent_activity?.map((att: any, idx: number) => ({
    name: `Attempt ${idx + 1}`,
    score: att.percentage,
    marks: `${att.marks_earned}/${att.total_marks}`
  })).reverse() || [
    { name: 'Start', score: 60 },
    { name: 'P1-Q1', score: 70 },
    { name: 'P1-Q2', score: 75 },
    { name: 'P1-Q3', score: 85 }
  ];

  const topicChartData = stats?.topic_performance?.map((tp: any) => ({
    topic: language === 'af' ? tp.topic_af : tp.topic_en,
    score: tp.average_pct
  })) || [];

  const isPaper1 = paperType === 'paper_1';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 flex items-center gap-3">
            <LineChart className="w-6 h-6" style={{ color: isPaper1 ? '#0284C7' : '#E11D48' }} />
            <span>PROGRESS & PERFORMANCE ANALYTICS</span>
          </h1>
          <p className="text-xs font-mono text-slate-800 font-bold mt-1">
            Real database metrics for {isPaper1 ? 'Paper 1' : 'Paper 2'}
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className={`${glassClass} p-6 rounded-3xl space-y-2 flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-cyan-100 flex items-center justify-center text-cyan-900 border border-cyan-300 shrink-0">
            <Trophy className="w-6 h-6 text-cyan-900" />
          </div>
          <div>
            <span className="text-xs font-mono text-slate-950 font-extrabold uppercase block">Average Percentage</span>
            <div className="text-2xl font-extrabold font-mono text-slate-950">{stats?.average_percentage || 0}%</div>
          </div>
        </div>

        <div className={`${glassClass} p-6 rounded-3xl space-y-2 flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-900 border border-emerald-300 shrink-0">
            <Target className="w-6 h-6 text-emerald-900" />
          </div>
          <div>
            <span className="text-xs font-mono text-slate-950 font-extrabold uppercase block">Questions Attempted</span>
            <div className="text-2xl font-extrabold font-mono text-slate-950">{stats?.completed_count || 0}</div>
          </div>
        </div>

        <div className={`${glassClass} p-6 rounded-3xl space-y-2 flex items-center gap-4`}>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-900 border border-amber-300 shrink-0">
            <Award className="w-6 h-6 text-amber-900" />
          </div>
          <div>
            <span className="text-xs font-mono text-slate-950 font-extrabold uppercase block">Estimated Next Paper</span>
            <div className="text-2xl font-extrabold font-mono text-slate-950">{stats?.estimated_score ? `${stats.estimated_score}%` : 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Performance Trend Area Chart */}
        <div className={`${glassClass} p-6 rounded-3xl space-y-4`}>
          <h3 className="text-sm font-mono font-extrabold uppercase tracking-wider text-slate-950">
            PERFORMANCE TREND OVER TIME (%)
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPaper1 ? '#0284C7' : '#E11D48'} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={isPaper1 ? '#0284C7' : '#E11D48'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="name" stroke="#0F172A" fontSize={10} fontWeight="bold" />
                <YAxis domain={[0, 100]} stroke="#0F172A" fontSize={10} fontWeight="bold" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#EBE7DF', borderColor: '#CBD5E1', borderRadius: '12px', fontSize: '12px', color: '#000000', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="score" stroke={isPaper1 ? '#0284C7' : '#E11D48'} strokeWidth={3} fillOpacity={1} fill="url(#scoreColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Breakdown Bar Chart */}
        <div className={`${glassClass} p-6 rounded-3xl space-y-4`}>
          <h3 className="text-sm font-mono font-extrabold uppercase tracking-wider text-slate-950">
            TOPIC ACCURACY BREAKDOWN (%)
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="topic" stroke="#0F172A" fontSize={10} fontWeight="bold" />
                <YAxis domain={[0, 100]} stroke="#0F172A" fontSize={10} fontWeight="bold" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#EBE7DF', borderColor: '#CBD5E1', borderRadius: '12px', fontSize: '12px', color: '#000000', fontWeight: 'bold' }}
                />
                <Bar dataKey="score" fill={isPaper1 ? '#0284C7' : '#E11D48'} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
