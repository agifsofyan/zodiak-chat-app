import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { About, AboutSchema } from './schemas/about.schema';
import { Interest, InterestSchema } from './schemas/interest.schema';
import { MinioModule } from 'src/minio/minio.module';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: About.name, schema: AboutSchema },
      { name: Interest.name, schema: InterestSchema },
      { name: User.name, schema: UserSchema }
    ]),
    UserModule,
    MinioModule,
  ],
  providers: [ProfileService],
  controllers: [ProfileController],
  exports: [ProfileService],
})
export class ProfileModule {}
