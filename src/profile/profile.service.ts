import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MinioService } from 'src/minio/minio.service';
import { IUser } from 'src/user/interfaces/user.interface';
import { IProfile } from './interfaces/profile.interface';

@Injectable()
export class ProfileService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<IUser>,
        @InjectModel('Profile') private readonly profileModel: Model<IProfile>,
        private readonly minioService: MinioService,
    ) { }

    async whoAmI(user: any) {
        let userQuery = await this.userModel.findById(user._id)
            .populate('profile', ['_id', 'avatar', 'gender', 'birthday', 'horoscope', 'zodiac', 'height', 'weight', 'interest'])

        let displayedUser = userQuery.toObject()
        delete displayedUser.password
        
        return displayedUser
    }

    async syncUser(userId: Types.ObjectId, profileId?: any) {
        var user = await this.userModel.findByIdAndUpdate(userId, { profile: profileId }, { new: true })
            .populate('profile', ['_id', 'avatar', 'gender', 'birthday', 'horoscope', 'zodiac', 'height', 'weight', 'interest'])
            .exec()
        
        let displayedUser = user.toObject()
        delete displayedUser.password
        
        return displayedUser
    }
    
    async addOrChangeProfile(user: any, input: any) {
        try {
            let profile = await this.profileModel.findOneAndUpdate(
                { user: user._id },
                { $set: input },
                { upsert: true, new: true }
            );

            let displayedUser = await this.syncUser(user._id, profile._id)
            
            return displayedUser
		} catch (error) {
			throw new Error(error.message)
		}
    }
    
    async updateAvatar(user: any, file: Express.Multer.File) {
        const userId = user._id

        let avatarUrl = ''

        let profile = await this.profileModel.findOne({ user: userId })
        if (profile) {
            try {
                avatarUrl = await this.minioService.uploadAndOverwriteFile(file, profile.avatar, 'avatar');
            } catch (err) {
                throw new Error(err.message);
            }
        }

        try {
            profile.avatar = avatarUrl
            await profile.save()
    
            let displayedUser = await this.syncUser(userId, profile._id)
    
            return displayedUser
        } catch (error) {
            throw new Error(error.message)
        }
    }

    async deleteAvatar(user: any) {
        const userId = user._id

        let profile = await this.profileModel.findOne({ user: userId })
        if (profile) {
            try {
                await this.minioService.deleteFile(profile.avatar);
            } catch (err) {
                throw new Error(err.message);
            }
        }

        try {
            profile.avatar = null
            await profile.save()

            let displayedUser = await this.syncUser(userId, profile._id)
    
            return displayedUser
        } catch (error) {
            throw new Error(error.message)
        }
    }
}
