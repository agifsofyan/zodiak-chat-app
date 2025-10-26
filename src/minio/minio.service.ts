import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { isEmpty, getFileName, getFileUrl } from '../../util/common.util';

@Injectable()
export class MinioService implements OnModuleInit {
    private minioClient: Minio.Client;
    private bucketName: string;

    constructor(private readonly configService: ConfigService) {}

    async onModuleInit() {
        this.minioClient = new Minio.Client({
            endPoint: this.configService.get<string>('MINIO_ENDPOINT'),
            port: Number(this.configService.get<number>('MINIO_PORT')),
            useSSL: this.configService.get<boolean>('MINIO_USE_SSL'),
            accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
            secretKey: this.configService.get<string>('MINIO_SECRET_KEY'),
            region: this.configService.get<string>('MINIO_REGION') || 'us-east-1',
        });

        this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME');

        try {
            const exists = await this.minioClient.bucketExists(this.bucketName);
            if (!exists) {
                await this.minioClient.makeBucket(this.bucketName, this.minioClient.region);
                console.log(`Bucket "${this.bucketName}" created`);
            }
        } catch (err) {
            console.error('Error checking/creating bucket:', err);
        }
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'avatar'): Promise<string> {
        const fileName = `${Date.now()}-${file.originalname}`;
        const objectName = `${folder}/${fileName}`
        const metaData = { 'Content-Type': file.mimetype };

        await this.minioClient.putObject(
            this.bucketName,
            objectName,
            file.buffer,
            file.size,
            metaData
        );

        const url = getFileUrl(
            this.configService.get('MINIO_ENDPOINT'),
            this.configService.get('MINIO_PORT'),
            this.bucketName,
            objectName,
            this.configService.get('MINIO_USE_SSL')
        );

        return url;
    }
    
    async deleteFile(fileUrl: string|null) {
        try {
            if (!isEmpty(fileUrl)) {
                const objectName = getFileName(fileUrl);
                await this.minioClient.removeObject(this.bucketName, objectName);
            }
        } catch (err) {
            console.warn("Can't delete old avatar:", err.message);
        }
    }

    async uploadAndOverwriteFile(file: Express.Multer.File, fileUrl: string|null, folder: string = 'avatar'): Promise<string> {
        try {
            await this.deleteFile(fileUrl);
            
            return await this.uploadFile(file, folder)
        } catch (err) {
            console.warn("Can't change file:", err.message);
        }
    }
}
