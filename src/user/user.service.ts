/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
    return {
      status: 201,
      message: 'User created successfully',
      data: await this.userModel.create({ ...createUserDto, ...user }),
    };
  } //

  async findAll(query) {
    const { _limit, skip, sort, name, email, role } = query;

    if (Number.isNaN(Number(+_limit)) && _limit !== undefined) {
      throw new HttpException('limit must be a number', 400);
    }
    if (Number.isNaN(Number(+skip)) && skip !== undefined) {
      throw new HttpException('skip must be a number', 400);
    }
    if (!['asc', 'desc'].includes(sort) && sort !== undefined) {
      throw new HttpException('sort must be asc or desc', 400);
    }

    const users = await this.userModel
      .find()
      .skip(skip)
      .limit(_limit)
      .where('name', new RegExp(name, 'i'))
      .where('email', new RegExp(email, 'i'))
      .where('role', new RegExp(role, 'i'))
      .sort({ name: sort || 'asc' })
      .select('-password -__v')
      .exec();
    return {
      status: 200,
      message: ' Users found successfully',
      length: users.length,
      data: users,
    };
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

  async getMe(payload) {
    if (!payload._id) {
      console.log(payload.id);
      throw new NotFoundException('User not found');
    }
    const user = await this.userModel
      .findById(payload._id)
      .select('-password -__v');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      status: 200,
      message: 'User profile fetched successfully',
      data: user,
    };
  }

  async updateMe(payload, updateUserDto: UpdateUserDto) {
    if (!payload._id) {
      throw new NotFoundException('User not found');
    }
    const user = await this.userModel
      .findById(payload._id)
      .select('-password -__v');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    let updatedUser = {
      ...updateUserDto,
    };
    if (updateUserDto.password) {
      const password = await bcrypt.hash(updateUserDto.password, saltOrRounds);
      updatedUser = {
        ...updatedUser,
        password,
      };
    }
    return {
      status: 200,
      message: 'User profile updated successfully',
      data: await this.userModel
        .findByIdAndUpdate(payload._id, updatedUser, {
          new: true,
        })
        .select('-password -__v'),
    };
  }

  async deleteMe(payload): Promise<{ message: string }> {
    if (!payload._id) {
      throw new NotFoundException('User not found');
    }
    const user = await this.userModel
      .findById(payload._id)
      .select('-password -__v');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userModel.findByIdAndUpdate(
      payload._id,
      { active: false },
      {
        new: true,
      },
    );
    return { message: 'Your account has been Deleted Successfully' };
  }
}
