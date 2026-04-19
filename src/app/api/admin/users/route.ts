import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import { requireAdmin, getAdminFromRequest } from '@/lib/admin-api';
import { ensureOwnerExists, isOwnerRole } from '@/lib/admin-roles';
import {
  normalizeAdminEmail,
  isValidAdminEmail,
  validateNewPassword,
} from '@/lib/admin-user-validation';
import { hashPassword } from '@/lib/password-hash';

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  try {
    await dbConnect();
    await ensureOwnerExists();
    const users = await AdminUser.find()
      .select('email name active createdAt role')
      .sort({ createdAt: 1 })
      .lean();
    return NextResponse.json(
      users.map((u) => ({
        _id: String(u._id),
        email: u.email,
        name: u.name ?? '',
        active: u.active,
        role: u.role === 'owner' ? 'owner' : 'admin',
        createdAt: u.createdAt,
      })),
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao listar utilizadores.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const me = await getAdminFromRequest(request);
  if (!me || !isOwnerRole(me.role)) {
    return NextResponse.json(
      { error: 'Só o administrador principal pode criar novas contas.' },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const email = normalizeAdminEmail(typeof body.email === 'string' ? body.email : '');
    const password = typeof body.password === 'string' ? body.password : '';
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'Indique email e senha.' }, { status: 400 });
    }
    if (!isValidAdminEmail(email)) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });
    }
    const pw = validateNewPassword(password);
    if (!pw.ok) {
      return NextResponse.json({ error: pw.error }, { status: 400 });
    }

    await dbConnect();
    const passwordHash = await hashPassword(password);
    const user = await AdminUser.create({
      email,
      passwordHash,
      name,
      role: 'admin',
      active: true,
    });

    return NextResponse.json(
      {
        _id: String(user._id),
        email: user.email,
        name: user.name,
        active: user.active,
        role: 'admin' as const,
        createdAt: user.createdAt,
      },
      { status: 201 },
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (/duplicate key|E11000/i.test(msg)) {
      return NextResponse.json({ error: 'Já existe um utilizador com este email.' }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: 'Erro ao criar utilizador.' }, { status: 500 });
  }
}
