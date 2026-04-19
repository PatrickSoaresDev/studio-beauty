import Appointment from '@/models/Appointment';
import dbConnect from '@/lib/mongodb';
import { getScheduleConstraintsForDateKey } from '@/lib/schedule-constraints';
import { computeAvailableStartTimes } from '@/lib/availability-engine';
import { getWorkSegmentsForDateKey } from '@/lib/work-schedule';
import type { ClientSession } from 'mongoose';

export type GetSlotsOptions = {
  session?: ClientSession | null;
};

export async function getAvailableSlotsForDate(
  dateKey: string,
  durationMinutes: number,
  options?: GetSlotsOptions,
): Promise<string[]> {
  await dbConnect();

  const parts = dateKey.split('-').map(Number);
  const [y, mo, d] = parts;
  if (parts.length !== 3 || !y || !mo || !d) {
    return [];
  }

  const workSegments = await getWorkSegmentsForDateKey(dateKey);
  const constraints = await getScheduleConstraintsForDateKey(dateKey);

  const startOfDay = new Date(y, mo - 1, d, 0, 0, 0, 0);
  const endOfDay = new Date(y, mo - 1, d, 23, 59, 59, 999);

  let q = Appointment.find({
    date: { $gte: startOfDay, $lte: endOfDay },
    status: { $ne: 'rejected' },
  });
  if (options?.session) {
    q = q.session(options.session);
  }
  const appointments = await q.lean();

  return computeAvailableStartTimes({
    durationMinutes,
    appointments: appointments.map((a) => ({
      date: new Date(a.date),
      durationMinutes: a.durationMinutes,
    })),
    constraints,
    workSegments,
  });
}
