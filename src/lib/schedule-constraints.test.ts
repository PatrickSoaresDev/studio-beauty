import { describe, expect, it } from "vitest";
import { BUSINESS_HOURS } from "./business-hours";
import { unavailableHoursFromConstraints } from "./schedule-constraints";

describe("unavailableHoursFromConstraints", () => {
  it("dia fechado marca todas as horas de negócio", () => {
    const s = unavailableHoursFromConstraints({
      dayClosed: true,
      blockedHours: [],
    });
    expect(s.size).toBe(BUSINESS_HOURS.length);
  });

  it("dia aberto só horas bloqueadas", () => {
    const s = unavailableHoursFromConstraints({
      dayClosed: false,
      blockedHours: [10, 14],
    });
    expect(s.has(10)).toBe(true);
    expect(s.has(14)).toBe(true);
    expect(s.has(9)).toBe(false);
  });
});
