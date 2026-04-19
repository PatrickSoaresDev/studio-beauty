"use client";

import { LogOut } from "lucide-react";
import { adminTabs } from "./admin-tab-config";
import type { TabId } from "./admin-dashboard-types";

type Props = {
  activeTab: TabId;
  onSelectTab: (id: TabId) => void;
  onLogout: () => void;
};

export function AdminDashboardChrome({
  activeTab,
  onSelectTab,
  onLogout,
}: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="px-5 sm:px-6 py-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Painel
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Gerir agendamentos, serviços e indisponibilidades.
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 transition-colors"
        >
          <LogOut size={18} className="text-slate-500" />
          Sair
        </button>
      </div>

      <div
        className="px-2 sm:px-4 pt-2 flex gap-1 overflow-x-auto"
        role="tablist"
        aria-label="Secções do painel"
      >
        {adminTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              title={tab.label}
              onClick={() => onSelectTab(tab.id)}
              className={`shrink-0 inline-flex items-center justify-center rounded-t-xl min-w-11 h-11 px-3 transition-colors border-b-2 -mb-px ${
                isActive
                  ? "text-rose-600 border-rose-500 bg-rose-50/80"
                  : "text-slate-600 border-transparent hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              {tab.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}
