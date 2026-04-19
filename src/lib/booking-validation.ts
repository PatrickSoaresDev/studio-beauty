import { stripBrazilCountryCode } from '@/lib/br-phone';

const MAX_NAME_LEN = 120;

export type BookingFieldsResult =
  | { ok: true; clientName: string; clientPhone: string }
  | { ok: false; error: string };

export function sanitizeBookingFields(
  clientName: unknown,
  clientPhone: unknown,
): BookingFieldsResult {
  if (typeof clientName !== 'string' || typeof clientPhone !== 'string') {
    return { ok: false, error: 'Dados inválidos.' };
  }

  const name = clientName.replace(/\s+/g, ' ').trim();
  if (name.length < 2) {
    return { ok: false, error: 'Indique um nome com pelo menos 2 caracteres.' };
  }
  if (name.length > MAX_NAME_LEN) {
    return { ok: false, error: `O nome deve ter no máximo ${MAX_NAME_LEN} caracteres.` };
  }

  const phoneRaw = typeof clientPhone === 'string' ? clientPhone.trim() : '';
  const digits = stripBrazilCountryCode(phoneRaw);
  if (digits.length < 10 || digits.length > 11) {
    return {
      ok: false,
      error: 'Indique um celular com DDD: 10 ou 11 dígitos (ex.: (11) 98765-4321).',
    };
  }

  return { ok: true, clientName: name, clientPhone: digits };
}

export type DateKeyResult =
  | { ok: true; year: string; month: string; day: string; dateKey: string }
  | { ok: false; error: string };

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseAndValidateDateKey(date: unknown): DateKeyResult {
  if (typeof date !== 'string') {
    return { ok: false, error: 'Data inválida.' };
  }
  const m = date.match(DATE_RE);
  if (!m) {
    return { ok: false, error: 'Use a data no formato YYYY-MM-DD.' };
  }
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return { ok: false, error: 'Data inválida.' };
  }
  const cal = new Date(year, month - 1, day);
  if (
    cal.getFullYear() !== year ||
    cal.getMonth() !== month - 1 ||
    cal.getDate() !== day
  ) {
    return { ok: false, error: 'Data inexistente no calendário.' };
  }
  return {
    ok: true,
    year: m[1],
    month: m[2],
    day: m[3],
    dateKey: `${m[1]}-${m[2]}-${m[3]}`,
  };
}
