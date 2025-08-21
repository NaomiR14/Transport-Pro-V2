import { UserRepository } from '../../domain/auth/UserRepository'
import { UserEntity } from '../../domain/auth/User'
import { UserRole } from '../../domain/auth/UserRole'

export class PrismaUserRepository implements UserRepository {
  private users: UserEntity[] = [
    new UserEntity('1', 'admin@example.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', UserRole.ADMIN),
    new UserEntity('2', 'user@example.com', '04f8996da763b7a969b1028ee3007569eaf3a635486ddab211d512c85b9df8fb', UserRole.USER)
  ]

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = this.users.find(u => u.email === email)
    return user || null
  }
}
