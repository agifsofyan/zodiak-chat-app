import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, Types } from "mongoose";
import { User } from "src/user/schemas/user.schema";

@Schema({ timestamps: false, versionKey: false })
export class Interest extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: User | Types.ObjectId;

    @Prop({ default: [] })
    tags: [string];
}

export const InterestSchema = SchemaFactory.createForClass(Interest);
export type InterestDocument = HydratedDocument<Interest>;