import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Note: Middleware runs on the server and can't access localStorage
  // We'll handle auth protection on the client side instead
  const { pathname } = request.nextUrl;

  // Allow all routes - auth protection will be handled client-side
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
