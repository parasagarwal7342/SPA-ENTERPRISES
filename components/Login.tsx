import React, { useEffect, useState } from 'react';
import { ShieldCheck, Truck, Package } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { navigate, useDocumentMeta, useLocation } from '../lib/router';
import { ErrorNote, Field, Spinner } from './ui';
import type { User } from '../types';

const landingFor = (u: User, next: string | null) =>
  next && next.startsWith('/') && !next.startsWith('//') ? next : u.role === 'owner' ? '/owner' : u.role === 'seller' ? '/staff' : '/account';

const Login: React.FC = () => {
  const { login, register, user } = useAuth();
  const { search } = useLocation();
  const next = new URLSearchParams(search).get('next');
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useDocumentMeta(mode === 'signin' ? 'Sign in' : 'Create account');

  useEffect(() => {
    if (user) navigate(landingFor(user, next), { replace: true });
  }, [user, next]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signin') await login(form.email, form.password);
      else await register(form);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="max-w-5xl mx-auto px-4 pt-28 pb-20 grid md:grid-cols-2 gap-10 items-center">
      <div className="hidden md:block">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Welcome to SPA Enterprise</h1>
        <p className="text-slate-600 mb-8">Sign in to see your orders and check out faster. Staff and owners use the same sign-in.</p>
        <ul className="space-y-4 text-sm text-slate-700">
          <li className="flex gap-3"><Package className="text-blue-600" size={20} /> All your orders in one place</li>
          <li className="flex gap-3"><Truck className="text-blue-600" size={20} /> Live order status and tracking</li>
          <li className="flex gap-3"><ShieldCheck className="text-blue-600" size={20} /> Your details are stored securely</li>
        </ul>
      </div>

      <div className="card p-6 sm:p-8">
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6">
          {(['signin', 'register'] as const).map((m) => (
            <button key={m} type="button" onClick={() => { setMode(m); setError(null); }} className={`py-2.5 rounded-lg text-sm font-semibold transition ${mode === m ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
              {m === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <>
              <Field label="Full name"><input required minLength={2} value={form.name} onChange={set('name')} className="input" autoComplete="name" /></Field>
              <Field label="Mobile number (optional)"><input type="tel" value={form.phone} onChange={set('phone')} className="input" autoComplete="tel" /></Field>
            </>
          )}
          <Field label="Email"><input required type="email" value={form.email} onChange={set('email')} className="input" autoComplete="email" /></Field>
          <Field label="Password" hint={mode === 'register' ? 'At least 8 characters' : undefined}>
            <input required type="password" minLength={mode === 'register' ? 8 : 1} value={form.password} onChange={set('password')} className="input" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
          </Field>
          <ErrorNote>{error}</ErrorNote>
          <button type="submit" disabled={busy} className="btn-dark w-full py-3.5">
            {busy ? <Spinner size={18} className="text-white" /> : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
          {mode === 'signin' && (
            <p className="text-xs text-slate-500 text-center">Forgot your password? WhatsApp us at +91 93122 77087 and we'll reset it.</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;
