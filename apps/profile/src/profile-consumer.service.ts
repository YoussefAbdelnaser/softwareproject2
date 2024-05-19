import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import {
  Consumer,
  ConsumerRunConfig,
  ConsumerSubscribeTopic,
  Kafka,
} from 'kafkajs';
import { ProfileService } from './profile.service'; // Ensure this is the correct path

@Injectable()
export class ProfileConsumerService implements OnApplicationShutdown {
  private readonly kafka = new Kafka({
    brokers: ['localhost:9092'],
  });

  private readonly consumers: Consumer[] = [];

  constructor(private readonly profileService: ProfileService) {} // Inject the ProfileService

  async consume(topics: ConsumerSubscribeTopic[], config: ConsumerRunConfig) {
    const consumer = this.kafka.consumer({ groupId: 'profile-group' });
    await consumer.connect();
    for (const topic of topics) {
      await consumer.subscribe(topic);
    }
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const { userId, ...data } = JSON.parse(message.value.toString());
        switch (topic) {
          case 'edit-account':
            await this.handleEditAccount(userId, data.updateData);
            break;
          case 'create-address':
            await this.handleCreateAddress(userId, data.address);
            break;
          case 'edit-address':
            await this.handleEditAddress(userId, data.index, data.newAddress);
            break;
          case 'edit-password':
            await this.handleEditPassword(
              userId,
              data.oldPassword,
              data.newPassword,
            );
            break;
          default:
            console.warn(`Unhandled topic: ${topic}`);
        }
      },
    });
    this.consumers.push(consumer);
  }

  async handleEditAccount(userId: string, updateData: any) {
    try {
      await this.profileService.updateUser(userId, updateData);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  }

  async handleCreateAddress(userId: string, address: string) {
    try {
      await this.profileService.addUserAddress(userId, address);
    } catch (error) {
      console.error('Failed to create address:', error);
    }
  }

  async handleEditAddress(userId: string, index: number, newAddress: string) {
    try {
      await this.profileService.editUserAddress(userId, index, newAddress);
    } catch (error) {
      console.error('Failed to edit address:', error);
    }
  }

  async handleEditPassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    try {
      await this.profileService.updateUserPassword(
        userId,
        oldPassword,
        newPassword,
      );
    } catch (error) {
      console.error('Failed to update password:', error);
    }
  }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
