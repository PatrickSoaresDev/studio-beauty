import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WorkSchedule from '@/models/WorkSchedule';
import { requireAdmin } from '@/lib/admin-api';
import { ensureWorkSchedule, validateWorkDaysPayload } from '@/lib/work-schedule';
import type { WorkDaySchedule } from '@/models/WorkSchedule';

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const { days } = await ensureWorkSchedule();
    return NextResponse.json({ days });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao carregar expediente' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const days = body.days as WorkDaySchedule[] | undefined;
    const err = validateWorkDaysPayload(days);
    if (err) {
      return NextResponse.json({ error: err }, { status: 400 });
    }

    await dbConnect();
    await ensureWorkSchedule();

    const sanitized: WorkDaySchedule[] = (days as WorkDaySchedule[]).map((d) => {
      if (!d.enabled) {
        return {
          enabled: false,
          startMin: d.startMin,
          endMin: d.endMin,
          lunchStartMin: null,
          lunchEndMin: null,
        };
      }
      const hasLunch =
        d.lunchStartMin != null &&
        d.lunchEndMin != null &&
        typeof d.lunchStartMin === 'number' &&
        typeof d.lunchEndMin === 'number';
      return {
        enabled: true,
        startMin: d.startMin,
        endMin: d.endMin,
        lunchStartMin: hasLunch ? d.lunchStartMin : null,
        lunchEndMin: hasLunch ? d.lunchEndMin : null,
      };
    });

    const updated = await WorkSchedule.findOneAndUpdate(
      { singletonKey: 'default' },
      { $set: { days: sanitized } },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Documento de expediente não encontrado' }, { status: 500 });
    }

    return NextResponse.json({ days: updated.days });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao guardar expediente' }, { status: 500 });
  }
}
