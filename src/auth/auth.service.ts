/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ChangePasswordDto, SignInDto, SignUpDto } from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
const saltOrRounds = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
    private readonly mailService: MailerService,
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

  async resetPassword({ email }) {
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Create a random 6-digit code
    const code = Math.floor(1000000 * Math.random())
      .toString()
      .padStart(6, '0');
    // insert code in db => verificationCode
    await this.userModel.findOneAndUpdate(
      { email: email },
      { verificationCode: code },
    );
    // send email to user with the code
    const htmlmessage = `
    <!DOCTYPE html>
      <html lang="en" style="margin:0; padding:0;">
        <head>
          <meta charset="UTF-8" />
          <meta name="color-scheme" content="light dark">
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Verify your email</title>
          <style>
            /* Basic, email-safe styles */
            body {
              margin: 0; padding: 0;
              background: #f6f7f9;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              color: #111827;
            }
            .container {
              width: 100%; max-width: 560px;
              margin: 24px auto; background: #ffffff;
              border-radius: 10px; overflow: hidden;
              border: 1px solid #e5e7eb;
            }
            .header {
              padding: 20px 24px; background: #111827; color: #ffffff;
              font-size: 18px; font-weight: 600; letter-spacing: 0.2px;
            }
            .content {
              padding: 24px;
              line-height: 1.5;
            }
            .code {
              display: inline-block;
              font-size: 24px; font-weight: 700; letter-spacing: 4px;
              padding: 12px 16px; border: 1px dashed #111827; border-radius: 8px;
              background: #f9fafb; color: #111827;
              margin: 12px 0 4px;
            }
            .cta {
              display: inline-block; text-decoration: none;
              background: #2563eb; color: #ffffff; font-weight: 600;
              padding: 12px 18px; border-radius: 8px; margin-top: 16px;
            }
            .muted { color: #6b7280; font-size: 13px; }
            .footer {
              padding: 16px 24px; text-align: center; color: #6b7280; font-size: 12px;
            }
            /* Dark mode hint */
            @media (prefers-color-scheme: dark) {
              body { background: #0b0f14; color: #e5e7eb; }
              .container { background: #0f172a; border-color: #1f2937; }
              .header { background: #1f2937; }
              .code { background: #111827; color: #e5e7eb; border-color: #334155; }
              .muted { color: #9ca3af; }
              .footer { color: #94a3b8; }
            }
          </style>
        </head>
        <body>
          <div class="container" role="article" aria-label="Verification email">
            <div class="header">
              Ecommerce-Nest.JS — Verify your email
            </div>
            <div class="content">
              <p>Hello ${user.name},</p>
              <p>Use the verification code below to complete your sign in:</p>

              <div class="code" aria-label="Your verification code">
                ${code}
              </div>

              <p class="muted">This code expires in 5 minutes.</p>

              <p>If you prefer, you can verify by clicking the button:</p>
              <a class="cta" href="{{verifyUrl}}" target="_blank" rel="noopener">
                Verify now
              </a>

              <p class="muted">
                If you didn’t request this, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              © 2025 Ecommerce-Nest.JS • boumerdes •mimou.test.projects@gmail.com
            </div>
          </div>

          <!-- Plain-text fallback (for clients that strip HTML) -->
          <!--
          Ecommerce-Nest.JS — Verify your email
          Hello ${user.name},
          Your verification code: ${code}
          Expires in 5 minutes.
          Or verify here: {{verifyUrl}}
          If you didn’t request this, ignore this message.
          -->
        </body>
      </html>

    `;

    void this.mailService.sendMail({
      from: `Ecommerce-Nest.JS <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Ecommerce-Nest.JS - Password Reset Code`,
      html: htmlmessage,
    });
    return {
      status: 200,
      message: `Password reset code sent to email (${email}) successfully`,
    };
  }
  async verifyCode({
    email,
    code,
  }: {
    email: string;
    code: string;
  }): Promise<boolean> {
    const user = await this.userModel
      .findOne({ email })
      .select('verificationCode');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    console.log(user.verificationCode, code);
    if (user.verificationCode !== code) {
      throw new UnauthorizedException('Invalid verification code');
    }
    await this.userModel.findOneAndUpdate(
      { email },
      { verificationCode: null },
    );
    return true;
  }
  async changePassword(changePasswordData: ChangePasswordDto) {
    const user = await this.userModel.findOne({
      email: changePasswordData.email,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const valid = await this.verifyCode({
      email: changePasswordData.email,
      code: changePasswordData.code,
    });
    if (!valid) {
      throw new UnauthorizedException('Invalid verification code');
    }
    const password = await bcrypt.hash(
      changePasswordData.password,
      saltOrRounds,
    );
    await this.userModel.findOneAndUpdate(
      { email: changePasswordData.email },
      { password },
    );
    return {
      status: 200,
      message: 'Password changed successfully go to sign in',
    };
  }
}
