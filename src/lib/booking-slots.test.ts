import { describe, expect, it } from "vitest";
import { groupSlotsByPeriod } from "./booking-slots";

describe("groupSlotsByPeriod", () => {
  it("separa manhã (<13h) e tarde (≥13h)", () => {
    const { morning, afternoon } = groupSlotsByPeriod([
      "14:00",
      "09:00",
      "13:00",
      "12:45",
    ]);
    expect(morning).toEqual(["09:00", "12:45"]);
    expect(afternoon).toEqual(["13:00", "14:00"]);
  });

  it("ignora horários com hora inválida", () => {
    const { morning, afternoon } = groupSlotsByPeriod(["xx:00", "10:00"]);
    expect(morning).toEqual(["10:00"]);
    expect(afternoon).toEqual([]);
  });

  it("lista vazia", () => {
    expect(groupSlotsByPeriod([])).toEqual({ morning: [], afternoon: [] });
  });
});
