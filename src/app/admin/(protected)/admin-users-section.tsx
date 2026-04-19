'use client';

import { memo, useCallback, useEffect, useState } from 'react';
import { Key, Loader2, UserPlus, Users } from 'lucide-react';

type AdminRow = {
  _id: string;
  email: string;
  name: string;
  active: boolean;
  role: 'owner' | 'admin';
  createdAt: string;
};

const inputClass =
  'w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-300';
const labelClass = 'block text-sm font-semibold text-slate-700 mb-2';

function AdminUsersSection() {
  const [users, setUsers] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<'owner' | 'admin' | null>(null);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const isOwner = myRole === 'owner';

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [authRes, usersRes] = await Promise.all([
        fetch('/api/admin/auth', { credentials: 'include' }),
        fetch('/api/admin/users', { credentials: 'include' }),
      ]);
      const authData = await authRes.json();
      const usersData = await usersRes.json();
      if (!authRes.ok) throw new Error(authData.error || 'Sessão inválida');
      if (!usersRes.ok) throw new Error(usersData.error || 'Erro ao carregar');
      setMyUserId(typeof authData.userId === 'string' ? authData.userId : null);
      setMyRole(authData.role === 'owner' ? 'owner' : 'admin');
      setUsers(usersData);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  async function addUser(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar');
      setEmail('');
      setName('');
      setPassword('');
      setUsers((prev) => [...prev, data].sort((a, b) => a.email.localeCompare(b.email)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setSaving(false);
    }
  }

  async function changeOwnPassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);
    if (newPwd !== confirmPwd) {
      setPwdMsg({ kind: 'err', text: 'A confirmação da nova senha não coincide.' });
      return;
    }
    setPwdSaving(true);
    try {
      const res = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro');
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setPwdMsg({ kind: 'ok', text: 'Senha alterada com sucesso.' });
    } catch (e: unknown) {
      setPwdMsg({ kind: 'err', text: e instanceof Error ? e.message : 'Erro' });
    } finally {
      setPwdSaving(false);
    }
  }

  async function setActive(id: string, active: boolean) {
    if (!active && !confirm('Desativar este administrador? Não poderá entrar até ser reativado.')) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro');
      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, active: data.active, role: data.role ?? u.role } : u,
        ),
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setSaving(false);
    }
  }

  function canToggleRow(u: AdminRow): boolean {
    if (!isOwner) return false;
    if (myUserId !== null && u._id === myUserId) return false;
    return true;
  }

  return (
    <section
      className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 space-y-8"
      aria-labelledby="tab-equipa"
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
          <Users size={24} />
        </span>
        <div>
          <h2 id="tab-equipa" className="font-bold text-lg text-slate-800">
            Administradores
          </h2>
          <p className="text-sm text-slate-600">
            O administrador principal gere contas (criar e ativar/desativar). Todos podem alterar a
            própria senha abaixo.
          </p>
        </div>
      </div>

      <form
        onSubmit={changeOwnPassword}
        className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-4"
      >
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Key size={18} className="text-rose-500" />
          A minha senha
        </h3>
        {pwdMsg ? (
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium ${
              pwdMsg.kind === 'ok'
                ? 'bg-emerald-50 border border-emerald-100 text-emerald-800'
                : 'bg-red-50 border border-red-100 text-red-700'
            }`}
          >
            {pwdMsg.text}
          </div>
        ) : null}
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass} htmlFor="own-cur-pw">
              Senha atual
            </label>
            <input
              id="own-cur-pw"
              type="password"
              autoComplete="current-password"
              required
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="own-new-pw">
              Nova senha
            </label>
            <input
              id="own-new-pw"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              className={inputClass}
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="own-confirm-pw">
              Confirmar nova senha
            </label>
            <input
              id="own-confirm-pw"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={pwdSaving}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
        >
          {pwdSaving ? <Loader2 className="animate-spin" size={18} /> : null}
          Guardar nova senha
        </button>
      </form>

      {error ? (
        <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm font-medium">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-12 text-rose-400">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
          {users.map((u) => (
            <li
              key={u._id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-50/50"
            >
              <div className="min-w-0">
                <div className="font-semibold text-slate-800 truncate flex flex-wrap items-center gap-2">
                  {u.email}
                  {u.role === 'owner' ? (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      Principal
                    </span>
                  ) : null}
                </div>
                {u.name ? <div className="text-sm text-slate-500">{u.name}</div> : null}
                <div className="text-xs text-slate-400 mt-0.5">
                  {u.active ? (
                    <span className="text-emerald-700 font-medium">Ativo</span>
                  ) : (
                    <span className="text-slate-500">Inativo</span>
                  )}
                </div>
              </div>
              {canToggleRow(u) ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setActive(u._id, !u.active)}
                  className={`shrink-0 text-sm font-semibold px-4 py-2 rounded-xl border transition-colors disabled:opacity-50 ${
                    u.active
                      ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                      : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {u.active ? 'Desativar' : 'Reativar'}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {isOwner ? (
        <form onSubmit={addUser} className="space-y-4 pt-2 border-t border-slate-100">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <UserPlus size={18} className="text-rose-500" />
            Novo administrador
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="new-admin-email">
                Email
              </label>
              <input
                id="new-admin-email"
                type="email"
                autoComplete="off"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="nome@empresa.pt"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="new-admin-name">
                Nome (opcional)
              </label>
              <input
                id="new-admin-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Ex.: Maria"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="new-admin-pw">
                Senha inicial
              </label>
              <input
                id="new-admin-pw"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-rose-500 to-pink-600 text-white font-semibold px-5 py-2.5 text-sm shadow-md disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : null}
            Adicionar
          </button>
        </form>
      ) : null}
    </section>
  );
}

export default memo(AdminUsersSection);
