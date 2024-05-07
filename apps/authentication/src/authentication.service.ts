import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../schemas/user.schema';
import { SignUpDto } from '../dto/signup.dto';
import { ProducerService } from '../../../libs/common/src/kafka/producer.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly producerService: ProducerService,
    private jwtService: JwtService,
    @InjectModel(User.name) public userModel: Model<User>,
  ) {}

  async getHello(): Promise<string> {
    await this.producerService.produce({
      topic: 'test',
      messages: [{ value: 'Hello Kafka' }],
    });
    return 'Hello World!';
  }

  // signUp method

  async signUp(signUpDto: SignUpDto): Promise<{ user: User; token: string }> {
    const userExists = await this.userModel
      .findOne({ email: signUpDto.email })
      .exec();
    if (userExists) {
      throw new UnauthorizedException('User already exists');
    }

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      company,
      address,
      password,
    } = signUpDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      firstName,
      lastName,
      email,
      phoneNumber,
      company,
      address,
      password: hashedPassword,
    });

    const token = this.jwtService.sign({ email: user.email });
    user.Token = token;
    await user.save();

    await this.producerService.produce({
      topic: 'signup-user',
      messages: [{ value: JSON.stringify(user) }],
    });

    return { user, token };
  }
  // validateToken method
  async validateToken(token: string): Promise<User> {
    return this.jwtService.verify(token, {
      secret: 'secret',
    });
  }

  // login method
  async login(loginDto: any): Promise<{ user: User; token: string }> {
    const { email, password } = loginDto;
    const user = await this.userModel
      .findOne()
      .where('email')
      .equals(email)
      .exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid password');
    }
    const token = this.jwtService.sign({ email: user.email });

    await this.producerService.produce({
      topic: 'login-user',
      messages: [{ value: JSON.stringify(user) }],
    });
    return { user, token };
  }
}
