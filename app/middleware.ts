import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.get('admin_session');

  // Protect dashboard route
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    if (!hasSession) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Prevent accessing login page if already logged in  
  if (request.nextUrl.pathname === '/admin' && hasSession) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/admin']
};
