import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { requireAdmin } from '@/lib/admin-api';

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const upcomingOnly = searchParams.get('upcoming') !== '0';

  try {
    await dbConnect();
    const query = upcomingOnly
      ? { date: { $gte: new Date() }, status: { $ne: 'rejected' } }
      : {};
    const appointments = await Appointment.find(query)
      .populate('serviceId', 'name')
      .sort({ date: 1 })
      .limit(200)
      .lean();

    const shaped = appointments.map((a) => {
      const pop = a.serviceId as { name?: string } | null | undefined;
      const nameFromRelation = pop && typeof pop === 'object' && typeof pop.name === 'string' ? pop.name : null;
      return {
        ...a,
        serviceDisplayName: nameFromRelation ?? a.serviceType,
      };
    });

    return NextResponse.json(shaped);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao listar agendamentos' }, { status: 500 });
  }
}
