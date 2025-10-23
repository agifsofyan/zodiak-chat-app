import { Document } from 'mongoose'
import { IInterest } from 'src/profile/interfaces/interest.interface'
import { IProfile } from 'src/profile/interfaces/profile.interface'

export interface IUser extends Document {
    _id: any
    name: string
    email: string
    password: string
    last_login: Date
    profile: IProfile;
    interest: IInterest;
}
