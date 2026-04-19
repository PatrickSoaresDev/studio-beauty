import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import Service from '@/models/Service';
import { parseTimeToMinutes, formatMinutesAsTime } from '@/lib/business-hours';
import { getAvailableSlotsForDate } from '@/lib/get-available-slots';
import { sanitizeBookingFields, parseAndValidateDateKey } from '@/lib/booking-validation';
import { runBookingForDateKey } from '@/lib/booking-serializer';
import mongoose from 'mongoose';

function isSlotTakenError(e: unknown): boolean {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    (e as { code?: string }).code === 'SLOT_TAKEN'
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientName, clientPhone, serviceId, date, time } = body;

    const fields = sanitizeBookingFields(clientName, clientPhone);
    if (!fields.ok) {
      return NextResponse.json({ error: fields.error }, { status: 400 });
    }

    if (!serviceId || !date || !time) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 });
    }

    if (!mongoose.isValidObjectId(serviceId)) {
      return NextResponse.json({ error: 'Serviço inválido.' }, { status: 400 });
    }

    const parsedDate = parseAndValidateDateKey(date);
    if (!parsedDate.ok) {
      return NextResponse.json({ error: parsedDate.error }, { status: 400 });
    }

    await dbConnect();

    const service = await Service.findById(serviceId).lean();
    if (!service || !service.active) {
      return NextResponse.json({ error: 'Serviço não encontrado ou indisponível.' }, { status: 400 });
    }

    const durationMinutes = service.durationMinutes;

    const startMin = parseTimeToMinutes(typeof time === 'string' ? time : '');
    if (startMin === null) {
      return NextResponse.json({ error: 'Horário inválido.' }, { status: 400 });
    }

    const { year, month, day } = parsedDate;
    const appointmentDate = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      Math.floor(startMin / 60),
      startMin % 60,
      0,
      0,
    );

    const dateKey = parsedDate.dateKey;
    const timeStr = formatMinutesAsTime(startMin);

    let appointment;
    try {
      appointment = await runBookingForDateKey(dateKey, async () => {
        const slots = await getAvailableSlotsForDate(dateKey, durationMinutes);
        if (!slots.includes(timeStr)) {
          const err = new Error() as Error & { code: string };
          err.code = 'SLOT_TAKEN';
          throw err;
        }

        return Appointment.create({
          clientName: fields.clientName,
          clientPhone: fields.clientPhone,
          serviceType: service.name,
          serviceId: service._id,
          durationMinutes,
          status: 'pending',
          date: appointmentDate,
        });
      });
    } catch (e: unknown) {
      if (isSlotTakenError(e)) {
        return NextResponse.json(
          { error: 'Este horário já não está disponível. Atualize e escolha outro.' },
          { status: 409 },
        );
      }
      throw e;
    }

    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor ao criar agendamento.' }, { status: 500 });
  }
}
