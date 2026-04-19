import { getAvailableSlotsForDate } from "@/lib/get-available-slots";
import { NextResponse } from "next/server";

const MAX_DATES = 35;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dates = body.dates as unknown;
    const durationMinutes = Number(body.durationMinutes);

    if (
      !Array.isArray(dates) ||
      dates.length === 0 ||
      dates.length > MAX_DATES
    ) {
      return NextResponse.json(
        {
          error: `dates deve ser um array com 1 a ${MAX_DATES} datas (YYYY-MM-DD).`,
        },
        { status: 400 },
      );
    }

    if (
      !Number.isFinite(durationMinutes) ||
      durationMinutes < 15 ||
      durationMinutes > 480
    ) {
      return NextResponse.json(
        { error: "durationMinutes deve estar entre 15 e 480." },
        { status: 400 },
      );
    }

    const dateKeyRe = /^\d{4}-\d{2}-\d{2}$/;
    for (const d of dates) {
      if (typeof d !== "string" || !dateKeyRe.test(d)) {
        return NextResponse.json(
          { error: "Cada data deve estar no formato YYYY-MM-DD." },
          { status: 400 },
        );
      }
    }

    const entries = await Promise.all(
      (dates as string[]).map(async (dateKey) => {
        const slots = await getAvailableSlotsForDate(dateKey, durationMinutes);
        return [dateKey, slots] as const;
      }),
    );

    const byDate = Object.fromEntries(entries) as Record<string, string[]>;

    return NextResponse.json({ byDate });
  } catch (error) {
    console.error("Erro ao calcular disponibilidade em lote:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
