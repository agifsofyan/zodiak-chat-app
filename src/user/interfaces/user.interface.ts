import { Document } from 'mongoose'
import { IAbout } from 'src/profile/interfaces/about.interface'
import { IInterest } from 'src/profile/interfaces/interest.interface'

export interface IUser extends Document {
    _id: any
    name: string
    email: string
    password: string
    last_login: Date
    About: IAbout;
    interest: IInterest;
}
