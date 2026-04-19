import { describe, expect, it } from "vitest";
import {
  isValidAdminEmail,
  normalizeAdminEmail,
  validateNewPassword,
} from "./admin-user-validation";

describe("normalizeAdminEmail", () => {
  it("trim e minúsculas", () => {
    expect(normalizeAdminEmail("  User@MAIL.com  ")).toBe("user@mail.com");
  });
});

describe("isValidAdminEmail", () => {
  it("aceita email simples", () => {
    expect(isValidAdminEmail("a@b.co")).toBe(true);
  });

  it("rejeita demasiado longo", () => {
    expect(isValidAdminEmail(`${"a".repeat(250)}@x.com`)).toBe(false);
  });
});

describe("validateNewPassword", () => {
  it("mínimo 8 caracteres", () => {
    expect(validateNewPassword("1234567").ok).toBe(false);
    expect(validateNewPassword("12345678").ok).toBe(true);
  });

  it("máximo 200", () => {
    expect(validateNewPassword("a".repeat(201)).ok).toBe(false);
  });
});
