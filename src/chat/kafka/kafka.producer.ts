import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Kafka from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private kafka: Kafka.Kafka;
  private producer: Kafka.Producer;

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
      retry: {
        initialRetryTime: 100,
        retries: 3,
      },
    });

    this.producer = this.kafka.producer();

    await this.producer.connect();
    this.logger.log('Kafka Producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    this.logger.log('Kafka Producer disconnected');
  }

  async emit(topic: string, message: any) {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: message.conversationId || null,
            value: JSON.stringify(message),
            timestamp: Date.now().toString(),
          },
        ],
      });
      this.logger.debug(`Message emitted to topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to emit message to topic ${topic}:`, error);
      throw error;
    }
  }

  async emitBatch(topic: string, messages: any[]) {
    try {
      await this.producer.send({
        topic,
        messages: messages.map((msg) => ({
          key: msg.conversationId || null,
          value: JSON.stringify(msg),
          timestamp: Date.now().toString(),
        })),
      });
      this.logger.debug(
        `Batch emitted to topic: ${topic}, count: ${messages.length}`,
      );
    } catch (error) {
      this.logger.error(`Failed to emit batch to topic ${topic}:`, error);
      throw error;
    }
  }
}
