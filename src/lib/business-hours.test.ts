import { describe, expect, it } from "vitest";
import {
  formatMinutesAsTime,
  intervalsOverlap,
  isBusinessHour,
  parseTimeToMinutes,
} from "./business-hours";

describe("parseTimeToMinutes", () => {
  it("parse HH:mm", () => {
    expect(parseTimeToMinutes("09:00")).toBe(9 * 60);
    expect(parseTimeToMinutes("9:30")).toBe(9 * 60 + 30);
  });

  it("rejeita formato inválido", () => {
    expect(parseTimeToMinutes("9")).toBeNull();
    expect(parseTimeToMinutes("09:70")).toBeNull();
  });
});

describe("formatMinutesAsTime", () => {
  it("formata com zero à esquerda", () => {
    expect(formatMinutesAsTime(9 * 60 + 5)).toBe("09:05");
    expect(formatMinutesAsTime(18 * 60)).toBe("18:00");
  });
});

describe("intervalsOverlap", () => {
  it("detecta sobreposição", () => {
    expect(intervalsOverlap(0, 60, 30, 90)).toBe(true);
    expect(intervalsOverlap(0, 30, 30, 60)).toBe(false);
  });
});

describe("isBusinessHour", () => {
  it("9–17 são horas de negócio", () => {
    expect(isBusinessHour(9)).toBe(true);
    expect(isBusinessHour(17)).toBe(true);
    expect(isBusinessHour(8)).toBe(false);
  });
});
