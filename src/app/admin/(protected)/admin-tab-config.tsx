import {
  CalendarClock,
  CalendarDays,
  LayoutList,
  Scissors,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import type { TabId } from "./admin-dashboard-types";

export const inputClass =
  "w-full rounded-xl bg-slate-50 border border-slate-200 text-slate-800 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-300 transition-shadow";

export const labelClass = "block text-sm font-semibold text-slate-700 mb-2";

export const adminTabs: { id: TabId; label: string; icon: ReactNode }[] = [
  {
    id: "agendamentos",
    label: "Agendamentos",
    icon: <LayoutList size={20} strokeWidth={2} />,
  },
  {
    id: "expediente",
    label: "Expediente",
    icon: <CalendarClock size={20} strokeWidth={2} />,
  },
  {
    id: "servicos",
    label: "Serviços",
    icon: <Scissors size={20} strokeWidth={2} />,
  },
  {
    id: "bloqueios",
    label: "Bloqueios e feriados",
    icon: <CalendarDays size={20} strokeWidth={2} />,
  },
  {
    id: "equipa",
    label: "Equipa",
    icon: <Users size={20} strokeWidth={2} />,
  },
];
