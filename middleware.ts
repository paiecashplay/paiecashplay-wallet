import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Routes protégées
  const protectedRoutes = ['/dashboard', '/admin', '/api/wallet', '/api/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    const sessionCookie = request.cookies.get('session')
    
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    try {
      await jwtVerify(sessionCookie.value, secret)
    } catch {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/wallet/:path*', '/api/admin/:path*']
}