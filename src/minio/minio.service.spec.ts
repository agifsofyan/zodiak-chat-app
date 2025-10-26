import { Test, TestingModule } from '@nestjs/testing';
import { MinioService } from './minio.service';
import { ConfigService } from '@nestjs/config';

const mockEndpoint = 'localhost';
const mockPort = 9000;
const mockBucketName = 'test-bucket';
const mockRegion = 'south-east-1';
const mockSsl = false;
const mockTimestamp = 1761474403813;

const mockBucketExists = jest.fn().mockReturnValue(false);
const mockMakeBucket = jest.fn().mockReturnValue(undefined);
const mockPutObject = jest.fn();
const mockRemoveObject = jest.fn().mockReturnValue(undefined);
const mockGetUrl = (endpoint, port, bucket, name, isSsl = false) => `${isSsl ? 'https' : 'http'}://${endpoint}:${port}/${bucket}/${name}`

jest.mock('minio', () => {
  return {
    Client: jest.fn().mockImplementation(() => ({
      region: mockRegion,
      bucketExists: mockBucketExists,
      makeBucket: mockMakeBucket,
      putObject: mockPutObject,
      removeObject: mockRemoveObject
    })),
  };
});

beforeAll(() => {
  jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('MinioService', () => {
  let service: MinioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MinioService,
        {
          provide: ConfigService, useValue: {
            get: jest.fn((key: string) => {
              const config = {
                MINIO_ENDPOINT: mockEndpoint,
                MINIO_PORT: mockPort,
                MINIO_USE_SSL: mockSsl,
                MINIO_ACCESS_KEY: 'test-access',
                MINIO_SECRET_KEY: 'test-secret',
                MINIO_BUCKET_NAME: mockBucketName,
                MINIO_REGION: mockRegion
              };
              
              return config[key];
            }),
        } },
      ]
    }).compile();

    service = module.get<MinioService>(MinioService);
  });

  describe('onModuleInit', () => {
    it('constructor before use minio service', async () => {
      mockBucketExists.mockReturnValue(false)
      mockMakeBucket.mockReturnValue(undefined)

      await service.onModuleInit()

      expect(mockBucketExists).toHaveBeenCalledWith(mockBucketName)
      expect(mockMakeBucket).toHaveBeenCalledWith(mockBucketName, mockRegion)
    })
  })

  describe('uploadFile', () => {
    it('should upload a file and return the correct URL', async () => {
      const mockFile = {
        originalname: 'profile.png',
        mimetype: 'image/png',
        buffer: Buffer.from('dummy_data'),
        size: 1024,
      } as Express.Multer.File;

      const folder = 'avatar'
      const fileName = `${mockTimestamp}-${mockFile.originalname}`;
      const objectName = `${folder}/${fileName}`

      await service.onModuleInit();
      const result = await service.uploadFile(mockFile, folder)
      
      expect(mockPutObject).toHaveBeenCalledWith(mockBucketName, objectName, mockFile.buffer, mockFile.size, { 'Content-Type': mockFile.mimetype });
      expect(result).toBe(mockGetUrl(mockEndpoint, mockPort, mockBucketName, objectName, mockSsl))
    });
  });

  describe('deleteFile', () => {
    it('have to delete files based on url', async () => {
      const folder = 'avatar'
      const fileName = `${mockTimestamp}-profile.png`;
      const objectName = `${folder}/${fileName}`
      
      await service.onModuleInit();
      
      const url = mockGetUrl(mockEndpoint, mockPort, mockBucketName, objectName, mockSsl);
      const result = await service.deleteFile(url)

      expect(mockRemoveObject).toHaveBeenCalledWith(mockBucketName, objectName);
      expect(result).toBeUndefined()
    });
  });

  describe('uploadAndOverwriteFile', () => {
    it('should upload and overwrite existing file', async () => {
      const mockFile = {
        originalname: 'profile2.jpg',
        mimetype: 'image/jpg',
        buffer: Buffer.from('dummy_data'),
        size: 1024,
      } as Express.Multer.File;

      await service.onModuleInit();

      const folder = 'avatar'
      const newFileName = `${mockTimestamp}-${mockFile.originalname}`;
      const oldFileName = `${mockTimestamp}-profile2.jpg`;
      const newObjectName = `${folder}/${newFileName}`
      const oldObjectName = `${folder}/${oldFileName}`
      
      const oldUrl = mockGetUrl(mockEndpoint, mockPort, mockBucketName, oldObjectName, mockSsl);
      const newUrl = mockGetUrl(mockEndpoint, mockPort, mockBucketName, newObjectName, mockSsl);
      
      const deleteSpy = jest.spyOn(service, 'deleteFile').mockResolvedValue(undefined);
      const uploadSpy = jest.spyOn(service, 'uploadFile').mockResolvedValue(newUrl);

      const result = await service.uploadAndOverwriteFile(mockFile, oldUrl, folder)
      
      expect(deleteSpy).toHaveBeenCalledWith(oldUrl);
      expect(uploadSpy).toHaveBeenCalledWith(mockFile, folder);
      expect(result).toBe(newUrl);
    });
  });
});
