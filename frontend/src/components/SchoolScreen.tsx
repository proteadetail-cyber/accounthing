import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const SchoolScreen: React.FC = () => {
  const { saveSchool, logout, error, setError } = useAuth();
  const { language } = useLanguage();
  const [school, setSchool] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isAf = language === 'af';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || school.trim().length < 2) return;
    setIsSaving(true);
    await saveSchool(school);
    setIsSaving(false);
  };

  return (
    <div className="notepad-page h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="sticky-note-panel font-script w-full max-w-sm p-6 sm:p-8 rounded-sm relative z-10"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/80 flex items-center justify-center mb-5 text-sky-700 border border-amber-300 shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-2">
            {isAf ? 'WAARHEEN GAAN JY SKOOL?' : 'WHAT SCHOOL ARE YOU FROM?'}
          </h1>
          <p className="text-[11px] sm:text-xs text-sky-800 mb-5 uppercase tracking-wider">
            {isAf ? 'Tik jou skool se naam om voort te gaan' : 'Type your school name to continue'}
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <label htmlFor="school-name" className="block text-left text-[10px] text-slate-700 uppercase mb-1.5 font-bold">
                {isAf ? 'Skool' : 'School'}
              </label>
              <input
                id="school-name"
                type="text"
                value={school}
                onChange={(e) => { setSchool(e.target.value); if (error) setError(null); }}
                maxLength={100}
                autoFocus
                autoComplete="organization"
                disabled={isSaving}
                placeholder={isAf ? 'bv. Hoërskool Pretoria' : 'e.g. Pretoria High School'}
                className="w-full px-4 py-3 rounded-xl bg-white text-slate-950 font-bold text-sm border border-slate-400 focus:border-cyan-600 focus:ring-2 focus:outline-none"
              />
            </div>

            {error && <p className="text-xs font-bold text-rose-700">{error}</p>}

            <button
              type="submit"
              disabled={isSaving || school.trim().length < 2}
              className="w-full py-3 rounded-xl bg-slate-950 text-white font-bold tracking-wider text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isAf ? 'GAAN VOORT' : 'CONTINUE'}
            </button>
          </form>

          <button type="button" onClick={logout} className="mt-4 text-[10px] uppercase tracking-wider text-slate-600 underline">
            {isAf ? 'Teken uit' : 'Log out'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
