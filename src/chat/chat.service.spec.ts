import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { getModelToken } from '@nestjs/mongoose';
import { KafkaProducerService } from './kafka/kafka.producer';
import { ChatGateway } from './chat.gateway';

describe('ChatService', () => {
  let service: ChatService;

  const mockConversationModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockMessageModel = {
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
  };

  const mockKafkaProducer = {
    emit: jest.fn(),
  };

  const mockChatGateway = {
    emitMessageToRoom: jest.fn(),
    sendMessageToUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getModelToken('Conversation'),
          useValue: mockConversationModel,
        },
        { provide: getModelToken('Message'), useValue: mockMessageModel },
        { provide: KafkaProducerService, useValue: mockKafkaProducer },
        { provide: ChatGateway, useValue: mockChatGateway },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
