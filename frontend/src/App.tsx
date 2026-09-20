import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { LicenseScreen } from './components/LicenseScreen';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { StudyHub } from './components/StudyHub';
import { ProgressPage } from './components/ProgressPage';
import { AdminPanel } from './components/AdminPanel';
import { Calculator } from './components/Calculator';
import { Notepad } from './components/Notepad';
import { PaperType } from './types';
import { LogOut, RefreshCw, Globe, ShieldAlert } from 'lucide-react';

const MainContent: React.FC = () => {
  const { student, logout } = useAuth();
  const { paperType, setPaperType, glassClass, togglePaper, showFormulaTitles, toggleFormulaTitles } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const [selectedPracticeMode, setSelectedPracticeMode] = useState<string | undefined>();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  if (!student) {
    return <LicenseScreen />;
  }

  const handleStartPractice = (paper: PaperType, topic?: string, mode?: string) => {
    setPaperType(paper);
    setSelectedTopic(topic);
    setSelectedPracticeMode(mode);
    setCurrentView('study');
  };

  const isToolsOpen = isCalculatorOpen || isNotepadOpen;

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-500 pb-12 relative overflow-x-hidden">
      {/* Static Floating Navbar (Never shifts or moves when tools are opened) */}
      <div>
        <Navbar 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          isCalculatorOpen={isCalculatorOpen}
          setIsCalculatorOpen={setIsCalculatorOpen}
          isNotepadOpen={isNotepadOpen}
          setIsNotepadOpen={setIsNotepadOpen}
        />
      </div>

      {/* Pop-Out Right Side Utility Widgets */}
      <Calculator 
        isOpen={isCalculatorOpen} 
        onClose={() => setIsCalculatorOpen(false)} 
      />

      <Notepad 
        isOpen={isNotepadOpen}
        onClose={() => setIsNotepadOpen(false)}
      />

      {/* Main View Container (Reserves right space when tools open, ZERO left cutoff) */}
      <main className={`flex-1 w-full mt-4 transition-all duration-300 ${
        isToolsOpen ? 'xl:pr-[350px]' : ''
      }`}>
        {currentView === 'dashboard' && (
          <Dashboard onStartPractice={handleStartPractice} />
        )}

        {currentView === 'study' && (
          <StudyHub 
            initialTopic={selectedTopic}
            initialMode={selectedPracticeMode}
          />
        )}

        {currentView === 'progress' && (
          <ProgressPage />
        )}

        {currentView === 'settings' && (
          <div className="max-w-3xl mx-auto my-8 px-4 space-y-6">
            <div className={`${glassClass} p-8 rounded-3xl space-y-6`}>
              <h2 className="text-xl font-extrabold text-slate-950 font-mono uppercase border-b border-slate-300/80 pb-4">
                {t('settings')}
              </h2>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex justify-between items-center p-3.5 rounded-xl bg-[#DFD9CD] border border-slate-300/80">
                  <span className="text-slate-950 font-extrabold">LICENSE KEY</span>
                  <span className="text-cyan-900 font-extrabold text-sm">{student.licenseKey}</span>
                </div>

                <div className="flex justify-between items-center p-3.5 rounded-xl bg-[#DFD9CD] border border-slate-300/80">
                  <span className="text-slate-950 font-extrabold">ACTIVE LANGUAGE</span>
                  <button
                    onClick={toggleLanguage}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 flex items-center gap-1.5 shadow-sm"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{language.toUpperCase()}</span>
                  </button>
                </div>

                <div className="flex justify-between items-center p-3.5 rounded-xl bg-[#DFD9CD] border border-slate-300/80">
                  <span className="text-slate-950 font-extrabold">{t('current_paper_label')}</span>
                  <button
                    onClick={togglePaper}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 flex items-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{paperType === 'paper_1' ? 'Paper 1' : 'Paper 2'}</span>
                  </button>
                </div>

                <div className="flex justify-between items-center p-3.5 rounded-xl bg-[#DFD9CD] border border-slate-300/80">
                  <div className="flex flex-col">
                    <span className="text-slate-950 font-extrabold uppercase">
                      {language === 'af' ? 'FORMULE HOOFDE / TITELS' : 'FORMULA SHEET TITLES'}
                    </span>
                    <span className="text-[11px] text-slate-700 font-bold">
                      {language === 'af' ? 'Wys of verberg kategorie-titels in die formuleboekie' : 'Show or hide category section titles in formula booklet'}
                    </span>
                  </div>
                  <button
                    onClick={toggleFormulaTitles}
                    className={`px-3.5 py-1.5 rounded-xl text-white font-bold transition-all font-mono text-xs uppercase shadow-sm ${
                      showFormulaTitles ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <span>{showFormulaTitles ? (language === 'af' ? 'AAN (WYS TITELS)' : 'SHOW TITLES') : (language === 'af' ? 'AF (VERBERG TITELS)' : 'HIDE TITLES')}</span>
                  </button>
                </div>

                {student.isMaster && (
                  <div className="flex justify-between items-center p-3.5 rounded-xl bg-amber-100 border border-amber-300">
                    <span className="text-amber-950 font-extrabold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-700" />
                      ADMIN MANAGEMENT PORTAL
                    </span>
                    <button
                      onClick={() => setShowAdmin(!showAdmin)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-800 text-white font-bold hover:bg-amber-900 font-mono text-xs uppercase shadow-sm"
                    >
                      {showAdmin ? 'Hide Portal' : 'Open Portal'}
                    </button>
                  </div>
                )}
              </div>

              {showAdmin && student.isMaster && (
                <div className="pt-4 border-t border-slate-300/80">
                  <AdminPanel />
                </div>
              )}

              <button
                onClick={logout}
                className="w-full py-3.5 rounded-xl font-mono text-xs font-bold uppercase bg-rose-700 hover:bg-rose-800 text-white transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout')}</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <MainContent />
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
