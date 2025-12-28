/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
const saltOrRounds = 10;

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async create(createUserDto: CreateUserDto): Promise<{
    status: number;
    message: string;
    data: User;
  }> {
    const ifUserExists = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (ifUserExists) {
      throw new HttpException('User already exists', 400);
    }
    const password = await bcrypt.hash(createUserDto.password, saltOrRounds);
    const user = {
      password,
      role: createUserDto.role ?? 'user',
      active: true,
    };
    console.log({ ...user, ...createUserDto });
    return {
      status: 201,
      message: 'User created successfully',
      data: await this.userModel.create({ ...createUserDto, ...user }),
    };
  } //

  findAll() {
    return this.userModel.find().select('-password -__v');
  }

  async findOne(id: string): Promise<{
    status: number;
    data: User;
  }> {
    const user = await this.userModel.findById(id).select('-password -__v');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      status: 200,
      data: user,
    };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{
    status: number;
    message: string;
    data: User | null;
  }> {
    const ifUserExists = await this.userModel
      .findById(id)
      .select('-password -__v');
    if (!ifUserExists) {
      throw new NotFoundException('User not found');
    }
    let user = {
      ...updateUserDto,
    };
    if (updateUserDto.password) {
      const password = await bcrypt.hash(updateUserDto.password, saltOrRounds);
      user = {
        ...user,
        password,
      };
    }

    return {
      status: 200,
      message: 'User updated successfully',
      data: await this.userModel.findByIdAndUpdate(id, user, {
        new: true,
      }),
    };
  }

  async remove(id: string): Promise<{
    status: number;
    message: string;
  }> {
    const user = await this.userModel.findById(id).select('-password -__v');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userModel.findByIdAndDelete(id);
    return {
      status: 200,
      message: 'User deleted successfully',
    };
  }
}
