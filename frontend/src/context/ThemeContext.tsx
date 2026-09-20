import React, { createContext, useContext, useState, useEffect } from 'react';
import { PaperType } from '../types';

interface ThemeContextType {
  paperType: PaperType;
  setPaperType: (paper: PaperType) => void;
  togglePaper: () => void;
  showFormulaTitles: boolean;
  setShowFormulaTitles: (show: boolean) => void;
  toggleFormulaTitles: () => void;
  glassClass: string;
  bgClass: string;
  accentColor: string;
  accentBorder: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paperType, setPaperTypeState] = useState<PaperType>(() => {
    return (localStorage.getItem('sa_acc_paper') as PaperType) || 'paper_1';
  });

  const [showFormulaTitles, setShowFormulaTitlesState] = useState<boolean>(() => {
    const saved = localStorage.getItem('sa_acc_show_formula_titles');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const setPaperType = (paper: PaperType) => {
    setPaperTypeState(paper);
    localStorage.setItem('sa_acc_paper', paper);
  };

  const togglePaper = () => {
    const next = paperType === 'paper_1' ? 'paper_2' : 'paper_1';
    setPaperType(next);
  };

  const setShowFormulaTitles = (show: boolean) => {
    setShowFormulaTitlesState(show);
    localStorage.setItem('sa_acc_show_formula_titles', JSON.stringify(show));
  };

  const toggleFormulaTitles = () => {
    const next = !showFormulaTitles;
    setShowFormulaTitles(next);
  };

  useEffect(() => {
    // Pearl background (High contrast, non-AI aesthetic)
    document.body.className = paperType === 'paper_1' ? 'bg-solid-paper1 text-slate-900' : 'bg-solid-paper2 text-slate-900';
  }, [paperType]);

  const glassClass = paperType === 'paper_1' ? 'rock-panel-paper1' : 'rock-panel-paper2';
  const bgClass = paperType === 'paper_1' ? 'bg-solid-paper1' : 'bg-solid-paper2';
  const accentColor = paperType === 'paper_1' ? '#38BDF8' : '#F43F5E';
  const accentBorder = paperType === 'paper_1' ? 'border-cyan-500/30' : 'border-rose-500/30';

  return (
    <ThemeContext.Provider value={{ 
      paperType, setPaperType, togglePaper, 
      showFormulaTitles, setShowFormulaTitles, toggleFormulaTitles,
      glassClass, bgClass, accentColor, accentBorder 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
