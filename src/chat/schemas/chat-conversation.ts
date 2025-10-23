import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true, versionKey: false })
export class ChatConversation extends Document {
  // Two users involved
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  participants: Types.ObjectId[];

  // Last message cache
  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage?: Types.ObjectId;
}

export const ConversationSchema = SchemaFactory.createForClass(ChatConversation);
export type ConversationDocument = HydratedDocument<ChatConversation>;
