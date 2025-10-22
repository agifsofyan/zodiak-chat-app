import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MinioService } from 'src/minio/minio.service';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  imports: [
    AuthModule,
    MinioModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
