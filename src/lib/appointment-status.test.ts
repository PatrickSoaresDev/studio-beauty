import { describe, expect, it } from "vitest";
import { statusBlocksSlot, statusLabel } from "./appointment-status";

describe("statusBlocksSlot", () => {
  it("rejeitado não bloqueia", () => {
    expect(statusBlocksSlot("rejected")).toBe(false);
  });

  it("pendente e confirmado bloqueiam", () => {
    expect(statusBlocksSlot("pending")).toBe(true);
    expect(statusBlocksSlot("confirmed")).toBe(true);
  });

  it("legado vazio ou null bloqueia", () => {
    expect(statusBlocksSlot(undefined)).toBe(true);
    expect(statusBlocksSlot("")).toBe(true);
  });
});

describe("statusLabel", () => {
  it("mapeia estados conhecidos", () => {
    expect(statusLabel("pending")).toBe("Pendente");
    expect(statusLabel("confirmed")).toBe("Confirmado");
    expect(statusLabel("rejected")).toBe("Rejeitado");
  });

  it("desconhecido cai em Pendente", () => {
    expect(statusLabel("other")).toBe("Pendente");
  });
});
