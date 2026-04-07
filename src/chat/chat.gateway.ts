import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { ChatService } from './chat.service';
import { AuthService } from '../auth/auth.service';
import { CreateMessageDto, MessageType } from './dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],
  pingInterval: 25000,
  pingTimeout: 20000,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private userSockets: Map<string, string> = new Map();
  private jwtSecret: string;

  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>(
      'JWT_SECRET_KEY',
      'default-secret',
    );
  }

  async handleConnection(client: Socket) {
    try {
      let token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      try {
        token = this.authService.decryptData(token);
      } catch (e) {
        this.logger.warn(
          `Client ${client.id} connected with invalid encrypted token`,
        );
        client.disconnect();
        return;
      }

      const decoded = jwt.verify(token, this.jwtSecret) as any;
      if (!decoded || !decoded.sub) {
        this.logger.warn(`Client ${client.id} connected with invalid token`);
        client.disconnect();
        return;
      }

      (client as any).userId = decoded.sub;
      this.userSockets.set(decoded.sub, client.id);

      this.logger.log(`User ${decoded.sub} connected with socket ${client.id}`);
      client.emit('connect', { userId: decoded.sub });
    } catch (error) {
      this.logger.error(`Error handling connection:`, error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (userId) {
      this.userSockets.delete(userId);
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = (client as any).userId;
    const { conversationId } = data;

    try {
      const messages = await this.chatService.getMessages(
        conversationId,
        userId,
      );
      client.join(conversationId);

      this.logger.debug(`User ${userId} joined conversation ${conversationId}`);

      return {
        event: 'joined',
        data: {
          conversationId,
          messages: messages.reverse(),
        },
      };
    } catch (error) {
      this.logger.error(`Error joining conversation:`, error);
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('leave')
  async handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const { conversationId } = data;
    client.leave(conversationId);
    this.logger.debug(`Client left conversation ${conversationId}`);

    return { event: 'left', data: { conversationId } };
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
      type?: MessageType;
      replyTo?: string;
    },
  ) {
    const userId = (client as any).userId;
    const { conversationId, content, type = MessageType.TEXT, replyTo } = data;

    try {
      const message = await this.chatService.createMessage(
        conversationId,
        userId,
        content,
        type,
        replyTo,
      );

      const messageData = {
        id: (message as any)._id,
        conversationId,
        sender: {
          _id: userId,
          name: (message as any).sender?.name,
          profile: (message as any).sender?.profile,
        },
        content,
        type,
        replyTo: (message as any).replyTo
          ? {
              _id: (message as any).replyTo._id,
              content: (message as any).replyTo?.content,
              sender: (message as any).replyTo?.sender,
              createdAt: (message as any).replyTo?.createdAt,
            }
          : null,
        isRead: false,
        createdAt: (message as any).createdAt,
      };

      this.server.to(conversationId).emit('message', messageData);

      this.logger.debug(`Message sent in conversation ${conversationId}`);

      return { event: 'message_sent', data: messageData };
    } catch (error) {
      this.logger.error(`Error sending message:`, error);
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('read')
  async handleRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; messageId: string },
  ) {
    const userId = (client as any).userId;
    const { conversationId, messageId } = data;

    try {
      await this.chatService.markAsRead(conversationId, userId, messageId);

      this.server.to(conversationId).emit('read', {
        conversationId,
        messageId,
        userId,
        readAt: new Date().toISOString(),
      });

      this.logger.debug(`Message ${messageId} marked as read by ${userId}`);

      return { event: 'read', data: { conversationId, messageId } };
    } catch (error) {
      this.logger.error(`Error marking as read:`, error);
      return { event: 'error', data: { message: error.message } };
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    const userId = (client as any).userId;
    const { conversationId, isTyping } = data;

    client.to(conversationId).emit('typing', {
      conversationId,
      userId,
      isTyping,
    });

    return { event: 'typing', data: { conversationId, userId, isTyping } };
  }

  emitMessageToRoom(conversationId: string, message: any) {
    const messageData = {
      id: message._id,
      conversationId,
      sender: message.sender,
      content: message.content,
      type: message.type,
      isRead: message.isRead,
      createdAt: message.createdAt,
    };
    this.server.to(conversationId).emit('message', messageData);
    this.logger.debug(`Message emitted to room ${conversationId}`);
  }

  sendMessageToUser(userId: string, message: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('message', message);
    }
  }
}
