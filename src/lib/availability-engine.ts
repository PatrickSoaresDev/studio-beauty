import type { ScheduleConstraints } from '@/lib/schedule-constraints';
import type { WorkSegment } from '@/lib/work-schedule';
import { SLOT_STEP_MIN, formatMinutesAsTime, intervalsOverlap, minutesSinceMidnightLocal } from '@/lib/business-hours';

type BusyInterval = { start: number; end: number };

function blockedIntervalsFromConstraints(c: ScheduleConstraints): BusyInterval[] {
  return c.blockedHours.map((h) => ({
    start: h * 60,
    end: h * 60 + 60,
  }));
}

function overlapsAny(candidateStart: number, candidateEnd: number, list: BusyInterval[]): boolean {
  for (const x of list) {
    if (intervalsOverlap(candidateStart, candidateEnd, x.start, x.end)) return true;
  }
  return false;
}

export function computeAvailableStartTimes(params: {
  durationMinutes: number;
  appointments: { date: Date; durationMinutes?: number }[];
  constraints: ScheduleConstraints;
  workSegments: WorkSegment[];
}): string[] {
  const { durationMinutes, appointments, constraints, workSegments } = params;

  if (constraints.dayClosed) return [];

  if (workSegments.length === 0) return [];

  if (durationMinutes < SLOT_STEP_MIN) {
    return [];
  }

  const maxSpan = Math.max(...workSegments.map((s) => s.end - s.start));
  if (durationMinutes > maxSpan) {
    return [];
  }

  const blocked = blockedIntervalsFromConstraints(constraints);

  const busy: BusyInterval[] = appointments.map((a) => {
    const start = minutesSinceMidnightLocal(new Date(a.date));
    const dur =
      typeof a.durationMinutes === 'number' && a.durationMinutes >= 15 ? a.durationMinutes : 60;
    return { start, end: start + dur };
  });

  const allBlocked = [...blocked, ...busy];

  const slots: string[] = [];
  for (const seg of workSegments) {
    for (let t = seg.start; t + durationMinutes <= seg.end; t += SLOT_STEP_MIN) {
      const end = t + durationMinutes;
      if (!overlapsAny(t, end, allBlocked)) {
        slots.push(formatMinutesAsTime(t));
      }
    }
  }

  slots.sort();
  return slots;
}
