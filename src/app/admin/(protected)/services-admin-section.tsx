'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Save, Trash2, Scissors } from 'lucide-react';

export type AdminService = {
  _id: string;
  name: string;
  durationMinutes: number;
  sortOrder: number;
  active: boolean;
};

type ServiceDraft = { name: string; durationMinutes: number; active: boolean };

const inputClass =
  'w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-300';

function draftFor(s: AdminService, rowDrafts: Record<string, ServiceDraft | undefined>): ServiceDraft {
  return rowDrafts[s._id] ?? { name: s.name, durationMinutes: s.durationMinutes, active: s.active };
}

function isRowDirty(s: AdminService, d: ServiceDraft): boolean {
  return (
    d.name.trim() !== s.name ||
    d.durationMinutes !== s.durationMinutes ||
    d.active !== s.active
  );
}

function ServicesAdminSection() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [rowDrafts, setRowDrafts] = useState<Record<string, ServiceDraft | undefined>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [newDuration, setNewDuration] = useState(60);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/services', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao carregar serviços');
      setServices(data);
      setRowDrafts({});
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = useMemo(() => {
    return services.some((s) => isRowDirty(s, draftFor(s, rowDrafts)));
  }, [services, rowDrafts]);

  async function saveAll() {
    const pending = services.filter((s) => isRowDirty(s, draftFor(s, rowDrafts)));
    if (pending.length === 0) return;

    for (const s of pending) {
      const d = draftFor(s, rowDrafts);
      if (!d.name.trim()) {
        setError('Todos os serviços precisam de um nome antes de guardar.');
        return;
      }
      if (!Number.isFinite(d.durationMinutes) || d.durationMinutes < 15 || d.durationMinutes > 480) {
        setError(`Duração inválida para «${d.name.trim()}» (use 15–480 min).`);
        return;
      }
    }

    setSaving(true);
    setError('');
    try {
      for (const s of pending) {
        const d = draftFor(s, rowDrafts);
        const res = await fetch(`/api/admin/services/${s._id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: d.name.trim(),
            durationMinutes: d.durationMinutes,
            active: d.active,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Erro ao guardar «${d.name.trim()}»`);
      }
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setSaving(false);
    }
  }

  async function removeRow(id: string) {
    if (!confirm('Remover este serviço? Agendamentos antigos mantêm o nome em histórico.')) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao remover');
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setSaving(false);
    }
  }

  async function addService(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          durationMinutes: newDuration,
          sortOrder: services.length,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao criar');
      setNewName('');
      setNewDuration(60);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 border-l-4 border-l-pink-400">
      <div className="flex items-start gap-4 mb-6 pb-4 border-b border-slate-100">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-pink-600 border border-pink-100 shrink-0"
          title="Serviços e durações"
          aria-hidden
        >
          <Scissors size={22} strokeWidth={2} />
        </span>
        <p className="text-sm text-slate-600 pt-0.5">
          <span className="sr-only">Serviços e durações. </span>
          Cada serviço tem uma duração em minutos. O sistema bloqueia o tempo necessário na agenda (ex.: 90 min
          impedem outro agendamento a sobrepor-se). Edite os campos e use{' '}
          <strong className="font-semibold text-slate-700">Guardar alterações</strong> para aplicar tudo de uma vez;
          apagar continua por linha.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-2 text-sm mb-4">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12 text-rose-400">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mb-4">
            <button
              type="button"
              disabled={saving || !dirty}
              onClick={() => void saveAll()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-rose-500 to-pink-600 text-white font-semibold px-4 py-2.5 text-sm shadow-md disabled:opacity-50 disabled:pointer-events-none"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} strokeWidth={2} />}
              Guardar alterações
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-3 pr-4 font-semibold">Nome</th>
                  <th className="pb-3 pr-4 font-semibold w-32">Duração (min)</th>
                  <th className="pb-3 pr-4 font-semibold">Ativo</th>
                  <th className="pb-3 font-semibold w-24">Apagar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((s) => (
                  <ServiceRow
                    key={s._id}
                    s={s}
                    value={draftFor(s, rowDrafts)}
                    onChange={(v) =>
                      setRowDrafts((prev) => ({
                        ...prev,
                        [s._id]: v,
                      }))
                    }
                    disabled={saving}
                    onDelete={removeRow}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <form onSubmit={addService} className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Novo serviço</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome do serviço"
                className={inputClass}
              />
            </div>
            <div className="w-28">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Minutos</label>
              <input
                type="number"
                min={15}
                max={480}
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={saving || !newName.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-rose-500 to-pink-600 text-white font-semibold px-4 py-2.5 text-sm shadow-md disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              Adicionar
            </button>
          </form>
        </>
      )}
    </section>
  );
}

export default memo(ServicesAdminSection);

function ServiceRow({
  s,
  value,
  onChange,
  disabled,
  onDelete,
}: {
  s: AdminService;
  value: ServiceDraft;
  onChange: (v: ServiceDraft) => void;
  disabled: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <tr>
      <td className="py-3 pr-4">
        <input
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          className={inputClass}
          disabled={disabled}
        />
      </td>
      <td className="py-3 pr-4">
        <input
          type="number"
          min={15}
          max={480}
          value={value.durationMinutes}
          onChange={(e) => onChange({ ...value, durationMinutes: Number(e.target.value) })}
          className={inputClass}
          disabled={disabled}
        />
      </td>
      <td className="py-3 pr-4">
        <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700">
          <input
            type="checkbox"
            checked={value.active}
            onChange={(e) => onChange({ ...value, active: e.target.checked })}
            disabled={disabled}
            className="rounded border-slate-300 text-rose-600 focus:ring-rose-400"
          />
          Sim
        </label>
      </td>
      <td className="py-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDelete(s._id)}
          aria-label="Apagar serviço"
          title="Apagar"
          className="inline-flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 min-w-9 h-9 disabled:opacity-50"
        >
          <Trash2 size={16} strokeWidth={2} />
        </button>
      </td>
    </tr>
  );
}
