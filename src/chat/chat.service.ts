import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ChatConversation,
  ConversationType,
} from './schemas/chat-conversation';
import { ChatMessage } from './schemas/chat-message.schemas';
import { KafkaProducerService } from './kafka/kafka.producer';
import { KAFKA_TOPICS } from './kafka/kafka.topic';

const MAX_GROUP_MEMBERS = 100;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel('Conversation')
    private readonly conversationModel: Model<ChatConversation>,
    @InjectModel('Message') private readonly messageModel: Model<ChatMessage>,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async createOrGetConversation(
    userId: string,
    participantId: string,
  ): Promise<ChatConversation> {
    const objectId = new Types.ObjectId();
    const participantObjectId = new Types.ObjectId(participantId);
    const userObjectId = new Types.ObjectId(userId);

    let conversation = await this.conversationModel.findOne({
      participants: { $all: [userObjectId, participantObjectId], $size: 2 },
    });

    if (!conversation) {
      conversation = await this.conversationModel.create({
        _id: objectId,
        participants: [userObjectId, participantObjectId],
      });
      this.logger.log(`Created new conversation: ${conversation._id}`);
    }

    return conversation;
  }

  async getConversations(userId: string): Promise<ChatConversation[]> {
    const userObjectId = new Types.ObjectId(userId);

    return this.conversationModel
      .find({ participants: userObjectId })
      .populate('participants', 'name email profile')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async getMessages(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<ChatMessage[]> {
    const conversationObjectId = new Types.ObjectId(conversationId);
    const userObjectId = new Types.ObjectId(userId);

    const conversation =
      await this.conversationModel.findById(conversationObjectId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some((p) =>
      new Types.ObjectId(p).equals(userObjectId),
    );

    if (!isParticipant) {
      throw new NotFoundException(
        'You are not a participant in this conversation',
      );
    }

    return this.messageModel
      .find({ conversation: conversationObjectId, isDeleted: false })
      .populate('sender', 'name email profile')
      .populate('replyTo', 'content sender createdAt type')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  async getMessagesAndMarkAsRead(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<ChatMessage[]> {
    const conversationObjectId = new Types.ObjectId(conversationId);
    const userObjectId = new Types.ObjectId(userId);

    const conversation =
      await this.conversationModel.findById(conversationObjectId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some((p) =>
      new Types.ObjectId(p).equals(userObjectId),
    );

    if (!isParticipant) {
      throw new NotFoundException(
        'You are not a participant in this conversation',
      );
    }

    await this.messageModel.updateMany(
      {
        conversation: conversationObjectId,
        sender: { $ne: userObjectId },
        isRead: false,
      },
      { isRead: true, readAt: new Date() },
    );

    return this.messageModel
      .find({ conversation: conversationObjectId, isDeleted: false })
      .populate('sender', 'name email profile')
      .populate('replyTo', 'content sender createdAt type')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  async markAsRead(
    conversationId: string,
    userId: string,
    messageId: string,
  ): Promise<void> {
    const conversationObjectId = new Types.ObjectId(conversationId);
    const messageObjectId = new Types.ObjectId(messageId);
    const userObjectId = new Types.ObjectId(userId);

    const conversation =
      await this.conversationModel.findById(conversationObjectId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some((p) =>
      new Types.ObjectId(p).equals(userObjectId),
    );

    if (!isParticipant) {
      throw new NotFoundException(
        'You are not a participant in this conversation',
      );
    }

    await this.messageModel
      .findOneAndUpdate(
        {
          _id: messageObjectId,
          conversation: conversationObjectId,
          isRead: false,
        },
        { isRead: true, readAt: new Date() },
        { new: true },
      )
      .exec();

    try {
      await this.kafkaProducer.emit(KAFKA_TOPICS.CHAT_MESSAGE_READ, {
        conversationId,
        messageId,
        userId,
        readAt: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.warn('Failed to emit Kafka read receipt:', error);
    }
  }

  async getUnreadCount(
    conversationId: string,
    userId: string,
  ): Promise<number> {
    const conversationObjectId = new Types.ObjectId(conversationId);
    const userObjectId = new Types.ObjectId(userId);

    const conversation =
      await this.conversationModel.findById(conversationObjectId);
    if (!conversation) {
      return 0;
    }

    return this.messageModel
      .countDocuments({
        conversation: conversationObjectId,
        sender: { $ne: userObjectId },
        isRead: false,
      })
      .exec();
  }

  async markAllAsRead(
    conversationId: string,
    userId: string,
  ): Promise<{ modifiedCount: number }> {
    const conversationObjectId = new Types.ObjectId(conversationId);
    const userObjectId = new Types.ObjectId(userId);

    const conversation =
      await this.conversationModel.findById(conversationObjectId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some((p) =>
      new Types.ObjectId(p).equals(userObjectId),
    );

    if (!isParticipant) {
      throw new NotFoundException(
        'You are not a participant in this conversation',
      );
    }

    const result = await this.messageModel.updateMany(
      {
        conversation: conversationObjectId,
        sender: { $ne: userObjectId },
        isRead: false,
      },
      { isRead: true, readAt: new Date() },
    );

    try {
      await this.kafkaProducer.emit(KAFKA_TOPICS.CHAT_MESSAGE_READ, {
        conversationId,
        userId,
        action: 'markAllAsRead',
        readAt: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.warn('Failed to emit Kafka read receipt:', error);
    }

    return { modifiedCount: result.modifiedCount };
  }

  async createMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: string = 'text',
    replyTo?: string,
  ): Promise<ChatMessage> {
    const conversationObjectId = new Types.ObjectId(conversationId);
    const senderObjectId = new Types.ObjectId(senderId);

    const conversation =
      await this.conversationModel.findById(conversationObjectId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const messageData: any = {
      conversation: conversationObjectId,
      sender: senderObjectId,
      content,
      type,
      isRead: false,
    };

    if (replyTo) {
      messageData.replyTo = new Types.ObjectId(replyTo);
    }

    const message = await this.messageModel.create(messageData);

    await this.conversationModel.findByIdAndUpdate(conversationObjectId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    try {
      await this.kafkaProducer.emit(KAFKA_TOPICS.CHAT_MESSAGE, {
        conversationId,
        messageId: message._id.toString(),
        senderId,
        content,
        type,
        replyTo,
        timestamp:
          (message as any).createdAt?.toISOString() || new Date().toISOString(),
      });
    } catch (error) {
      this.logger.warn('Failed to emit Kafka message:', error);
    }

    const populatedMessage = await (message as any)
      .populate('sender', 'name email profile')
      .populate('replyTo', 'content sender createdAt type');
    return populatedMessage;
  }

  async createGroup(
    userId: string,
    groupName: string,
    participantIds: string[],
  ): Promise<ChatConversation> {
    const userObjectId = new Types.ObjectId(userId);
    const participantObjectIds = participantIds.map(
      (id) => new Types.ObjectId(id),
    );

    if (!participantObjectIds.includes(userObjectId)) {
      participantObjectIds.push(userObjectId);
    }

    if (participantObjectIds.length < 3) {
      throw new BadRequestException('Group must have at least 3 members');
    }

    if (participantObjectIds.length > MAX_GROUP_MEMBERS) {
      throw new BadRequestException(
        `Group cannot have more than ${MAX_GROUP_MEMBERS} members`,
      );
    }

    const conversation = await this.conversationModel.create({
      participants: participantObjectIds,
      type: ConversationType.GROUP,
      groupName,
      admin: userObjectId,
    });

    this.logger.log(`Created new group: ${conversation._id}`);
    return conversation;
  }

  async getGroupInfo(
    conversationId: string,
    userId: string,
  ): Promise<ChatConversation> {
    const userObjectId = new Types.ObjectId(userId);
    const conversationObjectId = new Types.ObjectId(conversationId);

    const conversation = await this.conversationModel
      .findById(conversationObjectId)
      .populate('participants', 'name email profile')
      .populate('admin', 'name email');

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const isParticipant = conversation.participants.some((p: any) =>
      new Types.ObjectId(p._id).equals(userObjectId),
    );

    if (!isParticipant) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }

    return conversation;
  }

  async updateGroup(
    conversationId: string,
    userId: string,
    groupName: string,
  ): Promise<ChatConversation> {
    const userObjectId = new Types.ObjectId(userId);
    const conversationObjectId = new Types.ObjectId(conversationId);

    const conversation =
      await this.conversationModel.findById(conversationObjectId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.type !== ConversationType.GROUP) {
      throw new BadRequestException('This is not a group conversation');
    }

    if (!conversation.admin.equals(userObjectId)) {
      throw new ForbiddenException('Only admin can update group');
    }

    conversation.groupName = groupName;
    await conversation.save();

    return conversation.populate('participants', 'name email profile');
  }

  async addMember(
    conversationId: string,
    userId: string,
    newMemberId: string,
  ): Promise<ChatConversation> {
    const userObjectId = new Types.ObjectId(userId);
    const newMemberObjectId = new Types.ObjectId(newMemberId);
    const conversationObjectId = new Types.ObjectId(conversationId);

    const conversation =
      await this.conversationModel.findById(conversationObjectId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.type !== ConversationType.GROUP) {
      throw new BadRequestException('This is not a group conversation');
    }

    if (!conversation.admin.equals(userObjectId)) {
      throw new ForbiddenException('Only admin can add members');
    }

    if (conversation.participants.length >= MAX_GROUP_MEMBERS) {
      throw new BadRequestException(
        `Group cannot have more than ${MAX_GROUP_MEMBERS} members`,
      );
    }

    const isAlreadyMember = conversation.participants.some((p) =>
      p.equals(newMemberObjectId),
    );

    if (isAlreadyMember) {
      throw new BadRequestException('User is already a member of this group');
    }

    conversation.participants.push(newMemberObjectId);
    await conversation.save();

    return conversation.populate('participants', 'name email profile');
  }

  async removeMember(
    conversationId: string,
    userId: string,
    memberIdToRemove: string,
  ): Promise<ChatConversation> {
    const userObjectId = new Types.ObjectId(userId);
    const memberToRemoveObjectId = new Types.ObjectId(memberIdToRemove);
    const conversationObjectId = new Types.ObjectId(conversationId);

    const conversation =
      await this.conversationModel.findById(conversationObjectId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.type !== ConversationType.GROUP) {
      throw new BadRequestException('This is not a group conversation');
    }

    if (!conversation.admin.equals(userObjectId)) {
      throw new ForbiddenException('Only admin can remove members');
    }

    if (conversation.admin.equals(memberToRemoveObjectId)) {
      throw new BadRequestException(
        'Cannot remove admin from group. Demote first.',
      );
    }

    conversation.participants = conversation.participants.filter(
      (p) => !p.equals(memberToRemoveObjectId),
    );
    await conversation.save();

    return conversation.populate('participants', 'name email profile');
  }

  async leaveGroup(
    conversationId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const userObjectId = new Types.ObjectId(userId);
    const conversationObjectId = new Types.ObjectId(conversationId);

    const conversation =
      await this.conversationModel.findById(conversationObjectId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.type !== ConversationType.GROUP) {
      throw new BadRequestException('This is not a group conversation');
    }

    const isParticipant = conversation.participants.some((p) =>
      p.equals(userObjectId),
    );

    if (!isParticipant) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }

    if (conversation.admin.equals(userObjectId)) {
      const otherParticipants = conversation.participants.filter(
        (p) => !p.equals(userObjectId),
      );

      if (otherParticipants.length === 0) {
        await this.conversationModel.findByIdAndDelete(conversationObjectId);
        return { message: 'Group deleted as you were the last member' };
      }

      conversation.admin =
        otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
      this.logger.log(`New admin assigned: ${conversation.admin}`);
    }

    conversation.participants = conversation.participants.filter(
      (p) => !p.equals(userObjectId),
    );
    await conversation.save();

    return { message: 'You have left the group' };
  }

  async deleteGroup(
    conversationId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const userObjectId = new Types.ObjectId(userId);
    const conversationObjectId = new Types.ObjectId(conversationId);

    const conversation =
      await this.conversationModel.findById(conversationObjectId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.type !== ConversationType.GROUP) {
      throw new BadRequestException('This is not a group conversation');
    }

    if (!conversation.admin.equals(userObjectId)) {
      throw new ForbiddenException('Only admin can delete group');
    }

    await this.conversationModel.findByIdAndDelete(conversationObjectId);

    await this.messageModel.deleteMany({ conversation: conversationObjectId });

    return { message: 'Group deleted successfully' };
  }

  async demoteAdmin(
    conversationId: string,
    userId: string,
    newAdminId: string,
  ): Promise<ChatConversation> {
    const userObjectId = new Types.ObjectId(userId);
    const newAdminObjectId = new Types.ObjectId(newAdminId);
    const conversationObjectId = new Types.ObjectId(conversationId);

    const conversation =
      await this.conversationModel.findById(conversationObjectId);

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.type !== ConversationType.GROUP) {
      throw new BadRequestException('This is not a group conversation');
    }

    if (!conversation.admin.equals(userObjectId)) {
      throw new ForbiddenException('Only admin can demote themselves');
    }

    const isNewAdminMember = conversation.participants.some((p) =>
      p.equals(newAdminObjectId),
    );

    if (!isNewAdminMember) {
      throw new BadRequestException('New admin must be a group member');
    }

    conversation.admin = newAdminObjectId;
    await conversation.save();

    return conversation.populate('participants', 'name email profile');
  }

  async deleteMessage(
    conversationId: string,
    messageId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const userObjectId = new Types.ObjectId(userId);
    const conversationObjectId = new Types.ObjectId(conversationId);
    const messageObjectId = new Types.ObjectId(messageId);

    const conversation =
      await this.conversationModel.findById(conversationObjectId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const message = await this.messageModel.findById(messageObjectId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    const isParticipant = conversation.participants.some((p) =>
      p.equals(userObjectId),
    );

    if (!isParticipant) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }

    const isOwner = message.sender.equals(userObjectId);
    const isAdmin =
      conversation.type === ConversationType.GROUP &&
      conversation.admin.equals(userObjectId);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'Only message owner or group admin can delete this message',
      );
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.deletedBy = userObjectId;
    await message.save();

    return { message: 'Message deleted successfully' };
  }

  async recallMessage(
    conversationId: string,
    messageId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const userObjectId = new Types.ObjectId(userId);
    const conversationObjectId = new Types.ObjectId(conversationId);
    const messageObjectId = new Types.ObjectId(messageId);

    const conversation =
      await this.conversationModel.findById(conversationObjectId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const message = await this.messageModel.findById(messageObjectId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (!message.sender.equals(userObjectId)) {
      throw new ForbiddenException(
        'Only message owner can recall this message',
      );
    }

    message.content = 'Message recalled';
    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    return { message: 'Message recalled successfully' };
  }
}
