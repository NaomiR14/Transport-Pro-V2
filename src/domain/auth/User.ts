import { UserRole } from './UserRole'

export interface User {
  id: string
  email: string
  password: string
  role: UserRole
}

export class UserEntity implements User {
  constructor(
    public id: string,
    public email: string,
    public password: string,
    public role: UserRole
  ) {}
}
