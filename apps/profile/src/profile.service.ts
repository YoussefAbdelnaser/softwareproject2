import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../authentication/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .exec();
  }

  async getUserAddresses(userId: string): Promise<string[]> {
    const user = await this.userModel
      .findById(userId)
      .select('addresses')
      .exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user.addresses;
  }

  async addUserAddress(userId: string, newAddress: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }
    user.addresses.push(newAddress);
    return user.save();
  }

  async editUserAddress(
    userId: string,
    index: number,
    newAddress: string,
  ): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (index < 0 || index >= user.addresses.length) {
      throw new BadRequestException('Invalid address index');
    }
    user.addresses[index] = newAddress;
    return user.save();
  }

  async updateUserPassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Old password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();
  }
}
