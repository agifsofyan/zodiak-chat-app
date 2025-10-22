import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
    private minioClient: Minio.Client;
    private bucketName: string;

    constructor(private readonly configService: ConfigService) {}

    async onModuleInit() {
        this.minioClient = new Minio.Client({
            endPoint: this.configService.get<string>('MINIO_ENDPOINT'),
            port: Number(this.configService.get<number>('MINIO_PORT')),
            useSSL: Boolean(this.configService.get<boolean>('MINIO_USE_SSL')),
            accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
            secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
        });

        this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME');

        try {
            const exists = await this.minioClient.bucketExists(this.bucketName);
            if (!exists) {
            await this.minioClient.makeBucket(this.bucketName, this.configService.get<string>('MINIO_REGION'));
                console.log(`✅ Bucket "${this.bucketName}" created`);
            } else {
                console.log(`ℹ️ Bucket "${this.bucketName}" already exists`);
            }
        } catch (err) {
            console.error('❌ Error checking/creating bucket:', err);
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const fileName = `${Date.now()}-${file.originalname}`;
        
        const metaData = { 'Content-Type': file.mimetype };

        await this.minioClient.putObject(
            this.bucketName,
            fileName,
            file.buffer,
            file.size,
            metaData
        );

        const url = `${this.configService.get('MINIO_USE_SSL') ? 'https' : 'http'}://${this.configService.get('MINIO_ENDPOINT')}:${this.configService.get('MINIO_PORT')}/${this.bucketName}/${fileName}`;

        return url;
    }
    
    async deleteFile(oldFileName: string) {
        try {
            await this.minioClient.removeObject(this.bucketName, oldFileName);
        } catch (err) {
            console.warn("⚠️ Can't delete old avatar:", err.message);
        }
    }

    async uploadAndOverwriteExistingFile(file: Express.Multer.File, oldFileName?: string): Promise<string> {
        try {
            if (oldFileName) await this.deleteFile(oldFileName);
            
            return await this.uploadFile(file)
        } catch (err) {
            console.warn("⚠️ Can't change file:", err.message);
        }
    }
}
