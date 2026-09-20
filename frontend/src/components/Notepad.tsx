import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Trash2, FileText, X, Maximize2, Minimize2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface NotepadProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Notepad: React.FC<NotepadProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const TOTAL_PAGES = 20;

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [pages, setPages] = useState<string[]>(() => {
    const saved = localStorage.getItem('sa_acc_notepad_pages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === TOTAL_PAGES) return parsed;
      } catch (e) {}
    }
    return Array(TOTAL_PAGES).fill('');
  });

  // Never clear automatically - persist all 20 pages to localStorage
  useEffect(() => {
    localStorage.setItem('sa_acc_notepad_pages', JSON.stringify(pages));
  }, [pages]);

  const handleTextChange = (val: string) => {
    setPages(prev => {
      const copy = [...prev];
      copy[currentPage - 1] = val;
      return copy;
    });
  };

  const clearCurrentPage = () => {
    setPages(prev => {
      const copy = [...prev];
      copy[currentPage - 1] = '';
      return copy;
    });
  };

  const clearAllPages = () => {
    if (window.confirm('Are you sure you want to clear all 20 notepad pages?')) {
      setPages(Array(TOTAL_PAGES).fill(''));
    }
  };

  const nextPage = () => {
    setCurrentPage(prev => Math.min(TOTAL_PAGES, prev + 1));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className={`fixed z-50 shadow-2xl rounded-3xl overflow-hidden border-2 border-slate-900 bg-[#FAF9F6] text-slate-900 ${
          isExpanded 
            ? 'right-4 sm:right-10 top-20 w-[92vw] max-w-3xl' 
            : 'right-6 top-24 sm:top-28 w-80'
        }`}
      >
        {/* EXECUTIVE SLATE & GOLD DRAGGABLE HEADER BAR */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b-2 border-slate-700 shadow-md font-bold cursor-grab active:cursor-grabbing select-none">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span className="font-mono text-sm uppercase tracking-wider text-white font-extrabold">
              {language === 'af' ? 'REKENINGKUNDE NOTAS' : 'ACCOUNTING NOTEPAD'}
            </span>
          </div>

          {/* Top-Right White Action Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-all"
              title={isExpanded ? "Minimize Notepad" : "Expand Notepad"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4 text-white" /> : <Maximize2 className="w-4 h-4 text-white" />}
            </button>

            <button
              onClick={clearCurrentPage}
              className="px-2 py-1 rounded-lg hover:bg-white/20 text-white transition-all font-mono text-[11px] font-bold"
              title="Clear Current Page"
            >
              Clear Page
            </button>

            {/* Trash Can for Memory */}
            <button
              onClick={clearAllPages}
              className="p-1.5 rounded-lg hover:bg-rose-600 text-white transition-all"
              title="Trash All 20 Pages Memory"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-all"
              title="Close Notepad"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Page Navigator Bar */}
        <div className="px-3 py-1.5 bg-[#EFECE6] border-b border-slate-300 flex items-center justify-between font-mono text-xs text-slate-800 font-bold">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-slate-300 disabled:opacity-30 transition-all flex items-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="tracking-wider">
            Page {currentPage} of {TOTAL_PAGES}
          </span>

          <button
            onClick={nextPage}
            disabled={currentPage === TOTAL_PAGES}
            className="p-1 rounded hover:bg-slate-300 disabled:opacity-30 transition-all flex items-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Clean Paper Writing Area */}
        <div className="p-3 bg-[#FAF9F6]">
          <textarea
            rows={isExpanded ? 16 : 8}
            value={pages[currentPage - 1] || ''}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={`Type notes for Page ${currentPage} (saved automatically)...`}
            className="w-full p-3 rounded-xl bg-white text-slate-950 font-black text-black text-xs sm:text-sm font-mono leading-relaxed placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none shadow-inner border border-slate-300"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

