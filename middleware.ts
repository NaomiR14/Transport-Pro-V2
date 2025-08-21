import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from './src/domain/auth/UserRole'

function canAccess(role: UserRole, route: string): boolean {
  const permissions: Record<UserRole, string[]> = {
    [UserRole.ADMIN]: ['/', '/dashboard', '/vehiculos'],
    [UserRole.USER]: ['/', '/perfil']
  }
  const allowed = permissions[role] || []
  return allowed.some(r => route.startsWith(r))
}

export function middleware(request: NextRequest) {
  const publicRoutes = ['/login', '/api/auth/login']
  if (publicRoutes.some(p => request.nextUrl.pathname.startsWith(p))) {
    return NextResponse.next()
  }
  const sessionCookie = request.cookies.get('session')
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  try {
    const session = JSON.parse(sessionCookie.value) as { role: UserRole }
    if (session.role && canAccess(session.role, request.nextUrl.pathname)) {
      return NextResponse.next()
    }
  } catch {}
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/((?!_next|static).*)']
}
