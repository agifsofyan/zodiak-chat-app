import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CONFIG_DB_CONNECTION } from 'config/db.config';
import { CONFIG_ENV } from 'config/configuration';
import { MinioModule } from './minio/minio.module';
import { ProfileModule } from './profile/profile.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    /**
     * 🔹 CONFIG MODULE
     * Memuat semua variabel dari .env dan memvalidasinya
     */
    // Start Config
    CONFIG_ENV,
    CONFIG_DB_CONNECTION,
    // End Config

    AuthModule,
    UserModule,
    MinioModule,
    ProfileModule,
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
  
export class AppModule {}
