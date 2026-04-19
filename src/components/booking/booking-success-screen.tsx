"use client";

import type { ServiceOption } from "@/hooks/use-booking-flow";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2 } from "lucide-react";

type Props = {
  selectedService: ServiceOption | undefined;
  selectedDate: Date;
  selectedTime: string | null;
  onNewBooking: () => void;
};

export function BookingSuccessScreen({
  selectedService,
  selectedDate,
  selectedTime,
  onNewBooking,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center space-y-6 border border-rose-100">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-bold text-slate-800">Pedido enviado!</h2>
        <p className="text-slate-600">
          O seu pedido para{" "}
          <strong>{selectedService?.name ?? "serviço"}</strong> em{" "}
          <strong className="text-rose-600">
            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </strong>{" "}
          às <strong className="text-rose-600">{selectedTime}</strong> foi
          registado. O estúdio irá <strong>confirmar ou rejeitar</strong> o
          agendamento em breve.
        </p>
        <button
          type="button"
          onClick={onNewBooking}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl transition-colors mt-8"
        >
          Fazer novo agendamento
        </button>
      </div>
    </div>
  );
}
