import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

const mockAuthService = {
  createAccessToken: jest.fn()
}

const mockUserModel = {
  findOne: jest.fn(),
  prototype: {
    save: jest.fn(),
    toObject: jest.fn(),
  }
}

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<any>;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: getModelToken('User'), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<any>>(getModelToken('User'))
    authService = module.get<AuthService>(AuthService)

    jest.clearAllMocks();
  });
  
  const lastLogin = new Date('2025-10-26');

  describe('create (register)', () => {
    const mockRegisterInput = {
      email: 'test@example.com',
      password: 'password123',
      name: 'User Test 1',
    };
    
    const mockRegisterData = {
      _id: '68fa322e3a63c2e264189aa8',
      email: mockRegisterInput.email,
      password: '$2b$12$Dlx8HC/jrAHOVe74VMqQ.uoNaYRnsp8CNC/Dn2V2kpd8bd0vUHmKm', // password123
      name: 'User Test 1',
      last_login: lastLogin,
      createdAt: lastLogin,
      updatedAt: lastLogin,
    }
    
    const mockRegisterRecord = {
      ...mockRegisterData,
      save: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn().mockResolvedValue(null),
      toObject: jest.fn().mockReturnValue(mockRegisterData),
    };
    
    it('User already exist', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue({ email: mockRegisterInput.email });

      await expect(service.create(mockRegisterInput)).rejects.toThrow(BadRequestException);
      expect(userModel.findOne).toHaveBeenCalledWith({ email: mockRegisterInput.email });
    })

    it('Create Access Token', async () => {
      const mockFindOne = jest.fn().mockResolvedValue(null);
      const mockConstructor = jest.fn().mockImplementation(() => mockRegisterRecord);
      const userModelMock = Object.assign(mockConstructor, { findOne: mockFindOne });
      
      (service as any).userModel = userModelMock;
      
      (authService.createAccessToken as jest.Mock).mockResolvedValue('mockToken');

      const result = await service.create(mockRegisterInput);

      expect(mockFindOne).toHaveBeenCalledWith({ email: 'test@example.com' });      
      expect(mockRegisterRecord.save).toHaveBeenCalled();
      expect(result).toEqual({
        user: mockRegisterData,
        accessToken: 'mockToken',
      });
      expect(authService.createAccessToken).toHaveBeenCalledWith(mockRegisterData._id);
    })

  });
  
  describe('login', () => {
    const mockLoginInput = {
      email: 'test2@example.com',
      password: 'admin123',
      name: 'User Test 2',
    };

     const mockLoginData = {
      _id: '68fa322e3a63c2e264189aa9',
      email: mockLoginInput.email,
      password: '$2b$12$pRN3KbItkXH9Irb4jv86pepgErsRG0zpP/PYXGMd51ghgN453WHBW', // admin123
      name: 'User Test 2',
      last_login: lastLogin,
      createdAt: lastLogin,
      updatedAt: lastLogin,
     }
    
    const mockLoginRecord = {
      ...mockLoginData,
      save: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn().mockResolvedValue(null),
      toObject: jest.fn().mockReturnValue(mockLoginData),
    };
    
    it('User Not Found', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(null);
  
      delete mockLoginInput.name
  
      await expect(service.login(mockLoginInput)).rejects.toThrow(NotFoundException);
      expect(userModel.findOne).toHaveBeenCalledWith({ email: mockLoginInput.email })
    });

    it('Password not match', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(mockLoginRecord)

      const mockCompare = bcrypt.compare as jest.Mock
      mockCompare.mockResolvedValue(false);

      mockLoginInput.password = 'wrong_password'
      await expect(service.login(mockLoginInput)).rejects.toThrow(BadRequestException)
      expect(bcrypt.compare).toHaveBeenCalledWith(mockLoginInput.password, mockLoginRecord.password)
    })
    
    it('Create Access Token', async () => {
      (userModel.findOne as jest.Mock).mockResolvedValue(mockLoginRecord)

      const mockCompare = bcrypt.compare as jest.Mock
      mockCompare.mockResolvedValue(true);

      (authService.createAccessToken as jest.Mock).mockResolvedValue('mockToken');
      
      const result = await service.login(mockLoginInput)

      expect(bcrypt.compare).toHaveBeenCalledWith(mockLoginInput.password, mockLoginRecord.password)
      expect(authService.createAccessToken).toHaveBeenCalledWith(mockLoginData._id);
      expect(result).toEqual({
        user: mockLoginData,
        accessToken: 'mockToken',
      });
    })
  })
});
