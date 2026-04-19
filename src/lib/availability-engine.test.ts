import { describe, expect, it } from "vitest";
import { computeAvailableStartTimes } from "./availability-engine";

function atLocal(h: number, min: number) {
  return new Date(2026, 3, 15, h, min, 0, 0);
}

describe("computeAvailableStartTimes", () => {
  const openDay = { dayClosed: false, blockedHours: [] as number[] };
  const segmentFull = [{ start: 9 * 60, end: 18 * 60 }];

  it("dia fechado não devolve slots", () => {
    expect(
      computeAvailableStartTimes({
        durationMinutes: 60,
        appointments: [],
        constraints: { dayClosed: true, blockedHours: [] },
        workSegments: segmentFull,
      }),
    ).toEqual([]);
  });

  it("sem expediente não devolve slots", () => {
    expect(
      computeAvailableStartTimes({
        durationMinutes: 60,
        appointments: [],
        constraints: openDay,
        workSegments: [],
      }),
    ).toEqual([]);
  });

  it("duração inferior ao passo de 15 min não devolve slots", () => {
    expect(
      computeAvailableStartTimes({
        durationMinutes: 10,
        appointments: [],
        constraints: openDay,
        workSegments: segmentFull,
      }),
    ).toEqual([]);
  });

  it("duração maior que o segmento não devolve slots", () => {
    expect(
      computeAvailableStartTimes({
        durationMinutes: 600,
        appointments: [],
        constraints: openDay,
        workSegments: [{ start: 9 * 60, end: 10 * 60 }],
      }),
    ).toEqual([]);
  });

  it("dia livre 9–18 com serviço 60 min inclui 9:00 e último início 17:00", () => {
    const slots = computeAvailableStartTimes({
      durationMinutes: 60,
      appointments: [],
      constraints: openDay,
      workSegments: segmentFull,
    });
    expect(slots[0]).toBe("09:00");
    expect(slots[slots.length - 1]).toBe("17:00");
    expect(slots.length).toBeGreaterThan(10);
  });

  it("agendamento existente remove inícios sobrepostos", () => {
    const slots = computeAvailableStartTimes({
      durationMinutes: 60,
      appointments: [
        {
          date: atLocal(9, 0),
          durationMinutes: 60,
        },
      ],
      constraints: openDay,
      workSegments: segmentFull,
    });
    expect(slots.includes("09:00")).toBe(false);
    expect(slots.includes("09:15")).toBe(false);
    expect(slots.includes("10:00")).toBe(true);
  });

  it("hora bloqueada (constraint) remove slots que cruzam a hora", () => {
    const slots = computeAvailableStartTimes({
      durationMinutes: 60,
      appointments: [],
      constraints: { dayClosed: false, blockedHours: [10] },
      workSegments: segmentFull,
    });
    expect(slots.includes("09:00")).toBe(true);
    expect(slots.includes("09:45")).toBe(false);
    expect(slots.includes("10:00")).toBe(false);
  });
});
