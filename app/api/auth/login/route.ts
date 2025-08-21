import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '../../../../src/application/auth/AuthService'
import { PrismaUserRepository } from '../../../../src/infrastructure/db/PrismaUserRepository'
import { BcryptPasswordHasher } from '../../../../src/infrastructure/auth/BcryptPasswordHasher'
import { CookieSessionManager } from '../../../../src/infrastructure/auth/CookieSessionManager'

const authService = new AuthService(
  new PrismaUserRepository(),
  new BcryptPasswordHasher(),
  new CookieSessionManager()
)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const user = await authService.login(email, password)
    return NextResponse.json({ id: user.id, email: user.email, role: user.role })
  } catch (error) {
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 })
  }
}
