import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { SignInDto, SignUpDto } from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
const saltOrRounds = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}
  async signUp(signUpDto: SignUpDto) {
    const user = await this.userModel.findOne({ email: signUpDto.email });
    if (user) {
      throw new HttpException('User already exists', 400);
    }
    const password = await bcrypt.hash(signUpDto.password, saltOrRounds);
    const newUser = await this.userModel.create({
      ...signUpDto,
      password,
      role: 'user',
      active: true,
    });
    const payload = {
      _id: newUser._id,
      email: newUser.email,
      role: newUser.role,
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });
    return {
      status: 201,
      message: 'User signed up successfully',
      data: newUser,
      access_token: token,
    };
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.userModel
      .findOne({ email: signInDto.email })
      .select('-__v');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(
      signInDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', 400);
    }
    const payload = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
    });
    return {
      status: 200,
      message: 'User signed in successfully',
      data: user,
      access_token: token,
    };
  }
}
