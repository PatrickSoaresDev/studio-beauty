import type { WorkDaySchedule } from '@/models/WorkSchedule';
import WorkSchedule from '@/models/WorkSchedule';
import dbConnect from '@/lib/mongodb';

export type { WorkDaySchedule } from '@/models/WorkSchedule';

export type WorkSegment = { start: number; end: number };

export function defaultWorkDays(): WorkDaySchedule[] {
  const closed: WorkDaySchedule = {
    enabled: false,
    startMin: 9 * 60,
    endMin: 18 * 60,
    lunchStartMin: null,
    lunchEndMin: null,
  };
  const weekday: WorkDaySchedule = {
    enabled: true,
    startMin: 9 * 60,
    endMin: 18 * 60,
    lunchStartMin: 13 * 60,
    lunchEndMin: 14 * 60,
  };
  return [
    { ...closed },
    { ...weekday },
    { ...weekday },
    { ...weekday },
    { ...weekday },
    { ...weekday },
    { ...closed },
  ];
}

export function segmentsForDay(day: WorkDaySchedule): WorkSegment[] {
  if (!day.enabled) return [];
  const { startMin, endMin, lunchStartMin, lunchEndMin } = day;
  if (!Number.isFinite(startMin) || !Number.isFinite(endMin) || endMin <= startMin) {
    return [];
  }
  const hasLunch =
    lunchStartMin != null &&
    lunchEndMin != null &&
    Number.isFinite(lunchStartMin) &&
    Number.isFinite(lunchEndMin) &&
    lunchStartMin < lunchEndMin &&
    lunchStartMin > startMin &&
    lunchEndMin < endMin;

  if (!hasLunch) {
    return [{ start: startMin, end: endMin }];
  }
  return [
    { start: startMin, end: lunchStartMin! },
    { start: lunchEndMin!, end: endMin },
  ];
}

export function isValidWorkDaySchedule(d: WorkDaySchedule): string | null {
  if (!d.enabled) return null;
  if (d.endMin <= d.startMin) return 'Hora de fecho deve ser depois da abertura.';
  if (d.startMin < 0 || d.endMin > 24 * 60) return 'Horário inválido (use 00:00–24:00).';
  const ls = d.lunchStartMin;
  const le = d.lunchEndMin;
  if (ls != null || le != null) {
    if (ls == null || le == null) return 'Defina início e fim do almoço, ou deixe ambos vazios.';
    if (ls >= le) return 'O almoço deve ter duração positiva.';
    if (ls <= d.startMin || le >= d.endMin) return 'O almoço tem de ficar entre abertura e fecho.';
  }
  return null;
}

export function validateWorkDaysPayload(days: unknown): string | null {
  if (!Array.isArray(days) || days.length !== 7) {
    return 'Envie um array com 7 dias (domingo a sábado).';
  }
  for (let i = 0; i < 7; i++) {
    const d = days[i] as WorkDaySchedule;
    if (!d || typeof d !== 'object') return `Dia ${i} inválido.`;
    if (typeof d.enabled !== 'boolean') return `Dia ${i}: campo enabled em falta.`;
    if (d.enabled) {
      const err = isValidWorkDaySchedule(d as WorkDaySchedule);
      if (err) return err;
    }
  }
  return null;
}

export async function ensureWorkSchedule(): Promise<{ days: WorkDaySchedule[] }> {
  await dbConnect();
  let doc = await WorkSchedule.findOne({ singletonKey: 'default' }).lean();
  if (!doc) {
    await WorkSchedule.create({ singletonKey: 'default', days: defaultWorkDays() });
    doc = await WorkSchedule.findOne({ singletonKey: 'default' }).lean();
  }
  if (!doc) throw new Error('WorkSchedule não disponível');
  return { days: doc.days as WorkDaySchedule[] };
}

export async function getWorkSegmentsForWeekday(weekday: number): Promise<WorkSegment[]> {
  const { days } = await ensureWorkSchedule();
  if (weekday < 0 || weekday > 6) return [];
  return segmentsForDay(days[weekday]);
}

export async function getWorkSegmentsForDateKey(dateKey: string): Promise<WorkSegment[]> {
  const parts = dateKey.split('-').map(Number);
  const [y, mo, d] = parts;
  if (parts.length !== 3 || !y || !mo || !d) return [];
  const weekday = new Date(y, mo - 1, d).getDay();
  return getWorkSegmentsForWeekday(weekday);
}
