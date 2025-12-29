/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  // Name
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(30, { message: 'Name can be at most 30 characters long' })
  name: string;

  // Email
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MinLength(0, { message: 'The Email Must be Required' })
  email: string;

  // Password
  @IsString({ message: 'Password must be a string' })
  @MinLength(3, { message: 'Password must be at least 3 characters long' })
  @MaxLength(30, { message: 'Password can be at most 30 characters long' })
  password: string;

  // Role
  @IsOptional()
  @IsEnum(['user', 'admin'], { message: 'Role must be either user or admin' })
  @MinLength(0, { message: 'The Role Must be Required' })
  role: string;

  // Avatar
  @IsOptional()
  @IsString({ message: 'Avatar must be a string' })
  @IsUrl({}, { message: 'Avatar must be a valid URL' })
  avatar: string;

  // Age
  @IsOptional()
  @IsNumber({}, { message: 'Age must be a number' })
  age: number;

  // Phone Number
  @IsOptional()
  @IsString({ message: 'PhoneNumber must be a string' })
  @IsPhoneNumber('DZ', {
    message: 'PhoneNumber must be a Algerian phone number',
  })
  phoneNumber: string;

  // Address
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address: string;

  // Active
  @IsOptional()
  @IsBoolean({ message: 'Active must be a boolean value' })
  @IsEnum([true, false], { message: 'Active must be either true or false' })
  active: boolean;

  // Verification Code
  @IsOptional()
  @IsString({ message: 'VerificationCode must be a string' })
  @Length(6, 6, {
    message: 'VerificationCode must be at least 6 characters long',
  })
  VerificationCode: string;

  // Gender
  @IsOptional()
  @IsEnum(['male', 'female'], {
    message: 'Gender must be either male or female',
  })
  gender: string;
}
