import { User } from 'src/user/entities/user.entity'

export class UserToken {
  access_token: string
  user: User
}
