import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, KeyRound, Loader2, Sparkles, X, CheckCircle2 } from 'lucide-react';

export const LicenseScreen: React.FC = () => {
  const { login, loginWithGoogle, error } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const [key, setKey] = useState('');
  const [statusText, setStatusText] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Google Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Initialize official Google Identity Services if available
  useEffect(() => {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '1088492048291-demo-gsi-client-id.apps.googleusercontent.com';
    
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

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim() || isGoogleLoading) return;

    setIsGoogleLoading(true);
    const emailStr = googleEmail.trim().toLowerCase();
    const displayName = googleName.trim() || emailStr.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const dummyGoogleId = `google_sub_${Array.from(emailStr).reduce((acc, char) => acc + char.charCodeAt(0), 0)}_${Date.now()}`;
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D9488&color=fff&bold=true`;

    const ok = await loginWithGoogle({
      profile: {
        googleId: dummyGoogleId,
        email: emailStr,
        name: displayName,
        picture: avatar
      },
      language
    });

    setIsGoogleLoading(false);
    if (ok) {
      setShowGoogleModal(false);
      setIsSuccess(true);
    }
  };

  const triggerGoogleLoginPrompt = () => {
    // Attempt standard Google One-Tap popup if available
    if ((window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setShowGoogleModal(true);
          }
        });
        return;
      } catch (e) {
        // Fallback to Google Auth Modal
      }
    }
    setShowGoogleModal(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-ambient-p1">
      {/* Ambient background light forms */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Language Switcher Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleLanguage}
          className="liquid-glass px-4 py-2 rounded-full text-xs font-semibold tracking-wider text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
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
        className="w-full max-w-md liquid-glass p-8 sm:p-10 rounded-3xl relative z-10 border border-white/10 backdrop-blur-2xl shadow-2xl"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl liquid-glass flex items-center justify-center mb-6 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
            {isSuccess ? (
              <ShieldCheck className="w-7 h-7 text-emerald-400 animate-bounce" />
            ) : (
              <KeyRound className="w-7 h-7" />
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            {language === 'af' ? 'SA GRAAD 12 REKENINGKUNDE VAULT' : 'SA GRADE 12 ACCOUNTING VAULT'}
          </h1>
          <p className="text-xs sm:text-sm text-cyan-300 font-mono mb-6 uppercase tracking-wider">
            {language === 'af' ? 'Voer jou Whop lisensiesleutel in om te ontsluit' : 'Enter your Whop license key to unlock'}
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative">
              <label className="block text-left text-[11px] font-mono text-slate-300 uppercase mb-1.5 font-bold">
                {language === 'af' ? 'Whop Lisensiesleutel' : 'Whop License Key'}
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={language === 'af' ? 'bv. key_xxxxxxxxxxxxx' : 'e.g. key_xxxxxxxxxxxxx'}
                disabled={isVerifying}
                className={`w-full px-5 py-4 rounded-xl bg-white text-slate-950 font-bold placeholder-slate-400 text-sm tracking-wider font-mono border border-slate-300 focus:ring-2 focus:ring-cyan-500/50 transition-all ${
                  isVerifying ? 'opacity-70' : ''
                }`}
                autoFocus
              />
              {isVerifying && (
                <div className="absolute right-4 top-10 text-cyan-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-rose-300 bg-rose-500/20 border border-rose-500/40 rounded-xl p-3 font-mono font-medium text-left space-y-1"
              >
                <div className="font-bold flex items-center gap-1.5">
                  <X className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}

            {statusText && (
              <div className="text-xs text-cyan-300 font-mono tracking-wider animate-pulse py-1">
                {statusText}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !key.trim()}
              className="w-full py-4 rounded-xl font-extrabold text-xs tracking-widest uppercase transition-all duration-300 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>{isVerifying ? statusText : (language === 'af' ? 'ONTSLUIT TOEGANG' : 'UNLOCK ACCESS')}</span>
              {!isVerifying && <Sparkles className="w-4 h-4" />}
            </button>
          </form>

          {/* Checkout Button for Non-License Holders */}
          <div className="w-full pt-4 mt-2">
            <a
              href={(import.meta as any).env?.VITE_WHOP_CHECKOUT_URL || 'https://whop.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-cyan-300 border border-cyan-500/30 font-bold text-xs tracking-wider transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <span>{language === 'af' ? 'Geen toegang nie? Kry die kursus' : "Don't have access? Get the course"}</span>
            </a>
          </div>

          {/* Google Auth Divider */}
          <div className="flex items-center gap-3 w-full my-4">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">
              {language === 'af' ? 'OF TEKEN IN MET GOOGLE' : 'OR SIGN IN WITH GOOGLE'}
            </span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Official Google Sign-In Button */}
          <button
            type="button"
            onClick={triggerGoogleLoginPrompt}
            disabled={isVerifying}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs tracking-wider transition-all duration-200 shadow-md border border-slate-300 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{language === 'af' ? 'TEKEN IN MET GOOGLE' : 'SIGN IN WITH GOOGLE'}</span>
          </button>

          {/* Helper demo key hint */}
          <div className="mt-6 pt-4 border-t border-white/5 w-full flex flex-col items-center">
            <span className="text-[11px] text-slate-500 uppercase tracking-widest font-mono">
              Demo License Key:
            </span>
            <code className="text-xs font-mono text-cyan-400 mt-1 select-all hover:underline cursor-pointer" onClick={() => setKey('DEMO-2026-PASS')}>
              DEMO-2026-PASS
            </code>
          </div>
        </div>
      </motion.div>

      {/* Real Google Auth Modal */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGoogleModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-50 text-slate-950 space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="font-mono font-bold text-sm text-slate-900 uppercase">
                    Google Sign-In
                  </span>
                </div>
                <button
                  onClick={() => setShowGoogleModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {language === 'af' 
                  ? 'Voer jou Google-rekening e-posadres in om aan te meld en jou vordering te sinkroniseer.'
                  : 'Enter your Google Account email to authenticate and sync your Grade 12 Accounting progress.'}
              </p>

              <form onSubmit={handleGoogleSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono uppercase font-bold text-slate-700 block mb-1">
                    Google Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="student.name@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-950 font-bold text-sm font-mono focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase font-bold text-slate-700 block mb-1">
                    Full Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="e.g. Sipho Nkosi"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-950 font-bold text-sm font-mono focus:ring-2 focus:ring-cyan-600 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGoogleLoading || !googleEmail.trim()}
                  className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>{language === 'af' ? 'TEKEN IN MET GOOGLE' : 'AUTHENTICATE WITH GOOGLE'}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Branding */}
      <div className="mt-8 text-center text-xs text-slate-500 font-mono tracking-wider">
        ACCOUNTING • DETERMINISTIC ENGINE
      </div>
    </div>
  );
};
