import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { getModelToken } from '@nestjs/mongoose';

describe('ChatController', () => {
  let controller: ChatController;

  const mockChatService = {
    getConversations: jest.fn(),
    createOrGetConversation: jest.fn(),
    getMessages: jest.fn(),
    getUnreadCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        { provide: ChatService, useValue: mockChatService },
        { provide: getModelToken('Conversation'), useValue: {} },
        { provide: getModelToken('Message'), useValue: {} },
        { provide: getModelToken('User'), useValue: {} },
        { provide: getModelToken('Profile'), useValue: {} },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
