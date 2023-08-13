import { Injectable } from '@nestjs/common'
import { UserService } from 'src/user/user.service'
import * as bcrypt from 'bcrypt'
import { User } from 'src/user/entities/user.entity'
import { UserPayload } from './models/UserPayload'
import { JwtService } from '@nestjs/jwt'
import { UserToken } from './models/UserToken'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  //Retonar o token mas poderia também retornar já o usuário
  login(user: User): UserToken {
    // Transforma o user em jwt
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      name: user.name
    }

    const jwtToken = this.jwtService.sign(payload)

    return {
      access_token: jwtToken
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.getUserByEmail(email)
    if (user) {
      // Check senha
      const isPasswordValue = await bcrypt.compare(password, user.password)
      if (isPasswordValue) {
        return {
          ...user,
          password: undefined
        }
      }
    }
    // Não encontrou o user ou se a senha não é valida
    throw new Error('Email address or password provided is incorrect.')
  }
}
