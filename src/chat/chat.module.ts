import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import {
  ChatConversation,
  ConversationSchema,
} from './schemas/chat-conversation';
import { ChatMessage, ChatMessageSchema } from './schemas/chat-message.schemas';
import { KafkaModule } from './kafka/kafka.module';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Profile, ProfileSchema } from '../profile/schemas/profile.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'Conversation', schema: ConversationSchema },
      { name: 'Message', schema: ChatMessageSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Profile', schema: ProfileSchema },
    ]),
    KafkaModule,
    AuthModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
