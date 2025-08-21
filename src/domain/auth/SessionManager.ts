import { UserEntity } from './User'
import { UserRole } from './UserRole'

export interface SessionData {
  id: string
  role: UserRole
}

export interface SessionManager {
  createSession(user: UserEntity): Promise<void>
  getSession(): Promise<SessionData | null>
  clearSession(): Promise<void>
}
