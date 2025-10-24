const bucketName = 'test-bucket'
const minioSsl = false
const mockBucketExists = jest.fn().mockResolvedValue(true);
const mockMakeBucket = jest.fn().mockResolvedValue(bucketName);
const mockPutObject = jest.fn().mockResolvedValue({ etag: 'mockedEtag' });

jest.mock('minio', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      bucketExists: mockBucketExists,
      makeBucket: mockMakeBucket,
      putObject: mockPutObject,
    })),
  };
});


import { Test, TestingModule } from '@nestjs/testing';
import { MinioService } from './minio.service';
import { ConfigService } from '@nestjs/config';
import { getFileUrl } from '../../util/common.util';

describe('MinioService', () => {
  let service: MinioService;
  let configMock: any

  beforeEach(async () => {
    configMock = {
      get: jest.fn((key: string) => {
        const config = {
          MINIO_ENDPOINT: 'localhost',
          MINIO_PORT: '9000',
          MINIO_USE_SSL: minioSsl,
          MINIO_ACCESS_KEY: 'test-access',
          MINIO_SECRET_KEY: 'test-secret',
          MINIO_BUCKET_NAME: bucketName,
        };
        
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinioService,
        { provide: ConfigService, useValue: configMock },
      ]
    }).compile();

    service = module.get<MinioService>(MinioService);

    await service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload a file and return the correct URL', async () => {
      const mockFile = {
        originalname: 'profile.png',
        mimetype: 'image/png',
        buffer: Buffer.from('dummy_data'),
        size: 1024,
      } as Express.Multer.File;
      
      const folder = 'avatar'
      const fileName = `${Date.now()}-${mockFile.originalname}`;
      const objectName = `${folder}/${fileName}`
      
      const result = await service.uploadFile(mockFile, folder);

      const url = getFileUrl(configMock.get('MINIO_ENDPOINT'), configMock.get('MINIO_PORT'), bucketName, objectName, configMock.get('MINIO_USE_SSL'));
      
      expect(result).toEqual(url)
    });
  });

  describe('deleteFile', () => {
    it('should delete file', async () => {
        
    });
  });

  describe('uploadAndOverwriteFile', () => {
    it('should upload and overwrite existing file', async () => {
        
    });
  });
});
