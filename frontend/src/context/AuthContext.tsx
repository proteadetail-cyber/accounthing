import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentSession } from '../types';

interface AuthContextType {
  student: StudentSession | null;
  token: string | null;
  login: (licenseKey: string, language?: string) => Promise<boolean>;
  loginWithWhop: (licenseKey: string, language?: string) => Promise<boolean>;
  loginWithGoogle: (googleData: { googleToken?: string; profile?: any; language?: string }) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  setError: (err: string | null) => void;
  checkoutUrl: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<StudentSession | null>(() => {
    const saved = localStorage.getItem('sa_acc_student');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('sa_acc_token') || null;
  });

  const [error, setError] = useState<string | null>(null);
  const checkoutUrl = (import.meta as any).env?.VITE_WHOP_CHECKOUT_URL || 'https://whop.com';

  // Session verification on mount
  useEffect(() => {
    if (token) {
      fetch('/api/auth/session', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (!data.valid) {
            setError(data.error || 'Your Whop subscription has expired or was revoked.');
            logout();
          }
        })
        .catch(() => {
          // Ignore offline check errors
        });
    }
  }, []);

  const login = async (licenseKey: string, language = 'en'): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch('/api/auth/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey, language })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid or expired Whop license key.');
        return false;
      }

      setStudent(data.student);
      setToken(data.token);
      localStorage.setItem('sa_acc_student', JSON.stringify(data.student));
      localStorage.setItem('sa_acc_token', data.token);

      return true;
    } catch (err: any) {
      setError('Connection failed. Please verify server status.');
      return false;
    }
  };

  const loginWithWhop = login;

  const loginWithGoogle = async ({ googleToken, profile, language = 'en' }: { googleToken?: string; profile?: any; language?: string }): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleToken, profile, language })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Google authentication failed.');
        return false;
      }

      setStudent(data.student);
      setToken(data.token);
      localStorage.setItem('sa_acc_student', JSON.stringify(data.student));
      localStorage.setItem('sa_acc_token', data.token);

      return true;
    } catch (err: any) {
      setError('Google Sign-In server connection failed.');
      return false;
    }
  };

  const logout = () => {
    setStudent(null);
    setToken(null);
    localStorage.removeItem('sa_acc_student');
    localStorage.removeItem('sa_acc_token');
  };

  return (
    <AuthContext.Provider value={{ student, token, login, loginWithWhop, loginWithGoogle, logout, error, setError, checkoutUrl }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
