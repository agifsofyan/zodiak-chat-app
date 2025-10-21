import { Document } from 'mongoose';

export interface IUser extends Document {
    _id: any;
    name: string;
    email: string;
    password: string;
    avatar: string;
    last_login: Date;
    birthday: Date;
    horoscope: string;
    zodiac: string;
    height: number;
    weight: number;
    created_at: Date;
    updated_at: Date;
}
