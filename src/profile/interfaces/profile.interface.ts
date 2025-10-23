import { Document } from 'mongoose'
import { IUser } from 'src/user/interfaces/user.interface';

export interface IProfile extends Document {
    user: IUser;
    avatar?: string
    gender?: string
    birthday?: Date
    horoscope?: string
    zodiac?: string
    height?: number
    weight?: number
    interest?: [string]
}
