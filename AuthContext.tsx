import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from './lib/api';
import type { User, UserRole } from './types';

export type { UserRole };

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isStaff: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; phone?: string; password: string }) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(!!tokenStore.get());

  useEffect(() => {
    try { localStorage.removeItem('spa_user'); localStorage.removeItem('app_password'); } catch { /* old mock-login data */ }
    if (!tokenStore.get()) return;
    api<{ user: User }>('/auth/me')
      .then((r) => setUser(r.user))
      .catch(() => tokenStore.set(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onSignedOut = () => setUser(null);
    window.addEventListener('spa:signed-out', onSignedOut);
    return () => window.removeEventListener('spa:signed-out', onSignedOut);
  }, []);

  const finish = (r: { token: string; user: User }) => {
    tokenStore.set(r.token);
    setUser(r.user);
    return r.user;
  };

  const login = useCallback(async (email: string, password: string) =>
    finish(await api<{ token: string; user: User }>('/auth/login', { body: { email, password } })), []);

  const register = useCallback(async (data: { name: string; email: string; phone?: string; password: string }) =>
    finish(await api<{ token: string; user: User }>('/auth/register', { body: data })), []);

  const logout = useCallback(() => {
    tokenStore.set(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout,
      isAuthenticated: !!user,
      isStaff: user?.role === 'seller' || user?.role === 'owner',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
