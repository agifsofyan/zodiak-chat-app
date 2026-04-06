import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export enum ConversationType {
  PRIVATE = 'private',
  GROUP = 'group',
}

@Schema({ timestamps: true, versionKey: false })
export class ChatConversation extends Document {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  participants: Types.ObjectId[];

  @Prop({
    type: String,
    enum: ConversationType,
    default: ConversationType.PRIVATE,
  })
  type: ConversationType;

  @Prop({ type: String, default: null })
  groupName: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  admin: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Message', default: null })
  lastMessage?: Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const ConversationSchema =
  SchemaFactory.createForClass(ChatConversation);
export type ConversationDocument = HydratedDocument<ChatConversation>;
