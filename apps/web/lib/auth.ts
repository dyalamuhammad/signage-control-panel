import { SignJWT, jwtVerify } from 'jose';

export const COOKIE_NAME = 'admin_token';

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret || rawSecret.length < 32) {
  throw new Error('JWT_SECRET harus diset, minimal 32 karakter');
}
const SECRET = new TextEncoder().encode(rawSecret);

export type JwtPayload = { sub: string; role: 'admin' };

export async function signToken(payload: JwtPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, { algorithms: ['HS256'] });
    if (typeof payload.sub !== 'string' || payload.role !== 'admin') return null;
    return { sub: payload.sub, role: 'admin' };
  } catch {
    return null;
  }
}