export const BR_MOBILE_MAX_DIGITS = 11;

export function parseBrazilMobileDigits(raw: string): string {
  const d = raw.replace(/\D/g, "");
  return stripBrazilCountryCode(d);
}

export function formatBrazilMobileDisplay(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, BR_MOBILE_MAX_DIGITS);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  const dd = d.slice(0, 2);
  const rest = d.slice(2);
  if (rest.length === 0) return `(${dd}) `;
  if (d.length <= 6) return `(${dd}) ${rest}`;
  if (d.length <= 10) {
    return `(${dd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }
  return `(${dd}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`;
}

export function stripBrazilCountryCode(digits: string): string {
  let d = digits.replace(/\D/g, "");
  if (d.length === 13 && d.startsWith("55")) {
    return d.slice(2, 2 + BR_MOBILE_MAX_DIGITS);
  }
  if (d.length === 12 && d.startsWith("55")) {
    return d.slice(2, 2 + BR_MOBILE_MAX_DIGITS);
  }
  return d.slice(0, BR_MOBILE_MAX_DIGITS);
}
