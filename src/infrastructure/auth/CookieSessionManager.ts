import { cookies } from 'next/headers'
import { SessionManager, SessionData } from '../../domain/auth/SessionManager'
import { UserEntity } from '../../domain/auth/User'

export class CookieSessionManager implements SessionManager {
  private COOKIE_NAME = 'session'

  async createSession(user: UserEntity): Promise<void> {
    const cookieStore = await cookies()
    const value = JSON.stringify({ id: user.id, role: user.role })
    cookieStore.set(this.COOKIE_NAME, value, { httpOnly: true })
  }

  async getSession(): Promise<SessionData | null> {
    const cookieStore = await cookies()
    const cookie = cookieStore.get(this.COOKIE_NAME)
    return cookie ? JSON.parse(cookie.value) : null
  }

  async clearSession(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(this.COOKIE_NAME)
  }
}
