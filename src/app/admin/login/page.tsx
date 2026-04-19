'use client';

import { useEffect, useState } from 'react';
import { Loader2, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/auth', { credentials: 'include' });
        const data = await res.json();
        if (cancelled) return;
        if (data.authenticated) {
          window.location.assign('/admin');
          return;
        }
        setBootstrapping(data.needsBootstrap === true);
      } catch {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha no login');
      }
      window.location.assign('/admin');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setLoading(false);
    }
  }

  async function onBootstrap(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/auth/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          name: name.trim() || undefined,
          setupToken: setupToken.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao criar conta');
      }
      window.location.assign('/admin');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setLoading(false);
    }
  }

  if (bootstrapping === null) {
    return (
      <div className="max-w-md mx-auto flex justify-center py-24 text-rose-400">
        <Loader2 className="animate-spin" size={36} />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-linear-to-r from-rose-400/15 to-pink-500/15 border-b border-rose-100/80 px-8 pt-8 pb-6 text-center">
          <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-md border border-rose-100 flex items-center justify-center mb-4">
            <Lock className="text-rose-500" size={30} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {bootstrapping ? 'Primeiro administrador' : 'Acesso administrativo'}
          </h1>
          <p className="text-slate-600 text-sm mt-2">
            {bootstrapping
              ? 'Crie a primeira conta. Em produção use o token definido em ADMIN_SETUP_TOKEN.'
              : 'Entre com o seu email e senha.'}
          </p>
        </div>

        {bootstrapping ? (
          <form onSubmit={onBootstrap} className="p-8 space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 font-medium">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="boot-email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                id="boot-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-300"
              />
            </div>
            <div>
              <label htmlFor="boot-name" className="block text-sm font-semibold text-slate-700 mb-2">
                Nome (opcional)
              </label>
              <input
                id="boot-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-300"
              />
            </div>
            <div>
              <label htmlFor="boot-pw" className="block text-sm font-semibold text-slate-700 mb-2">
                Senha (mín. 8 caracteres)
              </label>
              <input
                id="boot-pw"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-300"
              />
            </div>
            <div>
              <label htmlFor="boot-token" className="block text-sm font-semibold text-slate-700 mb-2">
                Token de configuração
              </label>
              <input
                id="boot-token"
                type="password"
                autoComplete="off"
                value={setupToken}
                onChange={(e) => setSetupToken(e.target.value)}
                placeholder="Obrigatório em produção (ADMIN_SETUP_TOKEN)"
                className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-300 placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-linear-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-rose-200/60 transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={22} /> : null}
              Criar e entrar
            </button>
          </form>
        ) : (
          <form onSubmit={onLogin} className="p-8 space-y-5">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3 font-medium">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-300"
              />
            </div>
            <div>
              <label htmlFor="login-pw" className="block text-sm font-semibold text-slate-700 mb-2">
                Senha
              </label>
              <input
                id="login-pw"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-300"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-linear-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-rose-200/60 transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={22} /> : null}
              Entrar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
