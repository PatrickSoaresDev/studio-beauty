import { NextResponse } from 'next/server';
import { getAvailableSlotsForDate } from '@/lib/get-available-slots';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateString = searchParams.get('date');
  const durationParam = searchParams.get('durationMinutes');

  if (!dateString) {
    return NextResponse.json({ error: 'A data é obrigatória (formato YYYY-MM-DD)' }, { status: 400 });
  }

  const durationMinutes = durationParam != null ? parseInt(durationParam, 10) : NaN;
  if (!Number.isFinite(durationMinutes) || durationMinutes < 15 || durationMinutes > 480) {
    return NextResponse.json(
      { error: 'durationMinutes é obrigatório e deve estar entre 15 e 480 (minutos).' },
      { status: 400 }
    );
  }

  try {
    const parts = dateString.split('-').map(Number);
    const [y, mo, d] = parts;
    if (parts.length !== 3 || !y || !mo || !d) {
      return NextResponse.json({ error: 'Data inválida (use YYYY-MM-DD)' }, { status: 400 });
    }
    const dateKey = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const availableSlots = await getAvailableSlotsForDate(dateKey, durationMinutes);

    return NextResponse.json({ availableSlots });
  } catch (error) {
    console.error('Erro ao buscar disponibilidade:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
