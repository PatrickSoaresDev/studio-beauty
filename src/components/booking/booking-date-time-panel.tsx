"use client";

import BookingCalendar from "@/components/booking-calendar";
import type { ServiceOption } from "@/hooks/use-booking-flow";
import { Loader2 } from "lucide-react";
import { TimeChip } from "./time-chip";

type Props = {
  today: Date;
  serviceChosen: boolean;
  selectedService: ServiceOption | undefined;
  selectedDate: Date;
  onSelectDateFromCalendar: (d: Date) => void;
  dateHasSlots: Record<string, boolean> | null;
  noSlotsForSelectedDate: boolean;
  loadingTimes: boolean;
  availableTimes: string[];
  morningSlots: string[];
  afternoonSlots: string[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
};

export function BookingDateTimePanel({
  today,
  serviceChosen,
  selectedService,
  selectedDate,
  onSelectDateFromCalendar,
  dateHasSlots,
  noSlotsForSelectedDate,
  loadingTimes,
  availableTimes,
  morningSlots,
  afternoonSlots,
  selectedTime,
  onSelectTime,
}: Props) {
  return (
    <div
      className={`md:w-1/2 p-6 md:p-8 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-100 transition-opacity ${
        !serviceChosen ? "opacity-50 pointer-events-none select-none" : ""
      }`}
    >
      {!serviceChosen && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-4 md:hidden">
          Complete o passo 1 para escolher data e horário.
        </p>
      )}

      <div className="flex items-center gap-2 text-rose-600 font-bold text-sm uppercase tracking-wide mb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-xs">
          2
        </span>
        Data
      </div>
      <div className="mb-8">
        <BookingCalendar
          today={today}
          selectedDate={selectedDate}
          onSelectDate={onSelectDateFromCalendar}
          disabled={!serviceChosen}
          dateHasSlots={serviceChosen ? dateHasSlots : null}
        />
      </div>

      <div
        className={`flex items-center gap-2 font-bold text-sm uppercase tracking-wide mb-2 transition-colors ${
          noSlotsForSelectedDate ? "text-slate-400" : "text-rose-600"
        }`}
      >
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors ${
            noSlotsForSelectedDate
              ? "bg-slate-200 text-slate-500"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          3
        </span>
        Horário
      </div>
      {selectedService && (
        <p
          className={`text-xs mb-3 transition-colors ${
            noSlotsForSelectedDate ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Duração:{" "}
          <strong
            className={
              noSlotsForSelectedDate
                ? "text-slate-500 font-semibold"
                : "text-slate-700"
            }
          >
            {selectedService.durationMinutes} min
          </strong>{" "}
          · Inícios de 15 em 15 min (9h–18h)
        </p>
      )}

      <div
        className={`min-h-[120px] rounded-2xl transition-colors ${
          noSlotsForSelectedDate
            ? "border border-slate-200/90 bg-slate-100/70 p-4 -mx-1"
            : ""
        }`}
      >
        {!serviceChosen ? (
          <p className="text-sm text-slate-400 italic py-8 text-center hidden md:block">
            Selecione o serviço no passo 1 para ver os horários disponíveis.
          </p>
        ) : (
          <div className="relative min-h-[min(320px,50vh)]">
            {loadingTimes && (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-50/85 backdrop-blur-[1px]"
                aria-busy
                aria-live="polite"
              >
                <Loader2 className="animate-spin text-rose-400" size={22} />
                <p className="text-xs text-slate-500">A carregar horários…</p>
              </div>
            )}
            {!loadingTimes && availableTimes.length > 0 ? (
              <div className="space-y-6">
                {morningSlots.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Manhã
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {morningSlots.map((time) => (
                        <TimeChip
                          key={time}
                          time={time}
                          selected={selectedTime === time}
                          onPick={() => onSelectTime(time)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {afternoonSlots.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      Tarde
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {afternoonSlots.map((time) => (
                        <TimeChip
                          key={time}
                          time={time}
                          selected={selectedTime === time}
                          onPick={() => onSelectTime(time)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
            {!loadingTimes && availableTimes.length === 0 ? (
              <div className="text-center py-3 px-1">
                <p className="font-medium text-slate-600">
                  Nenhum horário livre nesta data
                </p>
                <p className="text-sm mt-1.5 text-slate-500">
                  Escolha outro dia no calendário.
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
