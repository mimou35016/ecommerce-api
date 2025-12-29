import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
} from './dto/auth.dto';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Docs Sign Up - Any User can Sign Up
  // Route: POST:/api/v1/auth/sign-up
  // access: Public
  @Post('sign-up')
  signUp(
    @Body(new ValidationPipe({ forbidNonWhitelisted: true }))
    signUpDto: SignUpDto,
  ) {
    return this.authService.signUp(signUpDto);
  }

  // Docs Sign In - Any User can Sign In
  // Route: POST:/api/v1/auth/sign-in
  // access: Public
  @Post('sign-in')
  signIn(
    @Body(new ValidationPipe({ forbidNonWhitelisted: true }))
    signInDto: SignInDto,
  ) {
    return this.authService.signIn(signInDto);
  }

  // Docs Reset Password - Any User can Reset Password
  // Route: POST:/api/v1/auth/reset-password
  // access: Public
  @Post('reset-password')
  resetPassword(
    @Body(new ValidationPipe({ forbidNonWhitelisted: true }))
    email: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(email);
  }

  // Docs Change Password - Any User can Change Password
  // Route: POST:/api/v1/auth/change-password
  // access: private for user after verify code
  @Post('change-password')
  changePassword(
    @Body(new ValidationPipe({ forbidNonWhitelisted: true }))
    changePasswordData: ChangePasswordDto,
  ) {
    return this.authService.changePassword(changePasswordData);
  }
}
