import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Service from '@/models/Service';
import { ensureDefaultServices } from '@/lib/seed-services';

export async function GET() {
  try {
    await dbConnect();
    await ensureDefaultServices();
    const services = await Service.find({ active: true }).sort({ sortOrder: 1, name: 1 }).lean();
    return NextResponse.json(services);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao carregar serviços' }, { status: 500 });
  }
}
