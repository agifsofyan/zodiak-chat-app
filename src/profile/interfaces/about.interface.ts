import { Document } from 'mongoose'
import { IUser } from 'src/user/interfaces/user.interface';

export interface IAbout extends Document {
    user: IUser;
    avatar?: String
    gender?: String
    birthday?: Date
    horoscope?: String
    zodiac?: String
    height?: Number
    weight?: Number
}
