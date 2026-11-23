'use client';

import { FormEvent, useState } from 'react';
import { ArrowLeft, LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import { useFairWork } from '@/lib/fairwork-store';

export default function AuthScreen() {
  const { signIn, signUp, selectMode } = useFairWork();
  const [isRegister, setIsRegister] = useState(false);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      if (isRegister) {
        const result = await signUp(nama.trim(), email.trim(), password);
        if (result) setMessage(result);
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err: any) {
      setError(err?.message || 'Autentikasi gagal. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-7 bg-gradient-to-br from-indigo-700 to-indigo-500 text-white">
          <div className="w-11 h-11 rounded-xl bg-white/15 grid place-items-center mb-4"><ShieldCheck className="w-6 h-6" /></div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-100">FairWork Live</p>
          <h1 className="mt-1 text-2xl font-bold">{isRegister ? 'Buat akun' : 'Masuk ke workspace'}</h1>
          <p className="mt-2 text-sm text-indigo-100">Mode ini memakai akun Supabase dan aturan akses proyek asli.</p>
        </div>

        <form onSubmit={submit} className="p-7 space-y-4">
          {isRegister && <label className="block text-sm font-medium text-slate-700">Nama
            <input required value={nama} onChange={(e) => setNama(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" placeholder="Nama lengkap" />
          </label>}
          <label className="block text-sm font-medium text-slate-700">Email
            <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" placeholder="nama@kampus.ac.id" />
          </label>
          <label className="block text-sm font-medium text-slate-700">Password
            <input required minLength={6} type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100" placeholder="Minimal 6 karakter" />
          </label>
          {error && <p className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}
          {message && <p className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">{message}</p>}
          <button disabled={busy} className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2">
            {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}{busy ? 'Memproses...' : isRegister ? 'Daftar akun' : 'Masuk'}
          </button>
        </form>
        <div className="px-7 pb-7 space-y-3 text-center text-sm">
          <button onClick={() => { setIsRegister(!isRegister); setError(''); setMessage(''); }} className="text-indigo-600 font-semibold hover:text-indigo-800">
            {isRegister ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
          </button>
          <button onClick={() => selectMode('demo')} className="block mx-auto text-slate-500 hover:text-slate-800 text-xs font-medium flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Demo Mode
          </button>
        </div>
      </section>
    </main>
  );
}
