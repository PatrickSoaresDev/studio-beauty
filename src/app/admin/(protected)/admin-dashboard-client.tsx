"use client";

import {
  useCallback,
  useEffect,
  useState,
  startTransition,
} from "react";
import AdminUsersSection from "./admin-users-section";
import { AdminAppointmentsPanel } from "./admin-appointments-panel";
import { AdminBloqueiosPanel } from "./admin-bloqueios-panel";
import {
  addDaysKey,
  type AppointmentRow,
  type ScheduleRuleRow,
  type TabId,
  todayKey,
} from "./admin-dashboard-types";
import { AdminDashboardChrome } from "./admin-dashboard-chrome";
import ServicesAdminSection from "./services-admin-section";
import WorkScheduleSection from "./work-schedule-section";

export default function AdminDashboardClient() {
  const [activeTab, setActiveTab] = useState<TabId>("agendamentos");
  const [tabsEverOpened, setTabsEverOpened] = useState<Set<TabId>>(
    () => new Set<TabId>(["agendamentos"]),
  );

  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [rules, setRules] = useState<ScheduleRuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ruleFrom, setRuleFrom] = useState(todayKey());
  const [ruleTo, setRuleTo] = useState(addDaysKey(60));

  const [closedDate, setClosedDate] = useState("");
  const [closedNote, setClosedNote] = useState("");
  const [blockDate, setBlockDate] = useState("");
  const [blockHour, setBlockHour] = useState<number>(9);
  const [blockNote, setBlockNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [apRes, rulesRes] = await Promise.all([
        fetch("/api/admin/appointments?upcoming=1", { credentials: "include" }),
        fetch(`/api/admin/schedule-rules?from=${ruleFrom}&to=${ruleTo}`, {
          credentials: "include",
        }),
      ]);
      if (!apRes.ok) throw new Error("Falha ao carregar agendamentos");
      if (!rulesRes.ok) throw new Error("Falha ao carregar regras de agenda");
      const apData = await apRes.json();
      const rulesData = await rulesRes.json();
      setAppointments(apData);
      setRules(rulesData);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [ruleFrom, ruleTo]);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await fetch("/api/admin/auth", {
      method: "DELETE",
      credentials: "include",
    });
    window.location.href = "/admin/login";
  }

  async function addClosedDay(e: React.FormEvent) {
    e.preventDefault();
    if (!closedDate) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/schedule-rules", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "closed_day",
          dateKey: closedDate,
          note: closedNote || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
      setClosedDate("");
      setClosedNote("");
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  }

  async function addBlockedHour(e: React.FormEvent) {
    e.preventDefault();
    if (!blockDate) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/schedule-rules", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "blocked_hour",
          dateKey: blockDate,
          hour: blockHour,
          note: blockNote || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
      setBlockNote("");
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  }

  async function setAppointmentStatus(
    id: string,
    status: "confirmed" | "rejected",
  ) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar");
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  }

  const selectTab = useCallback((id: TabId) => {
    startTransition(() => {
      setActiveTab(id);
      setTabsEverOpened((prev) => new Set([...prev, id]));
    });
  }, []);

  async function removeRule(id: string) {
    if (!confirm("Remover esta regra?")) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/schedule-rules/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao remover");
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminDashboardChrome
        activeTab={activeTab}
        onSelectTab={selectTab}
        onLogout={logout}
      />

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}

      {tabsEverOpened.has("agendamentos") && (
        <div
          hidden={activeTab !== "agendamentos"}
          role="tabpanel"
          aria-labelledby="tab-agendamentos"
        >
          <AdminAppointmentsPanel
            appointments={appointments}
            loading={loading}
            saving={saving}
            onRefresh={load}
            onSetAppointmentStatus={setAppointmentStatus}
          />
        </div>
      )}

      {tabsEverOpened.has("expediente") && (
        <div
          hidden={activeTab !== "expediente"}
          role="tabpanel"
          aria-labelledby="tab-expediente"
        >
          <WorkScheduleSection />
        </div>
      )}

      {tabsEverOpened.has("servicos") && (
        <div
          hidden={activeTab !== "servicos"}
          role="tabpanel"
          aria-labelledby="tab-servicos"
        >
          <ServicesAdminSection />
        </div>
      )}

      {tabsEverOpened.has("bloqueios") && (
        <div
          hidden={activeTab !== "bloqueios"}
          role="tabpanel"
          aria-labelledby="tab-bloqueios"
        >
          <AdminBloqueiosPanel
            closedDate={closedDate}
            onClosedDateChange={setClosedDate}
            closedNote={closedNote}
            onClosedNoteChange={setClosedNote}
            onAddClosedDay={addClosedDay}
            blockDate={blockDate}
            onBlockDateChange={setBlockDate}
            blockHour={blockHour}
            onBlockHourChange={setBlockHour}
            blockNote={blockNote}
            onBlockNoteChange={setBlockNote}
            onAddBlockedHour={addBlockedHour}
            ruleFrom={ruleFrom}
            onRuleFromChange={setRuleFrom}
            ruleTo={ruleTo}
            onRuleToChange={setRuleTo}
            rules={rules}
            loading={loading}
            saving={saving}
            onRefreshRules={load}
            onRemoveRule={removeRule}
          />
        </div>
      )}

      {tabsEverOpened.has("equipa") && (
        <div
          hidden={activeTab !== "equipa"}
          role="tabpanel"
          aria-labelledby="tab-equipa"
        >
          <AdminUsersSection />
        </div>
      )}
    </div>
  );
}
