import type { ScheduleRuleType } from '@/models/ScheduleRule';
import ScheduleRule from '@/models/ScheduleRule';
import { BUSINESS_HOURS } from '@/lib/business-hours';

export type ScheduleConstraints = {
  dayClosed: boolean;
  blockedHours: number[];
};

export async function getScheduleConstraintsForDateKey(dateKey: string): Promise<ScheduleConstraints> {
  const rules = await ScheduleRule.find({ dateKey });
  let dayClosed = false;
  const blockedHours: number[] = [];
  for (const r of rules) {
    const t = r.type as ScheduleRuleType;
    if (t === 'closed_day') dayClosed = true;
    if (t === 'blocked_hour' && typeof r.hour === 'number') blockedHours.push(r.hour);
  }
  return { dayClosed, blockedHours };
}

export function unavailableHoursFromConstraints(c: ScheduleConstraints): Set<number> {
  if (c.dayClosed) return new Set(BUSINESS_HOURS);
  return new Set(c.blockedHours);
}
