import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { IUser } from './interfaces/user.interface';
import { UserRegisterDTO } from './dto/user-register.dto';
import { UserLoginDTO } from './dto/user-login.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<IUser>,
        private readonly authService: AuthService
    ) {}

    async create(input: UserRegisterDTO) {
        // Check if user email is already exist
        const isEmailExist = await this.userModel.findOne({ email: input.email });
        if (isEmailExist) {
            throw new BadRequestException('The email you\'ve entered is already exist.');
        }
        
        let user = new this.userModel(input);
        await user.save();

        var users = user.toObject();
        delete users.password
        delete user.createdAt
        delete user.updatedAt

        return {
            user: users,
            accessToken: await this.authService.createAccessToken(user._id)
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
        delete user.createdAt
        delete user.updatedAt

        return {
            user,
            accessToken: await this.authService.createAccessToken(user._id)
        }
    }
}
