/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from './guard/Auth.guard';
import { Roles } from './decorator/Roles.decorator';

@Controller('v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  // Docs Create User - Only admin can create user
  // Route: POST:/api/v1/user
  // access: Private (admin)
  @Post()
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  create(
    @Body(new ValidationPipe({ forbidNonWhitelisted: true }))
    createUserDto: CreateUserDto,
  ) {
    return this.userService.create(createUserDto);
  }

  // Docs Get All Users - Only admin can Get All users
  // Route: GET:/api/v1/user
  // access: Private (admin)
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() query) {
    return this.userService.findAll(query);
  }

  // Docs Get One User - Only admin can Get One user
  // Route: GET:/api/v1/user/:id
  // access: Private (admin)
  @Get(':id')
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // Docs Update One User - Only admin can Update One user
  // Route: PATCH:/api/v1/user/:id
  // access: Private (admin)
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ forbidNonWhitelisted: true }))
    updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  // Docs Delete One User - Only admin can Delete One user
  // Route: DELETE:/api/v1/user/:id
  // access: Private (admin)
  @Roles(['admin'])
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
@Controller('v1/userMe')
export class UserMeController {
  constructor(private readonly userService: UserService) {}
  // Docs Get Profile - Logged in user can get his profile
  // Route: GET:/api/v1/user/me
  // access: Private (user, admin)
  @Get()
  @Roles(['admin', 'user'])
  @UseGuards(AuthGuard)
  getMe(@Req() req) {
    return this.userService.getMe(req.user);
  }

  // Docs Update Profile - Logged in user can update his profile
  // Route: PATCH:/api/v1/userMe
  // access: Private (user, admin)
  @Patch()
  @Roles(['admin', 'user'])
  @UseGuards(AuthGuard)
  updateMe(
    @Req() req,
    @Body(new ValidationPipe({ forbidNonWhitelisted: true }))
    updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateMe(req.user, updateUserDto);
  }
  // Docs Delete Profile - Logged in user can Delete his profile
  // Route: DELETE:/api/v1/userMe
  // access: Private (user, admin)
  @Delete()
  @Roles(['admin', 'user'])
  @UseGuards(AuthGuard)
  deleteMe(@Req() req) {
    return this.userService.deleteMe(req.user);
  }
}
