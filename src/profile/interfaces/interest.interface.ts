import { Document } from 'mongoose'
import { IUser } from 'src/user/interfaces/user.interface';

export interface IInterest extends Document {
    user: IUser;
    tags: [String]
}
