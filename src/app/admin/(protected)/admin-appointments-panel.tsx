"use client";

import { statusLabel } from "@/lib/appointment-status";
import { formatBrazilMobileDisplay } from "@/lib/br-phone";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, Loader2, X } from "lucide-react";
import type { AppointmentRow } from "./admin-dashboard-types";

function displayClientPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length >= 10 && d.length <= 11) {
    return formatBrazilMobileDisplay(d);
  }
  return raw;
}

type Props = {
  appointments: AppointmentRow[];
  loading: boolean;
  saving: boolean;
  onRefresh: () => void;
  onSetAppointmentStatus: (
    id: string,
    status: "confirmed" | "rejected",
  ) => void;
};

export function AdminAppointmentsPanel({
  appointments,
  loading,
  saving,
  onRefresh,
  onSetAppointmentStatus,
}: Props) {
  return (
    <section className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 id="tab-agendamentos" className="font-bold text-lg text-slate-800">
          Próximos agendamentos
        </h2>
        <button
          type="button"
          onClick={() => onRefresh()}
          disabled={loading}
          className="text-sm font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50"
        >
          Atualizar
        </button>
      </div>

      {loading && appointments.length === 0 ? (
        <div className="flex justify-center py-16 text-rose-400">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : !loading && appointments.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-12">
          Nenhum agendamento futuro.
        </p>
      ) : (
        <div className="relative overflow-x-auto rounded-2xl border border-slate-200">
          {loading && appointments.length > 0 ? (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/75 backdrop-blur-[1px]"
              aria-busy="true"
              aria-label="A atualizar"
            >
              <Loader2 className="animate-spin text-rose-400" size={32} />
            </div>
          ) : null}
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600 border-b border-slate-200">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Cliente
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 font-semibold whitespace-nowrap"
                >
                  Data e hora
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Tipo de serviço
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 font-semibold whitespace-nowrap"
                >
                  Estado
                </th>
                <th scope="col" className="px-4 py-3 font-semibold w-28">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.map((a) => {
                const st = a.status ?? "pending";
                const isPending = st === "pending";
                return (
                  <tr
                    key={a._id}
                    className="bg-white hover:bg-rose-50/40 transition-colors"
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-slate-800">
                        {a.clientName}
                      </div>
                          <div className="text-slate-500 text-xs mt-0.5">
                            {displayClientPhone(a.clientPhone)}
                          </div>
                    </td>
                    <td className="px-4 py-3 align-top whitespace-nowrap text-slate-800 tabular-nums">
                      {format(new Date(a.date), "dd/MM/yyyy · HH:mm", {
                        locale: ptBR,
                      })}
                    </td>
                    <td className="px-4 py-3 align-top text-slate-700">
                      {a.serviceDisplayName ?? a.serviceType}
                      {typeof a.durationMinutes === "number" ? (
                        <span className="text-slate-400 text-xs ml-1">
                          ({a.durationMinutes} min)
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          st === "pending"
                            ? "bg-amber-100 text-amber-900"
                            : st === "rejected"
                              ? "bg-red-100 text-red-900"
                              : "bg-emerald-100 text-emerald-900"
                        }`}
                      >
                        {statusLabel(st)}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {isPending ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() =>
                              onSetAppointmentStatus(a._id, "confirmed")
                            }
                            title="Aceitar"
                            aria-label="Aceitar agendamento"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 disabled:opacity-50"
                          >
                            <Check size={18} strokeWidth={2.5} />
                          </button>
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => {
                              if (
                                confirm(
                                  "Rejeitar este pedido? O horário volta a ficar livre.",
                                )
                              ) {
                                onSetAppointmentStatus(a._id, "rejected");
                              }
                            }}
                            title="Rejeitar"
                            aria-label="Rejeitar agendamento"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50"
                          >
                            <X size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
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
