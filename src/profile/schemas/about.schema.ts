import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, Types } from "mongoose";
import { Gender } from "../dto/enum-gender.dto";
import { getHoroscopeFromDate } from "util/horoscope.util";
import { getChineseZodiacFromDate } from "util/zodiac.util";
import { User } from "src/user/schemas/user.schema";

@Schema({ timestamps: true, versionKey: false })
export class About extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: User | Types.ObjectId;

    @Prop({ default: null })
    avatar: string;

    @Prop({ enum: Gender, default: Gender.MALE })
    gender: Gender;
    
    @Prop({ type: Date, default: null })
    birthday: Date;

    @Prop()
    horoscope: string;

    @Prop()
    zodiac: string;

    @Prop({ default: 0 })
    height: number;

    @Prop({ default: 0 })
    weight: number;
}

export const AboutSchema = SchemaFactory.createForClass(About);
export type AboutDocument = HydratedDocument<About>;

AboutSchema.pre('findOneAndUpdate', function (next) {
    const update: any = this.getUpdate();

    // Jika field birthday ada di update
    if (update.birthday && !update.horoscope) {
        const date = new Date(update.birthday);
        const horoscope = getHoroscopeFromDate(date);

        // Jika kamu memakai format `$set`, tangani juga itu
        if (update.$set) {
            update.$set.horoscope = horoscope;
        } else {
            update.horoscope = horoscope;
        }
    }
    
    if (update.birthday && !update.zodiac) {
        const date = new Date(update.birthday);
        const zodiac = getChineseZodiacFromDate(date);

        // Jika kamu memakai format `$set`, tangani juga itu
        if (update.$set) {
            update.$set.zodiac = zodiac;
        } else {
            update.zodiac = zodiac;
        }
    }

    next();
});

AboutSchema.pre('save', function (next) {
    if (this.isModified('birthday') && this.birthday && !this.horoscope) {
        this.horoscope = getHoroscopeFromDate(this.birthday);
    }

    if (this.isModified('birthday') && this.birthday && !this.zodiac) {
        this.zodiac = getChineseZodiacFromDate(this.birthday);
    }

    next();
});