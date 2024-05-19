import { Module, OnModuleInit } from '@nestjs/common';
import { ProfileModule } from './profile.module';
import { ProfileConsumerService } from './profile-consumer.service';

@Module({
  imports: [ProfileModule],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly profileConsumerService: ProfileConsumerService,
  ) {}

  async onModuleInit() {
    await this.profileConsumerService.consume(
      [
        { topic: 'edit-account' },
        { topic: 'create-address' },
        { topic: 'edit-address' },
        { topic: 'edit-password' },
      ],
      { eachMessage: async ({ topic, partition, message }) => {} },
    );
  }
}
