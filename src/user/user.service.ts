import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import normalize from 'normalize-url';
import * as gravatar from 'gravatar';
import * as mongoose from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { IUser } from './interfaces/user/user.interface';
import { UserRegisterDTO } from './dto/user-register.dto';
import { UserLoginDTO } from './dto/user-login.dto';

const ObjectId = mongoose.Types.ObjectId;

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<IUser>,
        private readonly authService: AuthService
    ) {}

    async create(userRegisterDTO: UserRegisterDTO) {
        let user = new this.userModel(userRegisterDTO);

        // Check if user email is already exist
        const isEmailExist = await this.userModel.findOne({ email: user.email });
        if (isEmailExist) {
            throw new BadRequestException('The email you\'ve entered is already exist.');
        }

        const avatar = normalize(
            gravatar.url(user.email, {
              s: '200',
              r: 'pg',
              d: 'mm'
            }),
            { forceHttps: true }
        );
        
        user.avatar = avatar;
        await user.save();

        var users = user.toObject();
        delete users.password
        delete users.created_at
        delete users.updated_at

        return {
            user: users,
            accessToken: await this.authService.createAccessToken(user._id),
            // verification: verification
        }
    }

    async login(userLoginDTO: UserLoginDTO) {
        const { email } = userLoginDTO;

        let query = await this.userModel.findOne({ email });
        if (!query) {
            throw new NotFoundException('The email you\'ve entered does not exist.');
        }

        // Verify password
        const match = await bcrypt.compare(userLoginDTO.password, query.password);
        if (!match) {
            throw new BadRequestException('The password you\'ve entered is incorrect.');
        }

        var user = query.toObject()
        delete user.password
        delete user.created_at
        delete user.updated_at

        return {
            user,
            accessToken: await this.authService.createAccessToken(user._id)
        }
    }

    async whoAmI(user: any) {
        console.log(user)
        const query = await this.userModel.findOne({_id: user._id});

        var users = query.toObject()
        delete users.password
        delete users.created_at
        delete users.updated_at
        delete users.__v
        
        return user
    }

    async checkAccount(email: string) {
        if(!email){
            throw new BadRequestException('The email is required')
        }

        const query = await this.userModel.findOne({'email': email})

        if(!query){
            throw new NotFoundException(`${email} based accounts were not found`)
        }

        var user = query.toObject()
        delete user.password
        delete user.created_at
        delete user.updated_at

        return user
    }
}
