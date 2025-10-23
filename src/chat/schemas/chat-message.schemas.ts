import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, Types } from "mongoose";

@Schema({ timestamps: true, versionKey: false })
export class ChatMessage extends Document {
    @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
    conversation: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    sender: Types.ObjectId;

    @Prop({ type: String, required: true })
    content: string;

    @Prop({ type: String, enum: ['text', 'image', 'file'], default: 'text' })
    type: string;

    @Prop({ default: false })
    isRead: boolean;

    @Prop({ type: Date })
    readAt?: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
export type ChatMessageDocument = HydratedDocument<ChatMessage>;