"use client";

import type { ServiceOption } from "@/hooks/use-booking-flow";
import { ChevronRight, Loader2 } from "lucide-react";

type Props = {
  services: ServiceOption[];
  loadingServices: boolean;
  selectedServiceId: string;
  onSelectService: (id: string) => void;
};

export function BookingServiceSection({
  services,
  loadingServices,
  selectedServiceId,
  onSelectService,
}: Props) {
  return (
    <section className="p-6 md:p-8 border-b border-slate-100 bg-linear-to-b from-white to-slate-50/80">
      <div className="flex items-center gap-2 text-rose-600 font-bold text-sm uppercase tracking-wide mb-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-xs">
          1
        </span>
        Tipo de serviço
      </div>
      <p className="text-sm text-slate-600 mb-4">
        Escolha o serviço primeiro. Os horários mostrados a seguir são calculados
        automaticamente para a duração correta — só pode marcar horários
        realmente livres.
      </p>
      {loadingServices ? (
        <div className="flex items-center gap-2 text-slate-500 py-4">
          <Loader2 className="animate-spin text-rose-400" size={22} />A carregar
          serviços...
        </div>
      ) : services.length === 0 ? (
        <div className="bg-orange-50 border border-orange-100 text-orange-900 rounded-2xl p-4 text-sm">
          Nenhum serviço disponível de momento.
        </div>
      ) : (
        <div className="relative max-w-xl">
          <label htmlFor="service-select" className="sr-only">
            Tipo de serviço
          </label>
          <select
            id="service-select"
            value={selectedServiceId}
            onChange={(e) => onSelectService(e.target.value)}
            required
            className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 rounded-xl px-4 py-4 text-base appearance-none outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all font-semibold"
          >
            <option value="" disabled>
              — Selecione o serviço —
            </option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} · {s.durationMinutes} min
              </option>
            ))}
          </select>
          <ChevronRight
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90"
            size={20}
          />
        </div>
      )}
    </section>
  );
}
