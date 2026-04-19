import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import { requireAdmin } from '@/lib/admin-api';
import { APPOINTMENT_STATUS, type AppointmentStatus } from '@/lib/appointment-status';

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
    const nextStatus = body.status as AppointmentStatus;

    if (!nextStatus || !APPOINTMENT_STATUS.includes(nextStatus)) {
      return NextResponse.json(
        { error: 'status deve ser: pending, confirmed ou rejected' },
        { status: 400 }
      );
    }

    await dbConnect();

    const updated = await Appointment.findByIdAndUpdate(
      id,
      { $set: { status: nextStatus } },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao atualizar agendamento' }, { status: 500 });
  }
}
