import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../authentication/schemas/user.schema';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { ProfileConsumerService } from './profile-consumer.service'; // Import ProfileConsumerService

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [ProfileService, ProfileConsumerService], // Register ProfileConsumerService
  controllers: [ProfileController],
})
export class ProfileModule {}
