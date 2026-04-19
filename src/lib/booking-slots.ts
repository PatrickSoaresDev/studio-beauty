export function groupSlotsByPeriod(slots: string[]): {
  morning: string[];
  afternoon: string[];
} {
  const morning: string[] = [];
  const afternoon: string[] = [];
  const sorted = [...slots].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );
  for (const t of sorted) {
    const h = parseInt(t.split(":")[0], 10);
    if (Number.isNaN(h)) continue;
    if (h < 13) morning.push(t);
    else afternoon.push(t);
  }
  return { morning, afternoon };
}
