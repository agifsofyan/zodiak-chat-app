import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Kafka from 'kafkajs';
import { KAFKA_TOPICS } from './kafka.topic';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka.Kafka;
  private consumer: Kafka.Consumer;
  private isProcessing = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.kafka = new Kafka.Kafka({
      clientId: this.configService.get<string>(
        'KAFKA_CLIENT_ID',
        'zodiak-chat-app',
      ),
      brokers: this.configService
        .get<string>('KAFKA_BROKERS', 'localhost:9092')
        .split(','),
    });

    this.consumer = this.kafka.consumer({
      groupId: this.configService.get<string>(
        'KAFKA_GROUP_ID',
        'chat-consumer-group',
      ),
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });

    await this.consumer.connect();
    this.logger.log('Kafka Consumer connected');

    await this.subscribeToTopics();
    await this.startConsuming();
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    this.logger.log('Kafka Consumer disconnected');
  }

  private async subscribeToTopics() {
    await this.consumer.subscribe({
      topics: [KAFKA_TOPICS.CHAT_MESSAGE, KAFKA_TOPICS.CHAT_MESSAGE_READ],
      fromBeginning: false,
    });
  }

  private async startConsuming() {
    await this.consumer.run({
      autoCommit: true,
      autoCommitInterval: 5000,
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const payload = JSON.parse(message.value?.toString() || '{}');

          this.logger.debug(
            `Received message from ${topic}[${partition}]:`,
            payload,
          );

          if (topic === KAFKA_TOPICS.CHAT_MESSAGE) {
            await this.handleNewMessage(payload);
          } else if (topic === KAFKA_TOPICS.CHAT_MESSAGE_READ) {
            await this.handleReadMessage(payload);
          }
        } catch (error) {
          this.logger.error(`Error processing message from ${topic}:`, error);
        }
      },
    });
  }

  private async handleNewMessage(payload: any) {
    this.logger.debug('Processing new message:', payload);
  }

  private async handleReadMessage(payload: any) {
    this.logger.debug('Processing read receipt:', payload);
  }
}
