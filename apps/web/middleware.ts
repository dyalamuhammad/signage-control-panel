import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_NAME, verifyToken } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // public routes
  const isPublic =
    pathname === '/login' ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/device/') ||
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico';

  if (isPublic) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;

    console.log('[MW]', pathname, 'token?', !!token, 'payload?', !!payload);

  // protect dashboard pages
  if (!payload) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};