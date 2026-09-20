import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, BookOpen, LineChart, 
  Settings, RefreshCw, LogOut, Globe, Calculator as CalcIcon, 
  Flame, Wrench, FileText, ChevronDown 
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isCalculatorOpen: boolean;
  setIsCalculatorOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isNotepadOpen: boolean;
  setIsNotepadOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  setCurrentView, 
  isCalculatorOpen, 
  setIsCalculatorOpen,
  isNotepadOpen,
  setIsNotepadOpen
}) => {
  const { paperType, togglePaper, glassClass, accentColor } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { student, logout } = useAuth();
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'study', label: 'STUDY HUB', icon: BookOpen },
    { id: 'progress', label: 'PROGRESS', icon: LineChart },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
  ];

  const isPaper1 = paperType === 'paper_1';
  const numberBoxBg = isPaper1 ? 'bg-[#2A384A]' : 'bg-[#3B1E28]';
  const numberTextColor = isPaper1 ? 'text-[#94BBE9]' : 'text-[#F696AA]';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#EBE7DF] border-b border-slate-300/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all duration-300 gap-3">
        
        {/* LEFT SIDE: Brand Title & Nav Links */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-0.5">
          <div 
            onClick={() => setCurrentView('dashboard')}
            className="hidden xl:flex items-baseline gap-1.5 cursor-pointer shrink-0 mr-2 whitespace-nowrap"
          >
            <span className="text-sm sm:text-base font-heading tracking-wider text-slate-950">
              ACCOUNTHING
            </span>
          </div>

          <nav className="flex items-center gap-1 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`px-3 py-1.5 sm:px-3.5 rounded-xl text-xs sm:text-sm font-heading tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md border border-slate-900'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-300/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: isActive ? (isPaper1 ? '#38BDF8' : '#F43F5E') : undefined }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* PAPER SWITCHER BUTTON (BETWEEN SETTINGS AND TOOLS) */}
          <button
            onClick={togglePaper}
            className={`px-3 py-1.5 sm:px-3.5 rounded-xl text-xs sm:text-sm font-heading tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap border shadow-sm active:scale-95 ${
              isPaper1
                ? 'bg-cyan-700 text-white border-cyan-800 hover:bg-cyan-800'
                : 'bg-rose-700 text-white border-rose-800 hover:bg-rose-800'
            }`}
            title="Switch Paper Environment"
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            <span>{isPaper1 ? 'PAPER ONE' : 'PAPER TWO'}</span>
          </button>
        </div>

        {/* RIGHT SIDE ACTIONS: TOOLS Dropdown, Switch Paper, Language, Streak, Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* TOOLS DROPDOWN BUTTON */}
          <div className="relative">
            <button
              onClick={() => setShowToolsDropdown(prev => !prev)}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-heading tracking-wider uppercase transition-all flex items-center gap-1.5 border shadow-sm active:scale-95 whitespace-nowrap ${
                isCalculatorOpen || isNotepadOpen
                  ? 'bg-cyan-600 text-white border-cyan-700 shadow-cyan-600/20'
                  : 'bg-slate-300/80 hover:bg-slate-400/80 text-slate-900 border-slate-400/40'
              }`}
              title="Open Utility Tools"
            >
              <Wrench className="w-3.5 h-3.5 text-cyan-700 shrink-0" style={{ color: isCalculatorOpen || isNotepadOpen ? '#FFFFFF' : undefined }} />
              <span>TOOLS</span>
              <ChevronDown className="w-3 h-3 text-slate-600 shrink-0" />
            </button>

            {/* Tools Dropdown Menu */}
            {showToolsDropdown && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#EBE7DF] border border-slate-300 shadow-2xl p-2 z-50 space-y-1 font-mono text-xs">
                <button
                  onClick={() => {
                    setIsCalculatorOpen(prev => !prev);
                    setShowToolsDropdown(false);
                  }}
                  className={`w-full p-2.5 rounded-xl flex items-center gap-2 font-bold transition-all ${
                    isCalculatorOpen ? 'bg-cyan-500/20 text-cyan-800 border border-cyan-500/30' : 'text-slate-800 hover:bg-slate-300/60'
                  }`}
                >
                  <CalcIcon className="w-4 h-4 text-cyan-700" />
                  <span>Calculator {isCalculatorOpen ? '(Open)' : ''}</span>
                </button>

                <button
                  onClick={() => {
                    setIsNotepadOpen(prev => !prev);
                    setShowToolsDropdown(false);
                  }}
                  className={`w-full p-2.5 rounded-xl flex items-center gap-2 font-bold transition-all ${
                    isNotepadOpen ? 'bg-amber-500/20 text-amber-900 border border-amber-500/30' : 'text-slate-800 hover:bg-slate-300/60'
                  }`}
                >
                  <FileText className="w-4 h-4 text-amber-700" />
                  <span>Notepad (20 Pages) {isNotepadOpen ? '(Open)' : ''}</span>
                </button>
              </div>
            )}
          </div>

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="px-2 py-1.5 sm:py-2 rounded-xl text-xs font-mono font-bold text-slate-900 hover:bg-slate-300/80 transition-all border border-slate-400/40 bg-slate-300/80 flex items-center gap-1 shrink-0 shadow-sm"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Flame Streak Badge */}
          <div 
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-mono text-xs font-bold shrink-0 shadow-sm"
            title="Daily Practice Streak"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600 animate-pulse shrink-0" />
            <span>{student?.streakDays || 1}</span>
          </div>

          {/* User Profile Avatar / Google Profile Badge */}
          {student?.picture ? (
            <img 
              src={student.picture} 
              alt={student.name || 'User'} 
              className="w-7 h-7 rounded-full border-2 border-cyan-700 object-cover shadow-sm shrink-0" 
              title={`Signed in as ${student.name || student.email}`}
            />
          ) : student?.email ? (
            <div 
              className="px-2.5 py-1.5 rounded-xl bg-cyan-950 text-cyan-100 font-mono text-[11px] font-bold shrink-0 truncate max-w-[120px] shadow-sm border border-cyan-700"
              title={`Signed in as ${student.email}`}
            >
              {student.name || student.email.split('@')[0]}
            </div>
          ) : null}

          {/* Logout (Exit) Button */}
          <button
            onClick={logout}
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 hover:text-rose-700 hover:bg-rose-200/60 transition-all border border-transparent shrink-0"
            title="Logout / Exit"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
};
