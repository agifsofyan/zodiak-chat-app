import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IProfile } from './interfaces/profile.interface';
import { MinioService } from 'src/minio/minio.service';
import { IUser } from 'src/user/interfaces/user.interface';
import { IInterest } from './interfaces/interest.interface';

@Injectable()
export class ProfileService {
    constructor(
        @InjectModel('Profile') private readonly profileModel: Model<IProfile>,
        @InjectModel('Interest') private readonly interestModel: Model<IInterest>,
        @InjectModel('User') private readonly userModel: Model<IUser>,
        private readonly minioService: MinioService,
    ) { }

    async whoAmI(user: any) {
        let userQuery = await this.userModel.findById(user._id)
            .populate('profile', ['_id', 'avatar', 'gender', 'birthday', 'horoscope', 'zodiac', 'height', 'weight'])
            .populate('interest', ['_id', 'tags']);

        let displayedUser = userQuery.toObject()
        delete displayedUser.password
        
        return displayedUser
    }

    async syncUser(userId: Types.ObjectId, type?: string, typeId?: any) {
        let data = {}

        if (type && typeId) data[type] = typeId

        var user = await this.userModel.findByIdAndUpdate(userId, data, { new: true })
            .populate('profile', ['_id', 'avatar', 'gender', 'birthday', 'horoscope', 'zodiac', 'height', 'weight'])
            .populate('interest', ['_id', 'tags'])
            .exec()
        
        let displayedUser = user.toObject()
        delete displayedUser.password
        
        return displayedUser
    }
    
    async addOrChangeAbout(user: any, input: any) {
        try {
            let profile = await this.profileModel.findOneAndUpdate(
                { user: user._id },
                { $set: input },
                { upsert: true, new: true }
            );

            let displayedUser = await this.syncUser(user._id, 'profile', profile._id)
            
            return displayedUser
		} catch (error) {
			throw new Error(error)
		}
    }
    
    async updateAvatar(userId: Types.ObjectId, file: Express.Multer.File) {
        if (!file) throw new Error('File not uploaded');

        let avatarUrl = ''

        let me = await this.profileModel.findOne({ user: userId })
        if (me) {
            let oldFileName = null
            
            if (me['avatar'] != "" && me['avatar'] != null && me['avatar'] != undefined) {
                oldFileName = me['avatar'].split('/').pop();
            }
        
            try {
                avatarUrl = await this.minioService.uploadAndOverwriteExistingFile(file, oldFileName);
            } catch (err) {
                throw new Error(err.message);
            }
        }

        try {
            let profile = await this.profileModel.findOneAndUpdate(
                { user: userId },
                { avatar: avatarUrl },
                { upsert: true, new: true },
            );
    
            let displayedUser = await this.syncUser(userId, 'profile', profile._id)
    
            return displayedUser
        } catch (error) {
            throw new Error(error)
        }
    }

    async addOrChangeInterest(user: any, input: any) {
        try {
            let interest = await this.interestModel.findOneAndUpdate(
                { user: user._id },
                { $set: input },
                { upsert: true, new: true }
            );

            let displayedUser = await this.syncUser(user._id, 'interest', interest._id, )
            
            return displayedUser
        } catch (error) {
            throw new Error(error)
        }
    }
}
