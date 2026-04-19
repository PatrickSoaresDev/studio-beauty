import Service from '@/models/Service';

const DEFAULT: { name: string; durationMinutes: number }[] = [
  { name: 'Manicure Simples', durationMinutes: 45 },
  { name: 'Pedicure Simples', durationMinutes: 45 },
  { name: 'Manicure e Pedicure', durationMinutes: 90 },
  { name: 'Spa dos Pés e Mãos', durationMinutes: 60 },
  { name: 'Alongamento em Gel', durationMinutes: 120 },
  { name: 'Manutenção de Alongamento', durationMinutes: 90 },
];

export async function ensureDefaultServices(): Promise<void> {
  const n = await Service.countDocuments();
  if (n > 0) return;
  await Service.insertMany(
    DEFAULT.map((s, i) => ({
      name: s.name,
      durationMinutes: s.durationMinutes,
      sortOrder: i,
      active: true,
    }))
  );
}
