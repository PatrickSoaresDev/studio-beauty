"use client";

import type { BookingStatus, ServiceOption } from "@/hooks/use-booking-flow";
import {
  formatBrazilMobileDisplay,
  parseBrazilMobileDigits,
} from "@/lib/br-phone";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Phone, User } from "lucide-react";

type FormData = { name: string; phone: string };

type Props = {
  formData: FormData;
  onFormChange: (data: FormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  serviceChosen: boolean;
  selectedService: ServiceOption | undefined;
  selectedDate: Date;
  selectedTime: string | null;
  bookingStatus: BookingStatus;
  errorMessage: string;
  submitBlockedReason: string | null;
};

export function BookingContactForm({
  formData,
  onFormChange,
  onSubmit,
  serviceChosen,
  selectedService,
  selectedDate,
  selectedTime,
  bookingStatus,
  errorMessage,
  submitBlockedReason,
}: Props) {
  return (
    <div className="md:w-1/2 p-6 md:p-8 bg-white">
      <div className="flex items-center gap-2 text-rose-600 font-bold text-sm uppercase tracking-wide mb-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-xs">
          4
        </span>
        Os seus dados
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Nome completo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="text-slate-400" size={18} />
            </div>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                onFormChange({ ...formData, name: e.target.value })
              }
              placeholder="Ex: Maria Silva"
              autoComplete="name"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            WhatsApp
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className="text-slate-400" size={18} />
            </div>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              required
              value={formatBrazilMobileDisplay(formData.phone)}
              onChange={(e) =>
                onFormChange({
                  ...formData,
                  phone: parseBrazilMobileDigits(e.target.value),
                })
              }
              placeholder="(11) 98765-4321"
              aria-describedby="phone-hint"
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all placeholder:text-slate-400"
            />
            <p id="phone-hint" className="mt-1.5 text-xs text-slate-500">
              Apenas números — DDD + celular (10 ou 11 dígitos).
            </p>
          </div>
        </div>

        {serviceChosen && selectedService && (
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm">
            <p className="font-semibold text-slate-800 mb-2">
              Resumo do pedido
            </p>
            <ul className="space-y-1 text-slate-600">
              <li>
                <span className="text-slate-500">Serviço:</span>{" "}
                {selectedService.name} ({selectedService.durationMinutes} min)
              </li>
              <li>
                <span className="text-slate-500">Data:</span>{" "}
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </li>
              <li>
                <span className="text-slate-500">Hora:</span>{" "}
                {selectedTime ? (
                  <strong className="text-rose-600">{selectedTime}</strong>
                ) : (
                  <span className="text-amber-600">
                    escolha um horário à esquerda
                  </span>
                )}
              </li>
            </ul>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-2">
            <span className="mt-0.5">⚠️</span> {errorMessage}
          </div>
        )}

        <div className="pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={
              bookingStatus === "loading" || !serviceChosen || !selectedTime
            }
            className="w-full bg-linear-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-200 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-45 disabled:pointer-events-none flex flex-col items-center justify-center gap-1 min-h-14"
          >
            {bookingStatus === "loading" ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} />A enviar...
              </span>
            ) : (
              <>
                <span>Enviar pedido de agendamento</span>
                {submitBlockedReason && (
                  <span className="text-xs font-normal opacity-90 text-rose-100">
                    ({submitBlockedReason})
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
