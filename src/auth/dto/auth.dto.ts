import {
  IsEmail,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
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
}
export class SignInDto {
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
}
export class ResetPasswordDto {
  // Email
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MinLength(0, { message: 'The Email Must be Required' })
  email: string;
}
export class ChangePasswordDto {
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
  // Code
  @IsString({ message: 'Code must be a string' })
  @Length(6, 6, {
    message: 'Code must be at least 6 characters long',
  })
  code: string;
}
