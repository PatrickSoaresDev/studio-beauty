'use client';

import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { memo, useEffect, useState } from 'react';

export const BOOKING_DAYS_AHEAD = 30;

const WEEKDAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

type Props = {
  today: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  disabled?: boolean;
  dateHasSlots?: Record<string, boolean> | null;
};

function BookingCalendarInner({
  today,
  selectedDate,
  onSelectDate,
  disabled,
  dateHasSlots = null,
}: Props) {
  const lastBookable = startOfDay(addDays(today, BOOKING_DAYS_AHEAD - 1));

  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selectedDate));

  useEffect(() => {
    queueMicrotask(() => {
      setViewMonth(startOfMonth(selectedDate));
    });
  }, [selectedDate]);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const gridDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  function isSelectable(d: Date): boolean {
    if (disabled) return false;
    const x = startOfDay(d);
    return !isBefore(x, today) && !isAfter(x, lastBookable);
  }

  const canGoPrev = isAfter(startOfMonth(viewMonth), startOfMonth(today));
  const canGoNext = isBefore(endOfMonth(viewMonth), lastBookable);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={disabled || !canGoPrev}
          onClick={() => setViewMonth((m) => addMonths(m, -1))}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Mês anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="text-sm font-semibold text-slate-800 capitalize tabular-nums">
          {format(viewMonth, 'MMMM yyyy', { locale: ptBR })}
        </p>
        <button
          type="button"
          disabled={disabled || !canGoNext}
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Mês seguinte"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {gridDays.map((day) => {
          const inMonth = isSameMonth(day, viewMonth);
          const selectable = isSelectable(day);
          const selected = isSameDay(day, selectedDate);
          const dateKey = format(day, 'yyyy-MM-dd');
          const mapEmpty = dateHasSlots != null && dateHasSlots[dateKey] === false;
          const mapHasSlots = dateHasSlots != null && dateHasSlots[dateKey] === true;
          const grayNoSlots = selectable && mapEmpty;
          const showRose =
            selected &&
            selectable &&
            !grayNoSlots &&
            (dateHasSlots == null ? true : mapHasSlots);

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={!selectable}
              onClick={() => selectable && onSelectDate(startOfDay(day))}
              className={[
                'aspect-square max-h-11 rounded-xl text-sm font-semibold transition-all',
                !inMonth ? 'text-slate-300' : 'text-slate-800',
                !selectable
                  ? 'cursor-not-allowed opacity-40'
                  : grayNoSlots
                    ? 'cursor-pointer opacity-40 text-slate-500 hover:opacity-55 hover:text-slate-600'
                    : 'hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-200',
                showRose
                  ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200 hover:bg-rose-600 hover:text-white'
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-500">
        Podes marcar entre <strong className="font-medium text-slate-600">hoje</strong> e{' '}
        <strong className="font-medium text-slate-600">
          {format(lastBookable, "d 'de' MMMM", { locale: ptBR })}
        </strong>{' '}
        ({BOOKING_DAYS_AHEAD} dias).
      </p>
    </div>
  );
}

function propsEqual(prev: Props, next: Props): boolean {
  if (prev.disabled !== next.disabled) return false;
  if (prev.today.getTime() !== next.today.getTime()) return false;
  if (prev.selectedDate.getTime() !== next.selectedDate.getTime()) return false;
  if (prev.onSelectDate !== next.onSelectDate) return false;
  if (prev.dateHasSlots === next.dateHasSlots) return true;
  if (prev.dateHasSlots == null || next.dateHasSlots == null) {
    return prev.dateHasSlots == null && next.dateHasSlots == null;
  }
  const pk = Object.keys(prev.dateHasSlots);
  const nk = Object.keys(next.dateHasSlots);
  if (pk.length !== nk.length) return false;
  for (const k of pk) {
    if (prev.dateHasSlots[k] !== next.dateHasSlots[k]) return false;
  }
  return true;
}

const BookingCalendar = memo(BookingCalendarInner, propsEqual);
export default BookingCalendar;
