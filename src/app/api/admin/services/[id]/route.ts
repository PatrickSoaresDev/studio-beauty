import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Service from '@/models/Service';
import { requireAdmin } from '@/lib/admin-api';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const body = await request.json();
    await dbConnect();

    const updates: Record<string, unknown> = {};
    if (typeof body.name === 'string') {
      const n = body.name.trim();
      if (!n) return NextResponse.json({ error: 'Nome inválido' }, { status: 400 });
      updates.name = n;
    }
    if (body.durationMinutes != null) {
      const d = Number(body.durationMinutes);
      if (!Number.isFinite(d) || d < 15 || d > 480) {
        return NextResponse.json({ error: 'Duração deve ser entre 15 e 480 minutos.' }, { status: 400 });
      }
      updates.durationMinutes = Math.round(d);
    }
    if (typeof body.sortOrder === 'number') updates.sortOrder = body.sortOrder;
    if (typeof body.active === 'boolean') updates.active = body.active;

    const doc = await Service.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
    if (!doc) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
    }
    return NextResponse.json(doc);
  } catch (e: unknown) {
    const code = e && typeof e === 'object' && 'code' in e ? (e as { code?: number }).code : undefined;
    if (code === 11000) {
      return NextResponse.json({ error: 'Já existe um serviço com este nome.' }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    await dbConnect();
    const deleted = await Service.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao remover' }, { status: 500 });
  }
}
