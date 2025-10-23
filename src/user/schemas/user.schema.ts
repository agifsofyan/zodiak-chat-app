import * as bcrypt from 'bcrypt';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { Profile } from 'src/profile/schemas/profile.schema';
import { Interest } from 'src/profile/schemas/interest.schema';

@Schema({ timestamps: true, versionKey: false })
export class User extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email not valid'],
    })
    email: string;

    @Prop({ required: true, minLength: 8 })
    password: string;
    
    last_login: Date;

    @Prop({ type: Types.ObjectId, ref: 'Profile', default: null })
    profile: Profile | Types.ObjectId;

     @Prop({ type: Types.ObjectId, ref: 'Interest', default: null })
    interest: Interest | Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User>;

UserSchema.pre('save', async function (next) {  
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(this['password'], salt);
        this['password'] = hash;
        next();
    } catch (error) {
        next(error)
    }
});

UserSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    
    if (Array.isArray(update)) return next();

    // Pastikan ada field password di update
    if (update.password) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(update.password, salt);
        this.setUpdate({ ...update, password: hash });
    }

    next();
});
