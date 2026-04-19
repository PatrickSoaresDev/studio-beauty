export const APPOINTMENT_STATUS = ['pending', 'confirmed', 'rejected'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUS)[number];

export function statusBlocksSlot(status: string | undefined | null): boolean {
  if (status == null || status === '') return true;
  return status !== 'rejected';
}

export function statusLabel(status: string | undefined | null): string {
  switch (status) {
    case 'pending':
      return 'Pendente';
    case 'confirmed':
      return 'Confirmado';
    case 'rejected':
      return 'Rejeitado';
    default:
      return 'Pendente';
  }
}
