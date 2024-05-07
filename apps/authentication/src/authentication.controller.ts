import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthenticationGuard } from './authentication.guard';
import { User } from '../schemas/user.schema';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @UseGuards(AuthenticationGuard)
  @Get()
  async getHello(@Headers('authorization') token: string) {
    console.log('token', token);
    return await this.authenticationService.getHello();
  }

  @Post('/signup')
  async signUp(
    @Body() signUpDto: SignUpDto,
  ): Promise<{ user: User; token: string }> {
    return await this.authenticationService.signUp(signUpDto);
  }
  @UseGuards(AuthenticationGuard)
  @Post('/login')
  async login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    return await this.authenticationService.login(loginDto);
  }
}
