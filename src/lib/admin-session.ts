import { createHash } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = 'admin_session';
const MIN_SECRET_LENGTH = 32;

function signingMaterial(): string {
  const fromEnv = (process.env.ADMIN_SESSION_SECRET ?? '').trim();
  if (process.env.NODE_ENV === 'production') {
    if (fromEnv.length < MIN_SECRET_LENGTH) {
      throw new Error(
        `Em produção defina ADMIN_SESSION_SECRET com pelo menos ${MIN_SECRET_LENGTH} caracteres (valor aleatório).`,
      );
    }
    return fromEnv;
  }
  if (fromEnv.length >= MIN_SECRET_LENGTH) {
    return fromEnv;
  }
  const dev = (process.env.ADMIN_PASSWORD ?? '').trim();
  if (!dev) {
    throw new Error(
      `Em desenvolvimento: ADMIN_SESSION_SECRET (${MIN_SECRET_LENGTH}+ caracteres) ou ADMIN_PASSWORD (apenas para assinar JWT em dev).`,
    );
  }
  return dev;
}

function getJwtSigningKey(): Uint8Array {
  const material = signingMaterial();
  return new Uint8Array(createHash('sha256').update(material, 'utf8').digest());
}

export type AdminJwtClaims = { sub: string; sv: number };

export async function createAdminToken(
  adminUserId: string,
  sessionVersion: number,
): Promise<string> {
  const key = getJwtSigningKey();
  const sv = Math.floor(Number(sessionVersion)) || 0;
  return await new SignJWT({ sub: adminUserId, sv })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function verifyAdminJwtClaims(
  token: string | undefined,
): Promise<AdminJwtClaims | null> {
  if (!token) return null;
  try {
    const key = getJwtSigningKey();
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    const sub = payload.sub;
    if (typeof sub !== 'string') return null;
    let sv = 0;
    if (typeof payload.sv === 'number' && Number.isFinite(payload.sv)) {
      sv = Math.floor(payload.sv);
    }
    return { sub, sv };
  } catch {
    return null;
  }
}

export function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map((p) => {
      const [k, ...rest] = p.trim().split('=');
      return [k, rest.join('=')];
    }),
  );
}

export function getAdminTokenFromCookieHeader(header: string | null): string | undefined {
  return parseCookies(header)[COOKIE_NAME];
}

export const adminCookieName = COOKIE_NAME;

export function adminSessionCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax';
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  };
}
