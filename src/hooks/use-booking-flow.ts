"use client";

import { BOOKING_DAYS_AHEAD } from "@/components/booking-calendar";
import { groupSlotsByPeriod } from "@/lib/booking-slots";
import { addDays, format, startOfToday } from "date-fns";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
} from "react";

export type ServiceOption = {
  _id: string;
  name: string;
  durationMinutes: number;
};

export type BookingStatus = "idle" | "loading" | "success" | "error";

export function useBookingFlow() {
  const [today] = useState(() => startOfToday());
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [dateHasSlots, setDateHasSlots] = useState<Record<
    string,
    boolean
  > | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const scrollToRestoreAfterDatePick = useRef<number | null>(null);

  const onSelectDateFromCalendar = useCallback((d: Date) => {
    if (typeof window !== "undefined") {
      scrollToRestoreAfterDatePick.current = window.scrollY;
    }
    startTransition(() => {
      setSelectedDate(d);
    });
  }, []);

  useLayoutEffect(() => {
    const y = scrollToRestoreAfterDatePick.current;
    if (y == null) return;
    scrollToRestoreAfterDatePick.current = null;
    const apply = () => window.scrollTo(0, y);
    apply();
    requestAnimationFrame(() => {
      apply();
      requestAnimationFrame(apply);
    });
  }, [selectedDate]);

  const selectedService = services.find((s) => s._id === selectedServiceId);
  const serviceChosen = Boolean(selectedServiceId && selectedService);
  const { morning: morningSlots, afternoon: afternoonSlots } = useMemo(
    () => groupSlotsByPeriod(availableTimes),
    [availableTimes],
  );

  const noSlotsForSelectedDate = useMemo(() => {
    if (!serviceChosen) return false;
    const key = format(selectedDate, "yyyy-MM-dd");
    const mapped = dateHasSlots?.[key];
    if (mapped === false) return true;
    if (mapped === true) return false;
    return !loadingTimes && availableTimes.length === 0;
  }, [
    serviceChosen,
    selectedDate,
    dateHasSlots,
    loadingTimes,
    availableTimes,
  ]);

  const selectService = useCallback((id: string) => {
    setSelectedServiceId(id);
    setSelectedTime(null);
    setDateHasSlots(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!selectedServiceId || !selectedService) {
      return;
    }
    const day0 = startOfToday();
    const dates = Array.from({ length: BOOKING_DAYS_AHEAD }, (_, i) =>
      format(addDays(day0, i), "yyyy-MM-dd"),
    );
    (async () => {
      try {
        const res = await fetch("/api/availability/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dates,
            durationMinutes: selectedService.durationMinutes,
          }),
        });
        const data = await res.json();
        if (cancelled) return;
        const map: Record<string, boolean> = {};
        if (data.byDate && typeof data.byDate === "object") {
          for (const [k, v] of Object.entries(data.byDate)) {
            map[k] = Array.isArray(v) && v.length > 0;
          }
        }
        setDateHasSlots(map);
      } catch (e) {
        console.error(e);
        if (!cancelled) setDateHasSlots(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedServiceId, selectedService]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingServices(true);
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          setServices(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoadingServices(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const ac = new AbortController();

    const fetchTimes = async () => {
      setSelectedTime(null);

      if (!selectedServiceId || !selectedService) {
        setAvailableTimes([]);
        setLoadingTimes(false);
        return;
      }

      const dateString = format(selectedDate, "yyyy-MM-dd");
      if (dateHasSlots != null && dateHasSlots[dateString] === false) {
        setAvailableTimes([]);
        setLoadingTimes(false);
        return;
      }

      setLoadingTimes(true);
      setAvailableTimes([]);

      try {
        const q = new URLSearchParams({
          date: dateString,
          durationMinutes: String(selectedService.durationMinutes),
        });
        const res = await fetch(`/api/availability?${q.toString()}`, {
          signal: ac.signal,
        });
        const data = await res.json();

        if (ac.signal.aborted) return;

        if (data.availableSlots && Array.isArray(data.availableSlots)) {
          setAvailableTimes(data.availableSlots);
        } else {
          setAvailableTimes([]);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("Error fetching times", error);
        setAvailableTimes([]);
      } finally {
        if (!ac.signal.aborted) setLoadingTimes(false);
      }
    };

    void fetchTimes();
    return () => ac.abort();
  }, [selectedDate, selectedServiceId, selectedService, dateHasSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || !selectedService) {
      setErrorMessage("Escolha primeiro o tipo de serviço.");
      return;
    }
    if (!selectedTime) {
      setErrorMessage("Escolha um horário disponível.");
      return;
    }

    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      setErrorMessage(
        "Indique um celular com DDD: 10 ou 11 dígitos (ex.: (11) 98765-4321).",
      );
      return;
    }

    setBookingStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientName: formData.name,
          clientPhone: formData.phone,
          serviceId: selectedServiceId,
          date: format(selectedDate, "yyyy-MM-dd"),
          time: selectedTime,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao agendar.");
      }

      setBookingStatus("success");
    } catch (err: unknown) {
      setBookingStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Erro ao agendar.");
    }
  };

  const resetAfterSuccess = useCallback(() => {
    setBookingStatus("idle");
    setSelectedTime(null);
    setSelectedServiceId("");
    setFormData({ name: "", phone: "" });
    setSelectedDate(new Date(today));
  }, [today]);

  const submitBlockedReason = !serviceChosen
    ? "Selecione o serviço"
    : !selectedTime
      ? "Selecione data e horário"
      : null;

  return {
    today,
    services,
    loadingServices,
    selectedServiceId,
    selectService,
    selectedDate,
    selectedTime,
    setSelectedTime,
    availableTimes,
    loadingTimes,
    bookingStatus,
    errorMessage,
    dateHasSlots,
    formData,
    setFormData,
    onSelectDateFromCalendar,
    selectedService,
    serviceChosen,
    morningSlots,
    afternoonSlots,
    noSlotsForSelectedDate,
    handleSubmit,
    resetAfterSuccess,
    submitBlockedReason,
  };
}
