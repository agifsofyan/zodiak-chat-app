import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { MinioService } from '../minio/minio.service';

const mockUserData = {
  _id: new Types.ObjectId('68fa322e3a63c2e264189aa8'),
  name: 'sample',
  email: 'sample2@gmail.com',
  profile: new Types.ObjectId('68fa32d3168ed992f594bc4f'),
  last_login: '2025-10-30T09:00:08.143Z',
  createdAt: '2025-10-23T13:48:30.168Z',
  updatedAt: '2025-10-30T09:00:08.146Z'
}

const mockProfileData = {
  "_id":  new Types.ObjectId("68fa32d3168ed992f594bc4f"),
  "birthday": "1995-01-15T00:00:00.000Z",
  "gender": "male",
  "height": 175,
  "interest": [
    "sport",
    "movie",
    "traveling"
  ],
  "weight": 45,
  "avatar": "http://localhost:9100/zodiac-chat/avatar/1761322563912-image.png"
}

const mockUserPopulateData = {
  ...mockUserData,
  "profile": mockProfileData
}

const mockQueryWithPopulate = (result) => ({
  populate: jest.fn().mockResolvedValue({
    ...result,
    toObject: jest.fn().mockReturnValue(result)
  }),
});

const mockQueryWithExecPopulate = (result) => ({
  populate: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({
      ...result,
      toObject: jest.fn().mockReturnValue(result)
    })
  }),
});

const createMockModel = (overrides = {}) => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  ...overrides,
});

  
const mockUserModel = createMockModel({
  findById: jest.fn().mockReturnValue(mockQueryWithPopulate(mockUserPopulateData)),
  findByIdAndUpdate: jest.fn().mockReturnValue(mockQueryWithExecPopulate(mockUserPopulateData)),
});

const mockProfileModel = createMockModel({
  findOne: jest.fn().mockResolvedValue(mockProfileData),
  findOneAndUpdate: jest.fn().mockResolvedValue(mockProfileData),
});

const mockFile = {
  originalname: 'profile.png',
  mimetype: 'image/png',
  buffer: Buffer.from('dummy_data'),
  size: 1024,
} as Express.Multer.File;

const mockMinioService = {
  uploadAndOverwriteFile: jest.fn(),
  deleteFile: jest.fn()
}

describe('ProfileService', () => {
  let profileService: ProfileService;
  let userModel: any;
  let profileModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: MinioService, useValue: mockMinioService },
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: getModelToken('Profile'), useValue: mockProfileModel },
      ],
    }).compile();

    profileService = module.get<ProfileService>(ProfileService);
    userModel = module.get<Model<any>>(getModelToken('User'));
    profileModel = module.get<Model<any>>(getModelToken('Profile'));

    jest.clearAllMocks();
  });

  describe('whoAmi', () => {
    it('Get the data of the currently logged in user', async () => {
      const result = await profileService.whoAmI(mockUserData)
      
      expect(userModel.findById).toHaveBeenCalledWith(mockUserData._id);
      expect(result).toEqual(mockUserPopulateData);
    });
  })

  describe('syncUser', () => {
    it('Synchronize profile data (id) in user', async () => {
      const result = await profileService.syncUser(mockUserData._id, mockProfileData._id)
      
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(mockUserData._id, { profile: mockProfileData._id }, { new: true });
      expect(result).toEqual(mockUserPopulateData);
    });
  })

  describe('addOrChangeProfile', () => {
    it('Create or Update the profile data successfully', async () => {
      // Arrange
      const input = {
        "gender": "male",
        "birthday": "1995-01-15T00:00:00.000Z",
        "height": 175,
        "weight": 45,
        "interest": ["sport", "movie", "traveling", "game"]
      }

      const syncUser = jest.spyOn(profileService, 'syncUser').mockResolvedValue(mockUserPopulateData as any);

      // Act
      const result = await profileService.addOrChangeProfile(mockUserData, input)
      
      // Assert
      expect(profileModel.findOneAndUpdate).toHaveBeenCalledWith(
        { user: mockUserData._id },
        { $set: input },
        { upsert: true, new: true }
      );
      expect(syncUser).toHaveBeenCalledWith(mockUserData._id, mockProfileData._id);
      expect(result).toEqual(mockUserPopulateData);
    });

    it('should throw error if (create or update) fails', async () => {
      // Arrange
      const input = {
        "gender": "male",
        "birthday": "1995-01-15T00:00:00.000Z",
        "height": 175,
        "weight": 45,
        "interest": ["sport", "movie", "traveling", "game"]
      }

      const syncUser = jest.spyOn(profileService, 'syncUser').mockResolvedValue(mockUserPopulateData as any);

      profileModel.findOneAndUpdate.mockRejectedValue(new Error('Upload failed'));
      
      // Act to Rejects
      await expect(profileService.addOrChangeProfile(mockUserData, input)).rejects.toThrow('Upload failed');
      
      // Assert
      expect(profileModel.findOneAndUpdate).toHaveBeenCalledWith(
        { user: mockUserData._id },
        { $set: input },
        { upsert: true, new: true }
      );
      expect(syncUser).not.toHaveBeenCalled();
    })
  })

  describe('updateAvatar', () => {
    it('should update avatar successfully', async () => {
      // Arrange
      const mockAvatarUrl = 'http://localhost:9100/avatar/test.png';
      const saveMock = jest.fn().mockResolvedValue(true);

      profileModel.findOne.mockResolvedValue({...mockProfileData, save: saveMock});
      mockMinioService.uploadAndOverwriteFile.mockResolvedValue(mockAvatarUrl);
      const syncUserMock = jest.spyOn(profileService, 'syncUser').mockResolvedValue(mockUserPopulateData as any);

      // Act
      const result = await profileService.updateAvatar(mockUserData, mockFile);

      // Assert
      expect(mockMinioService.uploadAndOverwriteFile).toHaveBeenCalledWith(
        mockFile,
        mockProfileData.avatar,
        'avatar',
      );
      expect(saveMock).toHaveBeenCalled();
      expect(syncUserMock).toHaveBeenCalledWith(mockUserData._id, mockProfileData._id);
      expect(result).toEqual(mockUserPopulateData);
    });

    it('should throw error if upload fails', async () => {
      // Arrange
      // (profileModel.findOne as jest.Mock).mockResolvedValue(mockUserData);
      profileModel.findOne.mockResolvedValue(mockUserData);
      // (minioService.uploadAndOverwriteFile as jest.Mock).mockRejectedValue(new Error('Upload failed'))
      mockMinioService.uploadAndOverwriteFile.mockRejectedValue(new Error('Upload failed'))
      
      // Act to Rejects
      await expect(profileService.updateAvatar(mockUserData, mockFile)).rejects.toThrow('Upload failed');
      
      // Assert
      expect(profileModel.findOne).toHaveBeenCalledWith({ user: mockUserData._id });
      expect(mockMinioService.uploadAndOverwriteFile).toHaveBeenCalledTimes(1);
    })
  })
});
