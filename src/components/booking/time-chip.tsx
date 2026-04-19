"use client";

export function TimeChip({
  time,
  selected,
  onPick,
}: {
  time: string;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={`py-3 rounded-xl font-semibold text-sm transition-all duration-200 border min-h-[48px] ${
        selected
          ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200 ring-2 ring-rose-200 ring-offset-1"
          : "bg-white text-slate-800 border-slate-200 hover:border-rose-400 hover:text-rose-600 hover:shadow-sm"
      }`}
    >
      {time}
    </button>
  );
}
