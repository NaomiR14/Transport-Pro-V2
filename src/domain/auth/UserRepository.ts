import { UserEntity } from './User'

export interface UserRepository {
  findByEmail(email: string): Promise<UserEntity | null>
}
