import {
  adminCookieName,
  adminSessionCookieOptions,
  createAdminToken,
} from "@/lib/admin-session";
import {
  isValidAdminEmail,
  normalizeAdminEmail,
  validateNewPassword,
} from "@/lib/admin-user-validation";
import dbConnect from "@/lib/mongodb";
import { hashPassword } from "@/lib/password-hash";
import AdminUser from "@/models/AdminUser";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    await dbConnect();
    if ((await AdminUser.countDocuments()) > 0) {
      return NextResponse.json(
        { error: "Já existem administradores. Use o login normal." },
        { status: 403 },
      );
    }

    const body = await request.json();
    const email = normalizeAdminEmail(
      typeof body.email === "string" ? body.email : "",
    );
    const password = typeof body.password === "string" ? body.password : "";
    const name =
      typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
    const setupToken =
      typeof body.setupToken === "string" ? body.setupToken : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Indique email e senha." },
        { status: 400 },
      );
    }
    if (!isValidAdminEmail(email)) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }
    const pw = validateNewPassword(password);
    if (!pw.ok) {
      return NextResponse.json({ error: pw.error }, { status: 400 });
    }

    const expected = (process.env.ADMIN_SETUP_TOKEN ?? "").trim();
    if (process.env.NODE_ENV === "production") {
      if (!expected || setupToken !== expected) {
        return NextResponse.json(
          {
            error:
              "Token de configuração inválido ou em falta (ADMIN_SETUP_TOKEN).",
          },
          { status: 403 },
        );
      }
    } else if (expected && setupToken !== expected) {
      return NextResponse.json(
        { error: "Token de configuração inválido." },
        { status: 403 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await AdminUser.create({
      email,
      passwordHash,
      name,
      role: "owner",
      active: true,
    });

    const sv =
      typeof user.sessionVersion === "number" ? user.sessionVersion : 0;
    const token = await createAdminToken(String(user._id), sv);
    const res = NextResponse.json({ ok: true, email: user.email });
    res.cookies.set(adminCookieName, token, adminSessionCookieOptions());
    return res;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (/duplicate key|E11000/i.test(msg)) {
      return NextResponse.json(
        { error: "Este email já está registado." },
        { status: 409 },
      );
    }
    if (
      /ADMIN_SESSION_SECRET|Em produção defina|Em desenvolvimento/.test(msg)
    ) {
      return NextResponse.json(
        { error: "Configuração do servidor incompleta (segredo JWT)." },
        { status: 503 },
      );
    }
    console.error("bootstrap admin:", e);
    return NextResponse.json(
      { error: "Erro ao criar administrador." },
      { status: 500 },
    );
  }
}
