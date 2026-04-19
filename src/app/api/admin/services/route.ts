import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Service from '@/models/Service';
import { requireAdmin } from '@/lib/admin-api';
import { ensureDefaultServices } from '@/lib/seed-services';

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    await dbConnect();
    await ensureDefaultServices();
    const services = await Service.find().sort({ sortOrder: 1, name: 1 }).lean();
    return NextResponse.json(services);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao listar serviços' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const durationMinutes = Number(body.durationMinutes);
    const sortOrder = typeof body.sortOrder === 'number' ? body.sortOrder : 0;

    if (!name || name.length > 120) {
      return NextResponse.json({ error: 'Nome inválido.' }, { status: 400 });
    }
    if (!Number.isFinite(durationMinutes) || durationMinutes < 15 || durationMinutes > 480) {
      return NextResponse.json({ error: 'Duração deve ser entre 15 e 480 minutos.' }, { status: 400 });
    }

    await dbConnect();
    const doc = await Service.create({
      name,
      durationMinutes: Math.round(durationMinutes),
      sortOrder,
      active: body.active !== false,
    });
    return NextResponse.json(doc, { status: 201 });
  } catch (e: unknown) {
    const code = e && typeof e === 'object' && 'code' in e ? (e as { code?: number }).code : undefined;
    if (code === 11000) {
      return NextResponse.json({ error: 'Já existe um serviço com este nome.' }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Erro ao criar serviço' }, { status: 500 });
  }
}
