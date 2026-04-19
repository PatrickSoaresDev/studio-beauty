import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import { getAdminFromRequest } from '@/lib/admin-api';
import {
  adminCookieName,
  adminSessionCookieOptions,
  createAdminToken,
} from '@/lib/admin-session';
import { validateNewPassword } from '@/lib/admin-user-validation';
import { hashPassword, verifyPassword } from '@/lib/password-hash';

export async function POST(request: Request) {
  const session = await getAdminFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Indique a senha atual e a nova senha.' },
        { status: 400 },
      );
    }

    const pw = validateNewPassword(newPassword);
    if (!pw.ok) {
      return NextResponse.json({ error: pw.error }, { status: 400 });
    }

    await dbConnect();
    const user = await AdminUser.findById(session.id).select('+passwordHash sessionVersion');
    if (!user || !user.active) {
      return NextResponse.json({ error: 'Conta inválida.' }, { status: 401 });
    }

    const currentOk = await verifyPassword(currentPassword, user.passwordHash);
    if (!currentOk) {
      return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 401 });
    }

    user.passwordHash = await hashPassword(newPassword);
    const prevSv = typeof user.sessionVersion === 'number' ? user.sessionVersion : 0;
    user.sessionVersion = prevSv + 1;
    await user.save();

    const token = await createAdminToken(String(user._id), user.sessionVersion);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(adminCookieName, token, adminSessionCookieOptions());
    return res;
  } catch (e) {
    console.error('change-password:', e);
    return NextResponse.json({ error: 'Erro ao alterar a senha.' }, { status: 500 });
  }
}
