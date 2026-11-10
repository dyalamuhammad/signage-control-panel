import { NextResponse } from 'next/server';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (
    username !== process.env.ADMIN_USER ||
    password !== process.env.ADMIN_PASS
  ) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  const token = await signToken({ sub: 'admin', role: 'admin' });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}