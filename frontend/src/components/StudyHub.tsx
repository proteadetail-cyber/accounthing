import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { PracticeMode } from './PracticeMode';
import { MockExam } from './MockExam';
import { QuestionBankPage } from './QuestionBankPage';
import { PaperType } from '../types';
import { BookOpen, GraduationCap, Database } from 'lucide-react';

interface StudyHubProps {
  initialSubTab?: 'practice' | 'mock' | 'bank';
  initialPaper?: PaperType;
  initialTopic?: string;
  initialMode?: string;
}

export const StudyHub: React.FC<StudyHubProps> = ({ 
  initialSubTab = 'practice',
  initialTopic,
  initialMode 
}) => {
  const { paperType, glassClass, accentColor } = useTheme();
  const { t } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState<'practice' | 'mock' | 'bank'>(initialSubTab);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | undefined>();

  const handleSelectQuestion = (qId: number) => {
    setSelectedQuestionId(qId);
    setActiveSubTab('practice');
  };

  const isPaper1 = paperType === 'paper_1';

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Streamlined Sub-Header Pill Selector */}
      <div className="flex items-center justify-center pt-2">
        <div className="rock-panel-paper1 p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-300/80">
          <button
            onClick={() => setActiveSubTab('practice')}
            className={`px-5 py-2 rounded-xl text-xs font-heading tracking-wider transition-all uppercase flex items-center gap-2 font-extrabold ${
              activeSubTab === 'practice'
                ? 'bg-slate-950 text-white shadow-md'
                : 'text-slate-950 hover:bg-slate-300/80'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" style={{ color: activeSubTab === 'practice' ? (isPaper1 ? '#38BDF8' : '#F43F5E') : undefined }} />
            <span>PRACTICE MODE</span>
          </button>

          <button
            onClick={() => setActiveSubTab('mock')}
            className={`px-5 py-2 rounded-xl text-xs font-heading tracking-wider transition-all uppercase flex items-center gap-2 font-extrabold ${
              activeSubTab === 'mock'
                ? 'bg-slate-950 text-white shadow-md'
                : 'text-slate-950 hover:bg-slate-300/80'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" style={{ color: activeSubTab === 'mock' ? (isPaper1 ? '#38BDF8' : '#F43F5E') : undefined }} />
            <span>MOCK EXAMS</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bank')}
            className={`px-5 py-2 rounded-xl text-xs font-heading tracking-wider transition-all uppercase flex items-center gap-2 font-extrabold ${
              activeSubTab === 'bank'
                ? 'bg-slate-950 text-white shadow-md'
                : 'text-slate-950 hover:bg-slate-300/80'
            }`}
          >
            <Database className="w-3.5 h-3.5" style={{ color: activeSubTab === 'bank' ? (isPaper1 ? '#38BDF8' : '#F43F5E') : undefined }} />
            <span>QUESTION BANK</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab View Rendering */}
      {activeSubTab === 'practice' && (
        <PracticeMode 
          initialPaper={paperType} 
          initialTopic={initialTopic} 
          practiceMode={initialMode} 
          selectedQuestionId={selectedQuestionId}
        />
      )}

      {activeSubTab === 'mock' && (
        <MockExam />
      )}

      {activeSubTab === 'bank' && (
        <QuestionBankPage onSelectQuestion={handleSelectQuestion} />
      )}

    </div>
  );
};
