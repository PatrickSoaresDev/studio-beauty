import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminCookieName } from '@/lib/admin-session';
import { getAdminFromToken } from '@/lib/admin-api';

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName)?.value;
  const session = await getAdminFromToken(token);
  if (!session) {
    redirect('/admin/login');
  }
  return <>{children}</>;
}
