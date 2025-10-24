const mockEncrypt = jest.fn((val: string) => `encrypted(${val})`);
const mockDecrypt = jest.fn((val: string) => `decrypted(${val})`);

jest.mock('cryptr', () => {
  return jest.fn().mockImplementation(() => ({
    encrypt: mockEncrypt,
    decrypt: mockDecrypt,
  }));
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import * as jwt from 'jsonwebtoken';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'raw.jwt.token'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userModelMock: any;
  let mockUser: any;

  beforeEach(async () => {
    mockUser = {
      _id: '123',
      last_login: null,
      save: jest.fn(),
      toObject: jest.fn().mockReturnValue({
        _id: '123',
        email: 'test@example.com',
        name: 'Tester',
        password: 'password123',
      }),
    };

    userModelMock = {
      findOne: jest.fn().mockResolvedValue(mockUser),
      save: jest.fn().mockResolvedValue(mockUser),
    };

    const configMock = {
      get: jest.fn((key: string) => {
        const config = {
          JWT_SECRET_KEY: 'secret',
          JWT_EXPIRATION: '1d',
          JWT_ENCRYPT_SECRET_KEY: 'EN123456',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken('User'), useValue: userModelMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('createAccessToken', () => {
    it('should create encrypted access token', async () => {
      const token = await service.createAccessToken('123');

      expect(jwt.sign).toHaveBeenCalledWith(
        { sub: '123' },
        'secret',
        { expiresIn: '1d' },
      );

      expect(mockEncrypt).toHaveBeenCalledWith('raw.jwt.token');
      expect(token).toBe('encrypted(raw.jwt.token)');
    });
  });

  describe('validate', () => {
    it('should find user, update last_login, and return user object', async () => {
      const result = await service.validate({ sub: '123' });

      expect(userModelMock.findOne).toHaveBeenCalledWith({ _id: '123' });
      expect(mockUser.last_login).toBeInstanceOf(Date);
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).not.toHaveProperty('password');
      expect(result).toEqual({
        _id: '123',
        email: 'test@example.com',
        name: 'Tester',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userModelMock.findOne.mockResolvedValueOnce(null);

      await expect(service.validate({ sub: '999' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('jwtExtractor', () => {
    it('should extract token from x-auth-token header', () => {
      const req = {
        header: jest.fn().mockReturnValue('encrypted(raw.jwt.token)'),
        headers: {},
      } as any;

      const extractor = service.returnJwtExtractor();
      const result = extractor(req);

      expect(req.header).toHaveBeenCalledWith('x-auth-token');
      expect(mockDecrypt).toHaveBeenCalledWith('encrypted(raw.jwt.token)');
      expect(result).toBe('decrypted(encrypted(raw.jwt.token))');
    });

    it('should extract token from Authorization Bearer header', () => {
      const req = {
        header: jest.fn().mockReturnValue(null),
        headers: { authorization: 'Bearer encryptedToken' },
      } as any;

      mockDecrypt.mockReturnValueOnce('decryptedToken');

      const extractor = service.returnJwtExtractor();
      const result = extractor(req);

      expect(mockDecrypt).toHaveBeenCalledWith('encryptedToken');
      expect(result).toBe('decryptedToken');
    });

    it('should throw BadRequestException for invalid Authorization header format', () => {
      const req = {
        header: jest.fn().mockReturnValue(null),
        headers: { authorization: 'Token invalidFormat' },
      } as any;

      const extractor = service.returnJwtExtractor();
      expect(() => extractor(req)).toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if no token', () => {
      const req = {
        header: jest.fn().mockReturnValue(null),
        headers: {},
      } as any;

      const extractor = service.returnJwtExtractor();
      expect(() => extractor(req)).toThrow(UnauthorizedException);
    });

    it('should throw BadRequestException if decrypt fails', () => {
      mockDecrypt.mockImplementation(() => {
        throw new Error('invalid');
      });

      const req = {
        header: jest.fn().mockReturnValue('encrypted(raw.jwt.token)'),
        headers: {},
      } as any;

      const extractor = service.returnJwtExtractor();
      expect(() => extractor(req)).toThrow(BadRequestException);
    });
  });
});
