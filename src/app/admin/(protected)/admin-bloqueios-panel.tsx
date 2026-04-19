"use client";

import { ADMIN_BLOCKABLE_HOURS } from "@/lib/business-hours";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Ban,
  CalendarOff,
  CalendarPlus,
  Clock,
  Loader2,
  Trash2,
} from "lucide-react";
import { inputClass, labelClass } from "./admin-tab-config";
import type { ScheduleRuleRow } from "./admin-dashboard-types";

type Props = {
  closedDate: string;
  onClosedDateChange: (v: string) => void;
  closedNote: string;
  onClosedNoteChange: (v: string) => void;
  onAddClosedDay: (e: React.FormEvent) => void;
  blockDate: string;
  onBlockDateChange: (v: string) => void;
  blockHour: number;
  onBlockHourChange: (v: number) => void;
  blockNote: string;
  onBlockNoteChange: (v: string) => void;
  onAddBlockedHour: (e: React.FormEvent) => void;
  ruleFrom: string;
  onRuleFromChange: (v: string) => void;
  ruleTo: string;
  onRuleToChange: (v: string) => void;
  rules: ScheduleRuleRow[];
  loading: boolean;
  saving: boolean;
  onRefreshRules: () => void;
  onRemoveRule: (id: string) => void;
};

export function AdminBloqueiosPanel({
  closedDate,
  onClosedDateChange,
  closedNote,
  onClosedNoteChange,
  onAddClosedDay,
  blockDate,
  onBlockDateChange,
  blockHour,
  onBlockHourChange,
  blockNote,
  onBlockNoteChange,
  onAddBlockedHour,
  ruleFrom,
  onRuleFromChange,
  ruleTo,
  onRuleToChange,
  rules,
  loading,
  saving,
  onRefreshRules,
  onRemoveRule,
}: Props) {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        <form
          onSubmit={onAddClosedDay}
          className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 space-y-5 border-l-4 border-l-amber-400/90"
        >
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <CalendarOff size={20} />
            </span>
            Dia não trabalhado / feriado
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Nenhum horário será oferecido nesse dia (equivalente a um feriado).
          </p>
          <div>
            <label className={labelClass}>Data</label>
            <input
              type="date"
              required
              value={closedDate}
              onChange={(e) => onClosedDateChange(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Nota (opcional)</label>
            <input
              type="text"
              value={closedNote}
              onChange={(e) => onClosedNoteChange(e.target.value)}
              placeholder="Ex.: Feriado municipal"
              className={`${inputClass} placeholder:text-slate-400`}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-3 text-sm shadow-md shadow-amber-200/50 disabled:opacity-50 transition-colors w-full sm:w-auto"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <CalendarPlus size={18} />
            )}
            Fechar dia
          </button>
        </form>

        <form
          onSubmit={onAddBlockedHour}
          className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8 space-y-5 border-l-4 border-l-rose-400"
        >
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <Ban size={20} />
            </span>
            Bloquear um horário
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Indisponibiliza só uma hora (ex.: reunião), sem fechar o dia inteiro.
          </p>
          <div>
            <label className={labelClass}>Data</label>
            <input
              type="date"
              required
              value={blockDate}
              onChange={(e) => onBlockDateChange(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Hora</label>
            <select
              value={blockHour}
              onChange={(e) => onBlockHourChange(Number(e.target.value))}
              className={inputClass}
            >
              {ADMIN_BLOCKABLE_HOURS.map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")}:00
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Nota (opcional)</label>
            <input
              type="text"
              value={blockNote}
              onChange={(e) => onBlockNoteChange(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold px-5 py-3 text-sm shadow-lg shadow-rose-200/60 disabled:opacity-50 transition-all w-full sm:w-auto"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Clock size={18} />
            )}
            Bloquear horário
          </button>
        </form>
      </div>

      <section className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
        <div className="flex flex-wrap items-end gap-4 mb-6 pb-6 border-b border-slate-100">
          <h2
            id="tab-bloqueios"
            className="font-bold text-lg text-slate-800 w-full sm:w-auto sm:mr-4"
          >
            Regras no período
          </h2>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className={labelClass}>De</label>
              <input
                type="date"
                value={ruleFrom}
                onChange={(e) => onRuleFromChange(e.target.value)}
                className={`${inputClass} w-auto min-w-40`}
              />
            </div>
            <div>
              <label className={labelClass}>Até</label>
              <input
                type="date"
                value={ruleTo}
                onChange={(e) => onRuleToChange(e.target.value)}
                className={`${inputClass} w-auto min-w-40`}
              />
            </div>
            <button
              type="button"
              onClick={() => onRefreshRules()}
              className="text-sm font-semibold text-rose-600 hover:text-rose-700 underline-offset-2 hover:underline mb-0.5"
            >
              Atualizar lista
            </button>
          </div>
        </div>

        {loading && rules.length === 0 ? (
          <div className="flex justify-center py-14 text-rose-400">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : !loading && rules.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">
            Nenhuma regra neste intervalo.
          </p>
        ) : (
          <div className="relative">
            {loading && rules.length > 0 ? (
              <div
                className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/75 backdrop-blur-[1px]"
                aria-busy="true"
                aria-label="A atualizar"
              >
                <Loader2 className="animate-spin text-rose-400" size={32} />
              </div>
            ) : null}
            <ul className="divide-y divide-slate-100">
              {rules.map((r) => (
                <li
                  key={r._id}
                  className="py-4 flex flex-wrap items-start justify-between gap-3 first:pt-0"
                >
                  <div className="min-w-0">
                    <span className="text-slate-800 font-semibold">
                      {r.type === "closed_day"
                        ? "Dia fechado"
                        : `Hora bloqueada (${String(r.hour).padStart(2, "0")}:00)`}
                    </span>
                    <span className="text-slate-400 mx-2">·</span>
                    <span className="text-slate-600">
                      {format(
                        new Date(r.dateKey + "T12:00:00"),
                        "dd/MM/yyyy",
                        { locale: ptBR },
                      )}
                    </span>
                    {r.note && (
                      <p className="text-sm text-slate-500 mt-1.5">{r.note}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveRule(r._id)}
                    disabled={saving}
                    className="shrink-0 p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                    title="Remover"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
