import { UserRepository } from '../../domain/auth/UserRepository'
import { PasswordHasher } from '../../domain/auth/PasswordHasher'
import { SessionManager } from '../../domain/auth/SessionManager'
import { UserEntity } from '../../domain/auth/User'

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private passwordHasher: PasswordHasher,
    private sessionManager: SessionManager
  ) {}

  async login(email: string, password: string): Promise<UserEntity> {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw new Error('Invalid credentials')
    }
    const isValid = await this.passwordHasher.compare(password, user.password)
    if (!isValid) {
      throw new Error('Invalid credentials')
    }
    await this.sessionManager.createSession(user)
    return user
  }
}
