import {
  getAdminTokenFromCookieHeader,
  verifyAdminJwtClaims,
} from "@/lib/admin-session";
import dbConnect from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export type AdminSessionUser = {
  id: string;
  email: string;
  role: "owner" | "admin";
};

async function getAdminSessionFromToken(
  token: string | undefined,
): Promise<AdminSessionUser | null> {
  const claims = await verifyAdminJwtClaims(token);
  if (!claims || !mongoose.isValidObjectId(claims.sub)) return null;
  await dbConnect();
  const user = await AdminUser.findById(claims.sub)
    .select("email active role sessionVersion")
    .lean();
  if (!user || !user.active) return null;
  const sv =
    typeof user.sessionVersion === "number" ? user.sessionVersion : 0;
  if (sv !== claims.sv) return null;
  const role = user.role === "owner" ? "owner" : "admin";
  return { id: String(user._id), email: user.email, role };
}

export async function getAdminFromToken(
  token: string | undefined,
): Promise<AdminSessionUser | null> {
  return getAdminSessionFromToken(token);
}

export async function getAdminFromRequest(
  request: Request,
): Promise<AdminSessionUser | null> {
  const token = getAdminTokenFromCookieHeader(request.headers.get("cookie"));
  return getAdminSessionFromToken(token);
}

export async function requireAdmin(
  request: Request,
): Promise<NextResponse | null> {
  const u = await getAdminFromRequest(request);
  if (!u) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  return null;
}
