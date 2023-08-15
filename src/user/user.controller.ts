import {
  Controller,
  Post,
  Put,
  Body,
  Get,
  Patch,
  Param
  // Param,
  // Delete
} from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { IsPublic } from 'src/auth/decorators/is-public.decorator'
import { UpdateUserDto } from './dto/update-user.dto'
import { CurrentUser } from 'src/auth/decorators/current-user.decoratos'
import { UserFromJwt } from 'src/auth/models/UserFromJwt'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @IsPublic()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto)
  }

  // @Get()
  // findAll() {
  //   return this.userService.findAll()
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(+id)
  // }

  @Patch()
  update(
    @CurrentUser() user: UserFromJwt,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.update(updateUserDto, user)
  }

  @Get('followers/:id')
  getUserFollower(@Param('id') id: string) {
    return this.userService.getUserFollowers(id)
  }

  @Put('follow/:id')
  followAUser(@CurrentUser() user: UserFromJwt, @Param('id') id: string) {
    return this.userService.follow(id, user)
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id)
  // }
}
