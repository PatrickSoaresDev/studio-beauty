import dbConnect from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';

export const ADMIN_ROLES = ['owner', 'admin'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export async function ensureOwnerExists(): Promise<void> {
  await dbConnect();
  const hasOwner = await AdminUser.exists({ role: 'owner' });
  if (hasOwner) return;
  const oldest = await AdminUser.findOne().sort({ createdAt: 1 });
  if (!oldest) return;
  await AdminUser.updateOne({ _id: oldest._id }, { $set: { role: 'owner' } });
}

export function isOwnerRole(role: string | undefined): boolean {
  return role === 'owner';
}
