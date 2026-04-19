import { describe, expect, it } from "vitest";
import { toDateKey, toDateKeyFromParts } from "./date-key";

describe("toDateKey", () => {
  it("monta YYYY-MM-DD", () => {
    expect(toDateKey(2026, 3, 8)).toBe("2026-04-08");
  });
});

describe("toDateKeyFromParts", () => {
  it("pad a mês e dia", () => {
    expect(toDateKeyFromParts("2026", "4", "8")).toBe("2026-04-08");
  });
});
