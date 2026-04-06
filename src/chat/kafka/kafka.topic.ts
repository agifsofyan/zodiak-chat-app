export const KAFKA_TOPICS = {
  CHAT_MESSAGE: 'chat.message',
  CHAT_MESSAGE_READ: 'chat.message.read',
} as const;

export const KAFKA_CLIENT_CONFIG = {
  CLIENT_ID: 'zodiak-chat-app',
  GROUP_ID: 'chat-consumer-group',
} as const;
