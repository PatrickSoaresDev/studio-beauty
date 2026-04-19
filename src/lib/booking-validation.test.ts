import { describe, expect, it } from "vitest";
import { parseAndValidateDateKey, sanitizeBookingFields } from "./booking-validation";

describe("sanitizeBookingFields", () => {
  it("aceita nome e telefone BR válidos e devolve telefone só com dígitos", () => {
    const r = sanitizeBookingFields("Maria Silva", "11987654321");
    expect(r).toEqual({
      ok: true,
      clientName: "Maria Silva",
      clientPhone: "11987654321",
    });
  });

  it("normaliza espaços no nome", () => {
    const r = sanitizeBookingFields("  João   Costa  ", "1133334444");
    expect(r.ok && r.clientName).toBe("João Costa");
  });

  it("rejeita nome curto", () => {
    const r = sanitizeBookingFields("A", "11987654321");
    expect(r.ok).toBe(false);
  });

  it("rejeita tipos inválidos", () => {
    expect(sanitizeBookingFields(1, "11987654321").ok).toBe(false);
    expect(sanitizeBookingFields("Nome", null).ok).toBe(false);
  });

  it("rejeita telefone com menos de 10 dígitos", () => {
    const r = sanitizeBookingFields("Nome Ok", "1198765");
    expect(r.ok).toBe(false);
  });

  it("aceita colagem com +55", () => {
    const r = sanitizeBookingFields("Nome Ok", "+55 11 98765-4321");
    expect(r).toEqual({
      ok: true,
      clientName: "Nome Ok",
      clientPhone: "11987654321",
    });
  });
});

describe("parseAndValidateDateKey", () => {
  it("aceita data válida", () => {
    const r = parseAndValidateDateKey("2026-04-18");
    expect(r).toEqual({
      ok: true,
      year: "2026",
      month: "04",
      day: "18",
      dateKey: "2026-04-18",
    });
  });

  it("rejeita 31 de fevereiro", () => {
    const r = parseAndValidateDateKey("2026-02-31");
    expect(r.ok).toBe(false);
  });

  it("rejeita formato errado", () => {
    expect(parseAndValidateDateKey("18-04-2026").ok).toBe(false);
    expect(parseAndValidateDateKey(null).ok).toBe(false);
  });
});
