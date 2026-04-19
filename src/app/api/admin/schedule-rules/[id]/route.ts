import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import ScheduleRule from '@/models/ScheduleRule';
import { requireAdmin } from '@/lib/admin-api';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    await dbConnect();
    const deleted = await ScheduleRule.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Regra não encontrada' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao remover' }, { status: 500 });
  }
}
