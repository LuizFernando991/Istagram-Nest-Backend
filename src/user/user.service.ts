import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
// import { UpdateUserDto } from './dto/update-user.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
      select: {
        hashedPassword: true,
        id: true,
        name: true,
        username: true,
        profileImage: true,
        email: true,
        followers: false,
        following: false
      }
    })
  }

  async getUserById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        hashedPassword: true,
        id: true,
        name: true,
        username: true,
        profileImage: true,
        email: true,
        followers: false,
        following: false
      }
    })
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { username: createUserDto.username }
        ]
      }
    })
    if (existingUser) {
      const messages = []
      if (existingUser.email === createUserDto.email) {
        messages.push('email already used.')
      }
      if (existingUser.username === createUserDto.username) {
        messages.push('username already used.')
      }
      throw new HttpException(
        {
          messages,
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request'
        },
        HttpStatus.BAD_REQUEST
      )
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
    const data = {
      ...createUserDto,
      password: undefined,
      hashedPassword
    }

    const createdUser = await this.prisma.user.create({
      data
    })

    return {
      ...createdUser,
      password: undefined,
      hashedPassword: undefined
    }
  }

  // findAll() {
  //   return `This action returns all user`
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`
  // }
}
