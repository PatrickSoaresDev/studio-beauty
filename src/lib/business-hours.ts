export const DAY_START_MIN = 9 * 60;
export const DAY_END_MIN = 18 * 60;

export const SLOT_STEP_MIN = 15;

export const BUSINESS_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17] as const;

export const ADMIN_BLOCKABLE_HOURS = Array.from({ length: 24 }, (_, i) => i);

export type BusinessHour = (typeof BUSINESS_HOURS)[number];

export function isBusinessHour(h: number): h is BusinessHour {
  return (BUSINESS_HOURS as readonly number[]).includes(h);
}

export function minutesSinceMidnightLocal(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

export function formatMinutesAsTime(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function parseTimeToMinutes(time: string): number | null {
  const parts = time.trim().split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const min = parseInt(parts[1], 10);
  if (Number.isNaN(h) || Number.isNaN(min) || min < 0 || min > 59) return null;
  return h * 60 + min;
}

export function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean {
  return aStart < bEnd && bStart < aEnd;
}
