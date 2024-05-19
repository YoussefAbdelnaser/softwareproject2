import {
  Controller,
  Put,
  Get,
  Post,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { User } from 'apps/authentication/schemas/user.schema';
import { UpdatePasswordDto } from './dto/profile.dto';

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Put(':id')
  async updateUser(
    @Param('id') userId: string,
    @Body() updateData: Partial<User>,
  ): Promise<User> {
    return this.profileService.updateUser(userId, updateData);
  }

  @Get(':id/addresses')
  async getUserAddresses(@Param('id') userId: string): Promise<string[]> {
    return this.profileService.getUserAddresses(userId);
  }

  @Post(':id/addresses')
  async addUserAddress(
    @Param('id') userId: string,
    @Body('address') newAddress: string,
  ): Promise<User> {
    return this.profileService.addUserAddress(userId, newAddress);
  }

  @Put(':id/addresses/:index')
  async editUserAddress(
    @Param('id') userId: string,
    @Param('index') index: number,
    @Body('address') newAddress: string,
  ): Promise<User> {
    return this.profileService.editUserAddress(userId, index, newAddress);
  }

  @Put(':id/password')
  async updateUserPassword(
    @Param('id') userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    const { oldPassword, newPassword } = updatePasswordDto;
    if (oldPassword === newPassword) {
      throw new BadRequestException(
        'New password cannot be the same as the old password',
      );
    }
    await this.profileService.updateUserPassword(
      userId,
      oldPassword,
      newPassword,
    );
  }
}
