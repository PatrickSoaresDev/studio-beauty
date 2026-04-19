import { describe, expect, it } from "vitest";
import {
  BR_MOBILE_MAX_DIGITS,
  formatBrazilMobileDisplay,
  parseBrazilMobileDigits,
  stripBrazilCountryCode,
} from "./br-phone";

describe("stripBrazilCountryCode", () => {
  it("mantém 10 ou 11 dígitos nacionais", () => {
    expect(stripBrazilCountryCode("11987654321")).toBe("11987654321");
    expect(stripBrazilCountryCode("1133334444")).toBe("1133334444");
  });

  it("remove 55 e limita a 11 dígitos quando há 13 caracteres", () => {
    expect(stripBrazilCountryCode("5511987654321")).toBe("11987654321");
  });

  it("remove 55 quando há 12 dígitos", () => {
    expect(stripBrazilCountryCode("551133334444")).toBe("1133334444");
  });

  it("ignora caracteres não numéricos antes de processar", () => {
    expect(stripBrazilCountryCode("+55 (11) 98765-4321")).toBe("11987654321");
  });

  it("trunca a mais de 11 dígitos sem 55", () => {
    expect(stripBrazilCountryCode("11987654321099").length).toBeLessThanOrEqual(
      BR_MOBILE_MAX_DIGITS,
    );
  });
});

describe("parseBrazilMobileDigits", () => {
  it("equivale a strip após remover não-dígitos", () => {
    expect(parseBrazilMobileDigits("(11) 9 8765-4321")).toBe("11987654321");
  });
});

describe("formatBrazilMobileDisplay", () => {
  it("formata 11 dígitos", () => {
    expect(formatBrazilMobileDisplay("11987654321")).toBe("(11) 98765-4321");
  });

  it("formata 10 dígitos", () => {
    expect(formatBrazilMobileDisplay("1133334444")).toBe("(11) 3333-4444");
  });

  it("mostra parcial durante digitação", () => {
    expect(formatBrazilMobileDisplay("11")).toBe("(11");
    expect(formatBrazilMobileDisplay("119")).toBe("(11) 9");
  });

  it("retorna vazio para entrada vazia", () => {
    expect(formatBrazilMobileDisplay("")).toBe("");
  });
});
