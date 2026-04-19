import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ScheduleRule from '@/models/ScheduleRule';
import { requireAdmin } from '@/lib/admin-api';

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  if (!from || !to || !/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return NextResponse.json({ error: 'Use from e to no formato YYYY-MM-DD' }, { status: 400 });
  }
  if (from > to) {
    return NextResponse.json({ error: 'from deve ser <= to' }, { status: 400 });
  }

  try {
    await dbConnect();
    const rules = await ScheduleRule.find({
      dateKey: { $gte: from, $lte: to },
    }).sort({ dateKey: 1, hour: 1 });
    return NextResponse.json(rules);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao listar regras' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const type = body.type as string;
    const dateKey = body.dateKey as string;
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 300) : undefined;

    if (!dateKey || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      return NextResponse.json({ error: 'dateKey inválido (YYYY-MM-DD)' }, { status: 400 });
    }

    await dbConnect();

    if (type === 'closed_day') {
      const doc = await ScheduleRule.create({
        type: 'closed_day',
        dateKey,
        note,
      });
      return NextResponse.json(doc, { status: 201 });
    }

    if (type === 'blocked_hour') {
      const hour = Number(body.hour);
      if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
        return NextResponse.json({ error: 'hour deve ser entre 0 e 23 (hora cheia).' }, { status: 400 });
      }
      const doc = await ScheduleRule.create({
        type: 'blocked_hour',
        dateKey,
        hour,
        note,
      });
      return NextResponse.json(doc, { status: 201 });
    }

    return NextResponse.json({ error: 'type deve ser closed_day ou blocked_hour' }, { status: 400 });
  } catch (e: unknown) {
    const code = e && typeof e === 'object' && 'code' in e ? (e as { code?: number }).code : undefined;
    if (code === 11000) {
      return NextResponse.json({ error: 'Já existe uma regra igual para esta data/hora.' }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Erro ao criar regra' }, { status: 500 });
  }
}
