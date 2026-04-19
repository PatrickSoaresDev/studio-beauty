import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import AdminUser from '@/models/AdminUser';
import { requireAdmin, getAdminFromRequest } from '@/lib/admin-api';
import { isOwnerRole } from '@/lib/admin-roles';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const me = await getAdminFromRequest(request);
  if (!me) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    if (typeof body.active !== 'boolean') {
      return NextResponse.json({ error: 'Campo active (boolean) é obrigatório.' }, { status: 400 });
    }

    await dbConnect();

    if (body.active === false && id === me.id) {
      return NextResponse.json(
        { error: 'Não pode desativar a própria conta.' },
        { status: 403 },
      );
    }

    if (id !== me.id) {
      if (!isOwnerRole(me.role)) {
        return NextResponse.json(
          { error: 'Só o administrador principal pode ativar ou desativar outras contas.' },
          { status: 403 },
        );
      }
    }

    if (body.active === false) {
      const otherActive = await AdminUser.countDocuments({
        active: true,
        _id: { $ne: id },
      });
      if (otherActive < 1) {
        return NextResponse.json(
          { error: 'Tem de existir pelo menos um administrador ativo.' },
          { status: 400 },
        );
      }
    }

    const updated = await AdminUser.findByIdAndUpdate(
      id,
      { $set: { active: body.active } },
      { new: true },
    )
      .select('email name active createdAt role')
      .lean();

    if (!updated) {
      return NextResponse.json({ error: 'Utilizador não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      _id: String(updated._id),
      email: updated.email,
      name: updated.name ?? '',
      active: updated.active,
      role: updated.role === 'owner' ? 'owner' : 'admin',
      createdAt: updated.createdAt,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro ao atualizar.' }, { status: 500 });
  }
}
