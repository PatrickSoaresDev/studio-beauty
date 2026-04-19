const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidAdminEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_RE.test(email);
}

export function validateNewPassword(password: string): { ok: true } | { ok: false; error: string } {
  if (password.length < 8) {
    return { ok: false, error: 'A senha deve ter pelo menos 8 caracteres.' };
  }
  if (password.length > 200) {
    return { ok: false, error: 'Senha demasiado longa.' };
  }
  return { ok: true };
}
