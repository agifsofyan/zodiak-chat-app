import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UserSchema } from 'src/user/schemas/user.schema';
import { SessionSerializer } from './session.serializer';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
    ]),
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService): Promise<any> => ({
        secret: config.get<string>('JWT_ENCRYPT_SECRET_KEY') || 'EN123456',
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRATION') || '1D'
        },
      })
    })
  ],
  providers: [AuthService, JwtStrategy, SessionSerializer],
  exports: [MongooseModule, AuthService, PassportModule]
})
export class AuthModule {}
