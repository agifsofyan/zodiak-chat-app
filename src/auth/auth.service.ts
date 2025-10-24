import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import * as Cryptr from 'cryptr';
import { IUser } from '../user/interfaces/user.interface';
import { JwtPayload } from './inrerfaces/jwt-payload/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    private cryptr: Cryptr;

    constructor(
        private configService: ConfigService,
        @InjectModel('User') private readonly userModel: Model<IUser>
    ) {
        const encryptKey = this.configService.get<string>('JWT_ENCRYPT_SECRET_KEY') || 'EN123456';
        this.cryptr = new Cryptr(encryptKey);
    }

    async createAccessToken(userId: string) {
        const accessToken = jwt.sign(
            { sub: userId },
            this.configService.get<string>('JWT_SECRET_KEY') as jwt.Secret,
            { expiresIn: this.configService.get<string>('JWT_EXPIRATION', '1D') as jwt.SignOptions['expiresIn']},
        );

        return this.encryptData(accessToken);
    }

    async validate(jwtPayload: JwtPayload) {
        let user = await this.userModel.findOne({ _id: jwtPayload.sub });
        
        if (!user) {
            throw new UnauthorizedException('auth.service');
        }

        user.last_login = new Date()
        await user.save()

        var result = user.toObject()
        delete result.password

        return result;
    }

    private jwtExtractor = (req: Request) => {
        let token = null;

        if (req.header('x-auth-token')) {
            token = req.header('x-auth-token');
        } else if(req.headers.authorization) {
            if(req.headers.authorization.search('Bearer') === -1){
                throw new BadRequestException('Invalid Header Authorization Format.');
            }

            token = req.headers.authorization.replace('Bearer ', '').replace(' ', '');
        }

        if (!token) {
            throw new UnauthorizedException('Unauthorized')
        }

        try {
            token = this.decryptData(token);
        } catch (err) {
            throw new BadRequestException('Invalid token authentication.');
        }
        
        return token;
    }

    private encryptData(data: string): string {
        return this.cryptr.encrypt(data);
    }

    private decryptData(data: string): string {
        return this.cryptr.decrypt(data);
    }

    returnJwtExtractor = () => this.jwtExtractor
}
