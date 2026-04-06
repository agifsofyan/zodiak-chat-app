import { Types } from 'mongoose';

export enum ConversationType {
  PRIVATE = 'private',
  GROUP = 'group',
}

export interface IConversation {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  type: ConversationType;
  groupName?: string;
  admin?: Types.ObjectId;
  lastMessage?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  _id: Types.ObjectId;
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'file';
  isRead: boolean;
  readAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatUser {
  _id: string;
  name: string;
  email: string;
  profile?: {
    _id: string;
    avatar?: string;
    horoscope?: string;
    zodiac?: string;
  };
}

export interface IWSSendMessagePayload {
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'file';
}

export interface IWSJoinPayload {
  conversationId: string;
}

export interface IWSReadPayload {
  conversationId: string;
  messageId: string;
}

export interface IWSTypingPayload {
  conversationId: string;
  isTyping: boolean;
}

export interface IWSGroupMessagePayload {
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'file';
}
