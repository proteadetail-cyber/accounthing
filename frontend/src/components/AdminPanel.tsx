import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ShieldCheck, Upload, Download, Plus, AlertTriangle, CheckCircle2, FileCode } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { glassClass } = useTheme();
  const { student } = useAuth();

  const [masterInput, setMasterInput] = useState('');
  const [isAdminAuth, setIsAdminAuth] = useState(student?.isMaster || false);
  const [jsonInput, setJsonInput] = useState('');
  const [importReport, setImportReport] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterKey: masterInput.trim() })
      });
      if (res.ok) {
        setIsAdminAuth(true);
      } else {
        alert('Invalid Master Key');
      }
    } catch (err) {
      alert('Authentication failed');
    }
  };

  const handleBulkImport = async () => {
    if (!jsonInput.trim()) return;
    setIsProcessing(true);
    setImportReport(null);

    try {
      const parsed = JSON.parse(jsonInput);
      const questionsArray = Array.isArray(parsed) ? parsed : parsed.questions ? parsed.questions : [parsed];

      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-master-key': masterInput.trim() || (import.meta as any).env?.VITE_MASTER_KEY || 'SA-ACC-MASTER-2026'
        },
        body: JSON.stringify({ questions: questionsArray })
      });

      const data = await res.json();
      setImportReport(data);
    } catch (err: any) {
      setImportReport({
        error: `JSON Parse Error: ${err.message}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/admin/export', {
        headers: {
          'x-master-key': masterInput.trim() || 'SA-ACC-MASTER-2026'
        }
      });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grade12_accounting_questions_${Date.now()}.json`;
      a.click();
    } catch (err) {
      alert('Export failed');
    }
  };

  if (!isAdminAuth) {
    return (
      <div className="max-w-md mx-auto my-12 px-4">
        <form onSubmit={handleAdminLogin} className={`${glassClass} p-8 rounded-3xl border shadow-2xl space-y-4 text-center`}>
          <ShieldCheck className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">ADMIN MANAGEMENT PORTAL</h2>
          <p className="text-xs text-slate-400 font-mono">
            Enter your server-configured Master Key to unlock question administration & bulk importer.
          </p>
          <input
            type="password"
            value={masterInput}
            onChange={(e) => setMasterInput(e.target.value)}
            placeholder="Enter MASTER_KEY..."
            className="w-full px-4 py-3 rounded-xl bg-white text-slate-950 font-bold placeholder-slate-400 text-sm font-mono border border-slate-300 focus:ring-2 focus:ring-rose-500/50 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-mono text-xs font-bold uppercase bg-rose-500 hover:bg-rose-400 text-slate-950 transition-all"
          >
            UNLOCK ADMIN PORTAL
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-rose-400" />
            <span>ADMIN MANAGEMENT & BULK QUESTION IMPORTER</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Import, export, and manage South African Grade 12 Accounting question repository
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 border border-white/10"
        >
          <Download className="w-4 h-4 text-cyan-400" />
          <span>EXPORT QUESTION BANK</span>
        </button>
      </div>

      {/* Bulk JSON Importer Box */}
      <div className={`${glassClass} p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-6`}>
        <div className="flex items-center gap-2 text-sm font-mono font-bold uppercase text-white">
          <Upload className="w-4 h-4 text-cyan-400" />
          <span>BULK QUESTION IMPORT (JSON FORMAT)</span>
        </div>

        <textarea
          rows={10}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`Paste JSON array of questions here... E.g.
[
  {
    "paper_type": "paper_1",
    "exam_type": "final",
    "topic_en": "Financial Statements",
    "topic_af": "Finansiële State",
    "difficulty": "medium",
    "question_text_en": "Calculate Gross Profit...",
    "total_marks": 5,
    "fields": [
      {
        "field_name_en": "Gross Profit",
        "answer_type": "number",
        "correct_answer": "600000",
        "marks": 2
      }
    ]
  }
]`}
          className="w-full p-4 rounded-2xl bg-white text-slate-950 font-medium placeholder-slate-400 text-xs font-mono border border-slate-300 focus:ring-2 focus:ring-cyan-500/50 focus:outline-none"
        />

        <div className="flex justify-end">
          <button
            onClick={handleBulkImport}
            disabled={isProcessing || !jsonInput.trim()}
            className="px-8 py-3.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white shadow-xl shadow-cyan-500/25 transition-all disabled:opacity-40"
          >
            {isProcessing ? 'Validating & Importing...' : 'PROCESS BULK IMPORT'}
          </button>
        </div>

        {/* Import Report */}
        {importReport && (
          <div className="p-6 rounded-2xl bg-black/40 border border-white/10 space-y-3 font-mono text-xs">
            <h4 className="font-bold text-white uppercase flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              IMPORT VALIDATION REPORT:
            </h4>

            {importReport.error ? (
              <div className="text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                {importReport.error}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-slate-200">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {importReport.success_count} Imported Successfully
                  </span>
                  {importReport.failed_count > 0 && (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {importReport.failed_count} Failed Validation
                    </span>
                  )}
                </div>

                {importReport.errors && importReport.errors.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-white/10">
                    <div className="text-rose-400 font-bold">Itemized Validation Failures:</div>
                    {importReport.errors.map((err: any, idx: number) => (
                      <div key={idx} className="text-slate-400 pl-2">
                        • Item #{err.item}: <span className="text-rose-300">{err.error}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
