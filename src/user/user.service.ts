import { Injectable, HttpException, HttpStatus } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { User } from './entities/user.entity'
import { UserFromJwt } from 'src/auth/models/UserFromJwt'

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

  async update(updateUserDto: UpdateUserDto, user: UserFromJwt) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: updateUserDto.email },
          { username: updateUserDto.username }
        ]
      }
    })
    if (existingUser) {
      const messages = []
      if (existingUser.email === updateUserDto.email) {
        messages.push('email already used.')
      }
      if (existingUser.username === updateUserDto.username) {
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

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        ...updateUserDto
      }
    })
    return updatedUser
  }

  async getUserFollowers(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id
      },
      select: {
        followers: true
      }
    })

    const followers = await this.prisma.user.findMany({
      where: {
        id: { in: user.followers }
      },
      select: {
        name: true,
        username: true,
        profileImage: true
      }
    })

    return followers
  }

  async getUserFollowing(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id
      },
      select: {
        following: true
      }
    })

    const following = await this.prisma.user.findMany({
      where: {
        id: { in: user.following }
      },
      select: {
        name: true,
        username: true,
        profileImage: true
      }
    })

    return following
  }

  async follow(id: string, user: UserFromJwt) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        following: true
      }
    })

    if (currentUser.following.includes(id)) {
      return null
    }

    const followedUser = await this.prisma.user.update({
      where: { id },
      data: {
        followers: {
          push: user.id
        }
      },
      select: {
        name: true,
        username: true,
        profileImage: true
      }
    })

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        following: {
          push: id
        }
      }
    })

    return followedUser
  }

  async unfollow(id: string, user: UserFromJwt) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        following: true
      }
    })

    if (!currentUser.following.includes(id)) {
      return null
    }

    const followedUser = await this.prisma.user.findUnique({
      where: { id },
      select: {
        followers: true
      }
    })

    const updatedFollowedUser = await this.prisma.user.update({
      where: { id },
      data: {
        followers: {
          set: followedUser.followers.filter((userID) => userID !== user.id)
        }
      },
      select: {
        name: true,
        username: true,
        profileImage: true
      }
    })

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        following: {
          set: currentUser.following.filter((userID) => userID !== id)
        }
      }
    })

    return updatedFollowedUser
  }

  // remove(id: number) {
  //   return `This action removes a #${id} user`
  // }
}
