import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserFromJwt } from '../models/UserFromJwt'
import { UserPayload } from '../models/UserPayload'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Pode extrair do barer token, cokie, headers e tal
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET
    })
  }

  async validate(payload: UserPayload): Promise<UserFromJwt> {
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name
    }
  }
}
