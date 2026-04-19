import { format } from "date-fns";

export type AppointmentRow = {
  _id: string;
  clientName: string;
  clientPhone: string;
  serviceType: string;
  serviceDisplayName?: string;
  durationMinutes?: number;
  status?: string;
  date: string;
};

export type ScheduleRuleRow = {
  _id: string;
  type: "closed_day" | "blocked_hour";
  dateKey: string;
  hour?: number;
  note?: string;
};

export type TabId =
  | "agendamentos"
  | "expediente"
  | "servicos"
  | "bloqueios"
  | "equipa";

export function todayKey() {
  return format(new Date(), "yyyy-MM-dd");
}

export function addDaysKey(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return format(d, "yyyy-MM-dd");
}
