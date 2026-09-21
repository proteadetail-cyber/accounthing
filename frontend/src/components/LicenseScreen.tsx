import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, KeyRound, Loader2, X } from 'lucide-react';

export const LicenseScreen: React.FC = () => {
  const { login, loginWithGoogle, error, setError } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const [key, setKey] = useState('');
  const [statusText, setStatusText] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Initialize official Google Identity Services if available
  useEffect(() => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    
    // Load GIS script dynamically
    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if ((window as any).google?.accounts?.id) {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
          });
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  const handleGoogleCredentialResponse = async (response: any) => {
    if (response?.credential) {
      setIsVerifying(true);
      setStatusText(t('verifying'));
      const ok = await loginWithGoogle({ googleToken: response.credential, language });
      if (ok) {
        setIsSuccess(true);
        setStatusText(t('access_granted'));
      } else {
        setIsVerifying(false);
        setStatusText(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || isVerifying) return;

    setIsVerifying(true);
    setStatusText(t('verifying'));

    setTimeout(async () => {
      const ok = await login(key.trim(), language);
      if (ok) {
        setStatusText(t('access_granted'));
        setIsSuccess(true);
      } else {
        setIsVerifying(false);
        setStatusText(null);
      }
    }, 600);
  };

  const triggerGoogleLoginPrompt = () => {
    if ((window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt();
        return;
      } catch (e) {
        setError('Google Sign-In could not be started.');
      }
    }
    setError('Google Sign-In is not configured.');
  };

  return (
    <div className="notepad-page h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <a
        className="notepad-side-marker"
        href={(import.meta as any).env?.VITE_WHOP_LICENSE_URL || 'https://whop.com/dashboard'}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Find Whop key"
      />
      <div className="notepad-key-hint" aria-hidden="true">FIND WHOP KEY</div>
      <svg className="notepad-squiggle-arrow" viewBox="0 0 180 96" aria-hidden="true">
        <defs>
          <marker id="notepad-arrowhead" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M0 0 L10 5 L0 10 Z" />
          </marker>
        </defs>
        <path d="M8 12 C28 44, 42 2, 61 34 S93 48, 106 18 S132 0, 153 42" markerEnd="url(#notepad-arrowhead)" />
      </svg>

      {/* Ambient background light forms */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Language Switcher Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleLanguage}
          className="bg-white/60 px-4 py-2 rounded-full text-xs font-semibold tracking-wider text-slate-700 hover:bg-white/90 transition-all flex items-center gap-2 border border-amber-200"
        >
          <span className="text-cyan-400 font-mono">AF | EN</span>
          <span>{language.toUpperCase()}</span>
        </button>
      </div>

      {/* Main Glass Access Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="sticky-note-panel font-script w-full max-w-sm p-6 sm:p-8 rounded-sm relative z-10"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/80 flex items-center justify-center mb-5 text-sky-700 border border-amber-300 shadow-sm">
            {isSuccess ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400 animate-bounce" />
            ) : (
              <KeyRound className="w-6 h-6" />
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-2">
            {language === 'af' ? 'SA GRAAD 12 REKENINGKUNDE' : 'SA GRADE 12 ACCOUNTING'}
          </h1>
          <p className="text-[11px] sm:text-xs text-sky-800 mb-5 uppercase tracking-wider">
            {language === 'af' ? 'Voer jou Whop lisensiesleutel in om te ontsluit' : 'Enter your Whop license key to unlock'}
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative">
              <label className="block text-left text-[10px] text-slate-700 uppercase mb-1.5 font-bold">
                {language === 'af' ? 'Whop Lisensiesleutel' : 'Whop License Key'}
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={language === 'af' ? 'bv. key_xxxxxxxxxxxxx' : 'e.g. key_xxxxxxxxxxxxx'}
                disabled={isVerifying}
                className={`w-full px-4 py-3 rounded-xl bg-white text-slate-950 font-mono font-bold placeholder-slate-400 text-xs tracking-wider border border-slate-300 focus:ring-2 focus:ring-cyan-500/50 transition-all ${
                  isVerifying ? 'opacity-70' : ''
                }`}
                autoFocus
              />
              {isVerifying && (
                <div className="absolute right-4 top-10 text-sky-700">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-rose-800 bg-rose-100/70 border border-rose-300 rounded-xl p-3 font-medium text-left space-y-1"
              >
                <div className="font-bold flex items-center gap-1.5">
                  <X className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-heading tracking-wide">{error}</span>
                </div>
              </motion.div>
            )}

            {statusText && (
              <div className="text-xs text-sky-800 tracking-wider animate-pulse py-1">
                {statusText}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !key.trim()}
              className={`activate-button w-full py-3.5 rounded-xl font-sans font-extrabold text-[11px] tracking-widest uppercase bg-[#0b0b0b] hover:bg-[#242424] text-white shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${isVerifying ? 'is-waiting' : isSuccess ? 'is-activated' : ''}`}
            >
              <span className="activate-button__icons" aria-hidden="true">
                <span className="activate-button__circle" />
                <span className="activate-button__arrow" />
                <span className="activate-button__check">✓</span>
              </span>
              <span className="activate-button__labels" aria-live="polite">
                <span>UNLOCK</span>
                <span>WAITING</span>
                <span>UNLOCKED</span>
              </span>
            </button>
          </form>

          {/* Checkout Button for Non-License Holders */}
          <div className="w-full pt-4 mt-2">
            <a
              href={(import.meta as any).env?.VITE_WHOP_CHECKOUT_URL || 'https://whop.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-[#0b0b0b] hover:bg-[#242424] text-white border border-[#0b0b0b] font-sans font-bold text-[11px] tracking-wider transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <img
                src="https://whop.com/favicon.ico"
                alt=""
                className="whop-mark"
              />
              <span>{language === 'af' ? 'Geen toegang nie? Kry die kursus' : "Don't have access? Get the course"}</span>
            </a>
          </div>

          {/* Google Auth Divider */}
          <div className="flex items-center gap-3 w-full my-4">
            <div className="h-px bg-slate-900/15 flex-1" />
            <span className="text-[10px] uppercase text-slate-600 tracking-wider">
              {language === 'af' ? 'OF TEKEN IN MET GOOGLE' : 'OR SIGN IN WITH GOOGLE'}
            </span>
            <div className="h-px bg-slate-900/15 flex-1" />
          </div>

          {/* Official Google Sign-In Button */}
          <button
            type="button"
            onClick={triggerGoogleLoginPrompt}
            disabled={isVerifying}
            className="w-full py-3 px-3 rounded-xl bg-white/85 hover:bg-white text-slate-900 font-sans font-extrabold text-[11px] tracking-wider transition-all duration-200 shadow-md border border-amber-300 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt=""
              className="w-5 h-5"
            />
            <span>{language === 'af' ? 'TEKEN IN MET GOOGLE' : 'SIGN IN WITH GOOGLE'}</span>
          </button>

        </div>
      </motion.div>

      {/* Footer Branding */}
      <div className="mt-8 text-center text-xs text-slate-600 font-mono tracking-wider">
        ACCOUNTING • DETERMINISTIC ENGINE
      </div>
    </div>
  );
};
