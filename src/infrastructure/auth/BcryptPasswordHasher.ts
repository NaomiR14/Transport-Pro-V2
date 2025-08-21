import { createHash } from 'crypto'
import { PasswordHasher } from '../../domain/auth/PasswordHasher'

export class BcryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return createHash('sha256').update(password).digest('hex')
  }

  async compare(password: string, hash: string): Promise<boolean> {
    const hashed = await this.hash(password)
    return hashed === hash
  }
}
