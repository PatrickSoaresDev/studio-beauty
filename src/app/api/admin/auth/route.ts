import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import { adminCookieName, adminSessionCookieOptions, createAdminToken } from '@/lib/admin-session';
import { getAdminFromRequest } from '@/lib/admin-api';
import { normalizeAdminEmail, isValidAdminEmail } from '@/lib/admin-user-validation';
import { verifyPassword } from '@/lib/password-hash';
import { ensureOwnerExists } from '@/lib/admin-roles';

const GENERIC_LOGIN_ERROR = 'Email ou senha incorretos.';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeAdminEmail(typeof body.email === 'string' ? body.email : '');
    const password = typeof body.password === 'string' ? body.password : '';
    if (!email || !password) {
      return NextResponse.json({ error: 'Indique email e senha.' }, { status: 400 });
    }
    if (!isValidAdminEmail(email)) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });
    }

    await dbConnect();
    await ensureOwnerExists();
    const user = await AdminUser.findOne({ email }).select('+passwordHash').lean();
    if (!user || !user.active) {
      return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: GENERIC_LOGIN_ERROR }, { status: 401 });
    }

    const sv = typeof (user as { sessionVersion?: number }).sessionVersion === 'number'
      ? (user as { sessionVersion: number }).sessionVersion
      : 0;
    const token = await createAdminToken(String(user._id), sv);
    const role =
      (user as { role?: string }).role === 'owner' ? 'owner' : 'admin';
    const res = NextResponse.json({ ok: true, email: user.email, role });
    res.cookies.set(adminCookieName, token, adminSessionCookieOptions());
    return res;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (/ADMIN_SESSION_SECRET|Em produção defina|Em desenvolvimento/.test(msg)) {
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta (segredo JWT).' },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(adminCookieName, '', { ...adminSessionCookieOptions(), maxAge: 0 });
  return res;
}

export async function GET(request: Request) {
  await dbConnect();
  await ensureOwnerExists();
  const needsBootstrap = (await AdminUser.countDocuments()) === 0;
  const session = await getAdminFromRequest(request);
  if (!session) {
    return NextResponse.json({
      authenticated: false,
      needsBootstrap,
      email: null as string | null,
      userId: null as string | null,
      role: null as 'owner' | 'admin' | null,
    });
  }
  return NextResponse.json({
    authenticated: true,
    needsBootstrap,
    email: session.email,
    userId: session.id,
    role: session.role,
  });
}
