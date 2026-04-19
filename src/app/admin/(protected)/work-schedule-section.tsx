'use client';

import { formatMinutesAsTime, parseTimeToMinutes } from '@/lib/business-hours';
import type { WorkDaySchedule } from '@/models/WorkSchedule';
import { CalendarClock, Loader2, Save } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';

const DAY_LABELS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

const inputClass =
  'rounded-xl bg-slate-50 border border-slate-200 text-slate-800 px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-300 disabled:opacity-50';

function minToInput(m: number): string {
  return formatMinutesAsTime(m);
}

function WorkScheduleSection() {
  const [days, setDays] = useState<WorkDaySchedule[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/work-schedule', { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao carregar expediente');
      setDays(data.days);
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

  async function save() {
    if (!days) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/work-schedule', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao guardar');
      setDays(data.days);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro');
    } finally {
      setSaving(false);
    }
  }

  function updateDay(i: number, patch: Partial<WorkDaySchedule>) {
    setDays((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  }

  return (
    <section className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 border-l-4 border-l-indigo-400">
      <div className="flex flex-wrap items-start gap-4 mb-6 pb-4 border-b border-slate-100">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0"
          aria-hidden
        >
          <CalendarClock size={22} strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="tab-expediente" className="font-bold text-lg text-slate-800">
            Horário de trabalho
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Defina abertura e fecho por dia da semana. Pode marcar um intervalo de almoço: nessa faixa não serão
            oferecidos horários. Os passos de marcação na página pública continuam a ser de 15 minutos.
          </p>
        </div>
        <button
          type="button"
          disabled={saving || !days || loading}
          onClick={() => void save()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-rose-500 to-pink-600 text-white font-semibold px-4 py-2.5 text-sm shadow-md disabled:opacity-50 shrink-0"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} strokeWidth={2} />}
          Guardar expediente
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-2 text-sm mb-4">{error}</div>
      )}

      {loading || !days ? (
        <div className="flex justify-center py-16 text-rose-400">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600 border-b border-slate-200">
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Dia</th>
                <th className="px-3 py-3 font-semibold">Aberto</th>
                <th className="px-3 py-3 font-semibold">Abre</th>
                <th className="px-3 py-3 font-semibold">Fecha</th>
                <th className="px-3 py-3 font-semibold">Almoço</th>
                <th className="px-3 py-3 font-semibold">Início</th>
                <th className="px-3 py-3 font-semibold">Fim</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {days.map((d, i) => {
                const hasLunch = d.lunchStartMin != null && d.lunchEndMin != null;
                return (
                  <tr key={i} className="bg-white">
                    <td className="px-3 py-3 font-medium text-slate-800 whitespace-nowrap">{DAY_LABELS[i]}</td>
                    <td className="px-3 py-3">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={d.enabled}
                          onChange={(e) => {
                            const enabled = e.target.checked;
                            updateDay(i, {
                              enabled,
                              ...(enabled
                                ? {}
                                : {
                                    lunchStartMin: null,
                                    lunchEndMin: null,
                                  }),
                            });
                          }}
                          disabled={saving}
                          className="rounded border-slate-300 text-rose-600 focus:ring-rose-400"
                        />
                        <span className="text-slate-600">Sim</span>
                      </label>
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="time"
                        step={300}
                        value={minToInput(d.startMin)}
                        onChange={(e) => {
                          const m = parseTimeToMinutes(e.target.value);
                          if (m !== null) updateDay(i, { startMin: m });
                        }}
                        disabled={saving || !d.enabled}
                        className={inputClass}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="time"
                        step={300}
                        value={minToInput(d.endMin)}
                        onChange={(e) => {
                          const m = parseTimeToMinutes(e.target.value);
                          if (m !== null) updateDay(i, { endMin: m });
                        }}
                        disabled={saving || !d.enabled}
                        className={inputClass}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasLunch}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateDay(i, {
                                lunchStartMin: 13 * 60,
                                lunchEndMin: 14 * 60,
                              });
                            } else {
                              updateDay(i, { lunchStartMin: null, lunchEndMin: null });
                            }
                          }}
                          disabled={saving || !d.enabled}
                          className="rounded border-slate-300 text-rose-600 focus:ring-rose-400"
                        />
                      </label>
                    </td>
                    <td className="px-3 py-3">
                      {hasLunch ? (
                        <input
                          type="time"
                          step={300}
                          value={minToInput(d.lunchStartMin!)}
                          onChange={(e) => {
                            const m = parseTimeToMinutes(e.target.value);
                            if (m !== null) updateDay(i, { lunchStartMin: m });
                          }}
                          disabled={saving || !d.enabled}
                          className={inputClass}
                        />
                      ) : (
                        <span className="text-slate-400 tabular-nums">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {hasLunch ? (
                        <input
                          type="time"
                          step={300}
                          value={minToInput(d.lunchEndMin!)}
                          onChange={(e) => {
                            const m = parseTimeToMinutes(e.target.value);
                            if (m !== null) updateDay(i, { lunchEndMin: m });
                          }}
                          disabled={saving || !d.enabled}
                          className={inputClass}
                        />
                      ) : (
                        <span className="text-slate-400 tabular-nums">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default memo(WorkScheduleSection);
