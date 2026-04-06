# TRD - Technical Requirements Document

## Zodiak Chat App

**Version:** 1.0  
**Date:** March 2026  
**Status:** Draft

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Web Browser │  │ Mobile iOS  │  │    Mobile Android       │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
└─────────┼────────────────┼───────────────────┼─────────────────┘
          │                │                   │
          ▼                ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway (NestJS)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │    Auth    │  │   Profile   │  │    Chat    │               │
│  │  Module    │  │   Module    │  │   Module    │               │
│  └─────────────┘  └─────────────┘  └──────┬──────┘               │
│                                           │                      │
│  ┌────────────────────────────────────────┼──────────────────┐  │
│  │              WebSocket Gateway          │                  │  │
│  └────────────────────────────────────────┬──────────────────┘  │
└───────────────────────────────────────────┼─────────────────────┘
                                            │
                    ┌─────────────────────────┼─────────────────────┐
                    │                         │                     │
                    ▼                         ▼                     ▼
         ┌──────────────────┐    ┌──────────────────┐   ┌────────────┐
         │  MongoDB         │    │      Kafka      │   │  MinIO     │
         │  (Database)      │    │  (Message Queue)│   │ (Storage)  │
         └──────────────────┘    └──────────────────┘   └────────────┘
```

### 1.2 Technology Stack

| Layer          | Technology     | Version |
| -------------- | -------------- | ------- |
| Framework      | NestJS         | 10.x    |
| Language       | TypeScript     | 5.x     |
| Database       | MongoDB        | 7.x     |
| ODM            | Mongoose       | 8.x     |
| Authentication | JWT + Passport | 10.x    |
| Encryption     | Cryptr         | 6.x     |
| Real-time      | Socket.io      | 4.x     |
| Message Queue  | Apache Kafka   | 3.x     |
| Object Storage | MinIO          | 8.x     |
| Testing        | Jest           | 29.x    |

### 1.3 Project Structure

```
zodiak-chat-app/
├── src/
│   ├── main.ts                    # Application entry
│   ├── app.module.ts             # Root module
│   ├── app.controller.ts         # Root controller
│   ├── app.service.ts            # Root service
│   │
│   ├── auth/                     # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── guards/
│   │   │   └── jwt/
│   │   │       └── jwt.guard.ts
│   │   └── interfaces/
│   │       └── jwt-payload/
│   │
│   ├── user/                     # User module
│   │   ├── user.module.ts
│   │   ├── user.service.ts
│   │   ├── user.controller.ts
│   │   ├── schemas/
│   │   │   └── user.schema.ts
│   │   ├── dto/
│   │   │   ├── user-register.dto.ts
│   │   │   └── user-login.dto.ts
│   │   └── interfaces/
│   │       └── user.interface.ts
│   │
│   ├── profile/                  # Profile module
│   │   ├── profile.module.ts
│   │   ├── profile.service.ts
│   │   ├── profile.controller.ts
│   │   ├── schemas/
│   │   │   └── profile.schema.ts
│   │   ├── dto/
│   │   │   ├── profile.dto.ts
│   │   │   ├── enum-gender.dto.ts
│   │   │   ├── enum-zodiac.dto.ts
│   │   │   └── enum-horoscope.dto.ts
│   │   └── interfaces/
│   │       └── profile.interface.ts
│   │
│   ├── chat/                     # Chat module
│   │   ├── chat.module.ts
│   │   ├── chat.service.ts
│   │   ├── chat.controller.ts
│   │   ├── chat.gateway.ts      # WebSocket Gateway
│   │   ├── kafka/
│   │   │   ├── kafka.producer.ts
│   │   │   ├── kafka.consumer.ts
│   │   │   └── kafka.topic.ts
│   │   ├── schemas/
│   │   │   ├── chat-conversation.ts
│   │   │   └── chat-message.schemas.ts
│   │   └── dto/
│   │       ├── create-message.dto.ts
│   │       └── create-conversation.dto.ts
│   │
│   └── minio/                   # MinIO module
│       ├── minio.module.ts
│       ├── minio.service.ts
│       └── dto/
│           └── upload.dto.ts
│
├── config/
│   ├── configuration.ts         # App configuration
│   └── db.config.ts             # Database configuration
│
├── util/
│   ├── common.util.ts           # Common utilities
│   ├── zodiac.util.ts           # Zodiac calculation
│   └── horoscope.util.ts       # Horoscope calculation
│
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── docs/                        # Documentation
│   ├── BRD/
│   ├── PRD/
│   └── TRD/
│
├── .env                        # Environment variables
├── package.json
├── tsconfig.json
├── nest-cli.json
└── docker-compose.yaml
```

---

## 2. Database Design

### 2.1 MongoDB Collections

#### 2.1.1 Users Collection

```javascript
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: { bsonType: 'string', minLength: 2 },
        email: { bsonType: 'string', pattern: '^\\S+@\\S+\\.\\S+$' },
        password: { bsonType: 'string', minLength: 8 },
        last_login: { bsonType: 'date' },
        profile: { bsonType: 'objectId' },
      },
    },
  },
});

// Indexes
db.users.createIndex({ email: 1 }, { unique: true });
```

#### 2.1.2 Profiles Collection

```javascript
db.createCollection('profiles', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['user'],
      properties: {
        user: { bsonType: 'objectId' },
        avatar: { bsonType: 'string' },
        gender: { enum: ['MALE', 'FEMALE'] },
        birthday: { bsonType: 'date' },
        horoscope: { bsonType: 'string' },
        zodiac: { bsonType: 'string' },
        height: { bsonType: 'int' },
        weight: { bsonType: 'int' },
        interest: { bsonType: 'array' },
      },
    },
  },
});

// Indexes
db.profiles.createIndex({ user: 1 }, { unique: true });
```

#### 2.1.3 Conversations Collection

```javascript
db.createCollection('conversations');

// Indexes
db.conversations.createIndex({ participants: 1 });
db.conversations.createIndex({ updatedAt: -1 });
```

#### 2.1.4 Messages Collection

```javascript
db.createCollection('messages');

// Indexes
db.messages.createIndex({ conversation: 1, createdAt: -1 });
db.messages.createIndex({ sender: 1 });
```

### 2.2 Entity Relationships

```
User (1) ────── (1) Profile
    │
    └──────── (1) ────── (N) Conversation
                          │
                          └─ (N) Message
```

---

## 3. API Design

### 3.1 REST API Endpoints

#### 3.1.1 Authentication

| Method | Endpoint      | Auth | Description       |
| ------ | ------------- | ---- | ----------------- |
| POST   | /api/register | No   | Register new user |
| POST   | /api/login    | No   | Login user        |

#### 3.1.2 Profile

| Method | Endpoint           | Auth | Description              |
| ------ | ------------------ | ---- | ------------------------ |
| GET    | /api/getProfile    | JWT  | Get current user profile |
| POST   | /api/createProfile | JWT  | Create profile           |
| POST   | /api/updateProfile | JWT  | Update profile           |
| POST   | /api/uploadAvatar  | JWT  | Upload avatar            |
| DELETE | /api/removeAvatar  | JWT  | Remove avatar            |

#### 3.1.3 Chat

| Method | Endpoint                              | Auth | Description         |
| ------ | ------------------------------------- | ---- | ------------------- |
| GET    | /api/chat/conversations               | JWT  | List conversations  |
| POST   | /api/chat/conversation/:participantId | JWT  | Create conversation |
| GET    | /api/chat/messages/:conversationId    | JWT  | Get messages        |

### 3.2 WebSocket Events

#### 3.2.1 Client → Server

| Event     | Payload                             | Description             |
| --------- | ----------------------------------- | ----------------------- |
| `join`    | `{ conversationId: string }`        | Join conversation room  |
| `leave`   | `{ conversationId: string }`        | Leave conversation room |
| `message` | `{ conversationId, content, type }` | Send message            |
| `read`    | `{ conversationId, messageId }`     | Mark message as read    |
| `typing`  | `{ conversationId, isTyping }`      | Typing indicator        |

#### 3.2.2 Server → Client

| Event        | Payload                                                    | Description            |
| ------------ | ---------------------------------------------------------- | ---------------------- |
| `message`    | `{ id, conversationId, sender, content, type, timestamp }` | New message            |
| `read`       | `{ conversationId, messageId, userId, readAt }`            | Read status update     |
| `typing`     | `{ conversationId, userId, isTyping }`                     | Typing indicator       |
| `error`      | `{ code, message }`                                        | Error notification     |
| `connect`    | -                                                          | Connection established |
| `disconnect` | -                                                          | Connection closed      |

---

## 4. Kafka Topics

### 4.1 Topic Definitions

#### 4.1.1 chat.message

**Purpose:** Handle new chat messages

**Producer:** WebSocket Gateway

**Consumer:** Chat Consumer Service

**Key:** `conversationId` (for partition ordering)

```json
{
  "topic": "chat.message",
  "partitions": 6,
  "replicationFactor": 1,
  "configs": {
    "min.insync.replicas": 1
  }
}
```

**Message Schema:**

```json
{
  "conversationId": "string",
  "senderId": "string",
  "content": "string",
  "type": "text|image|file",
  "timestamp": "ISO8601"
}
```

#### 4.1.2 chat.message.read

**Purpose:** Handle read status updates

```json
{
  "topic": "chat.message.read",
  "partitions": 6,
  "replicationFactor": 1
}
```

**Message Schema:**

```json
{
  "conversationId": "string",
  "messageId": "string",
  "userId": "string",
  "readAt": "ISO8601"
}
```

### 4.2 Kafka Configuration

```typescript
// Producer Configuration (Low Latency)
const producerConfig = {
  allowAutoCreateTopics: true,
  transactionTimeout: 30000,
  // Low latency settings
  lingerMs: 0, // Send immediately without batching
  acks: 1, // Wait only for leader acknowledgment
  retries: 3,
  maxInFlightRequestsPerConnection: 5,
  compressionType: 'lz4' as const,
};

// Consumer Configuration
const consumerConfig = {
  groupId: 'chat-consumer-group',
  sessionTimeout: 30000,
  heartbeatInterval: 3000,
  // Low latency fetch settings
  fetchMinBytes: 1,
  fetchMaxWaitMs: 100,
  maxPollRecords: 100,
};
```

---

## 5. Security

### 5.1 Authentication

| Component        | Implementation       |
| ---------------- | -------------------- |
| Token Type       | JWT (JSON Web Token) |
| Algorithm        | HS256                |
| Expiration       | 30 days              |
| Token Encryption | AES-256 (via Cryptr) |
| Refresh          | Token rotation       |

### 5.2 Password Security

| Component   | Implementation    |
| ----------- | ----------------- |
| Algorithm   | bcrypt            |
| Salt Rounds | 12                |
| Min Length  | 8 characters      |
| Validation  | Server-side + Joi |

### 5.3 API Security

| Component      | Implementation                     |
| -------------- | ---------------------------------- |
| Authentication | JWT Bearer Token                   |
| Rate Limiting  | 100 requests/minute (configurable) |
| CORS           | Whitelist domains                  |
| Helmet         | Security headers                   |
| Validation     | class-validator + Joi              |

### 5.4 File Upload Security

| Component        | Implementation            |
| ---------------- | ------------------------- |
| Type Validation  | MIME type checking        |
| Size Limit       | 5MB max                   |
| Extension Filter | jpg, jpeg, png, webp, gif |
| Storage          | MinIO (private bucket)    |

---

## 6. Infrastructure

### 6.1 Docker Compose

```yaml
version: '3.8'

services:
  # MongoDB
  mongodb:
    image: mongo:7
    ports:
      - '27017:27017'
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: ${DB_PASS:-}

  # Kafka
  kafka:
    image: confluentinc/cp-kafka:7.5.0
    ports:
      - '9092:9092'
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@localhost:9093
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0

  # MinIO
  minio:
    image: minio/minio:latest
    ports:
      - '9000:9000'
      - '9001:9001'
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY:-admin}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY:-supersecret}
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

  # NestJS Application
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=development
      - DB_HOST=mongodb
      - DB_PORT=27017
      - KAFKA_BROKERS=kafka:9092
      - MINIO_ENDPOINT=minio
    depends_on:
      - mongodb
      - kafka
      - minio

volumes:
  mongodb_data:
  minio_data:
```

### 6.2 Environment Variables

```bash
# Application
NODE_ENV=development
API_PORT=3000

# Database
DB_HOST=localhost
DB_PORT=27017
DB_NAME=zodiac-app-db
DB_USER=root
DB_PASS=

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_ENCRYPT_SECRET_KEY=your-encrypt-key
JWT_EXPIRATION=30D

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=zodiak-chat-app
KAFKA_GROUP_ID=chat-consumer-group

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=supersecret
MINIO_BUCKET_NAME=zodiac-chat
MINIO_USE_SSL=false
```

---

## 7. Configuration

### 7.1 NestJS Configuration

```typescript
// config/configuration.ts
export const CONFIG_ENV = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
  validationSchema: Joi.object({
    API_PORT: Joi.number().default(3000),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(27017),
    DB_NAME: Joi.string().required(),
    JWT_SECRET_KEY: Joi.string().required(),
    JWT_ENCRYPT_SECRET_KEY: Joi.string().required(),
    JWT_EXPIRATION: Joi.string().default('30D'),
    KAFKA_BROKERS: Joi.string().required(),
    KAFKA_CLIENT_ID: Joi.string().required(),
    KAFKA_GROUP_ID: Joi.string().required(),
    MINIO_ENDPOINT: Joi.string().required(),
    MINIO_PORT: Joi.number().required(),
    MINIO_ACCESS_KEY: Joi.string().required(),
    MINIO_SECRET_KEY: Joi.string().required(),
    MINIO_BUCKET_NAME: Joi.string().required(),
  }),
});
```

---

## 8. Low Latency Optimizations

### 8.1 Kafka Optimizations

| Parameter                               | Value | Rationale                              |
| --------------------------------------- | ----- | -------------------------------------- |
| `linger.ms`                             | 0     | Send immediately, no batching delay    |
| `acks`                                  | 1     | Only wait for leader, not all replicas |
| `retries`                               | 3     | Handle transient failures              |
| `max.in.flight.requests.per.connection` | 5     | Allow parallel requests                |
| `compression.type`                      | lz4   | Fast compression with good ratio       |

### 8.2 WebSocket Optimizations

| Parameter      | Value         | Rationale                  |
| -------------- | ------------- | -------------------------- |
| `transports`   | ['websocket'] | Skip HTTP polling          |
| `pingInterval` | 25000         | Detect disconnects quickly |
| `pingTimeout`  | 20000         | Connection health check    |

### 8.3 Database Optimizations

| Optimization | Implementation                     |
| ------------ | ---------------------------------- |
| Indexing     | Compound indexes on common queries |
| Pagination   | Cursor-based for chat messages     |
| Caching      | Redis for user sessions (Phase 2)  |

---

## 9. Testing Strategy

### 9.1 Unit Tests

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:cov

# Run in watch mode
npm run test:watch
```

**Coverage Targets:**
| Module | Target |
|--------|--------|
| Auth | 80% |
| User | 70% |
| Profile | 70% |
| Chat | 70% |
| MinIO | 70% |
| Overall | 70% |

### 9.2 E2E Tests

```bash
# Run e2e tests
npm run test:e2e
```

**Test Scenarios:**

1. User registration flow
2. User login flow
3. Profile creation/update
4. Avatar upload
5. Chat message send/receive
6. WebSocket connection

### 9.3 Load Testing

**Tools:** k6, Artillery, or JMeter

**Scenarios:**
| Scenario | Target RPS | Duration |
|----------|-----------|----------|
| Login | 100 | 5 min |
| Get Profile | 200 | 5 min |
| Send Message | 500 | 10 min |
| WebSocket Connect | 1000 | 10 min |

---

## 10. Monitoring & Logging

### 10.1 Logging Strategy

| Level | Usage                            |
| ----- | -------------------------------- |
| Error | Exceptions, critical failures    |
| Warn  | Deprecations, recoverable errors |
| Log   | Important business events        |
| Debug | Development debugging            |

### 10.2 Key Metrics

| Metric                | Target  |
| --------------------- | ------- |
| API Latency (p95)     | < 200ms |
| Message Latency (p95) | < 500ms |
| Error Rate            | < 1%    |
| Uptime                | 99.5%   |

### 10.3 Monitoring Tools (Future)

- Prometheus + Grafana
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Sentry (Error tracking)

---

## Appendices

### A. Error Handling

```typescript
// Standard Error Response
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### B. Success Responses

```typescript
// Standard Success Response
{
  "statusCode": 200,
  "message": "Success message",
  "data": { ... }
}
```

### C. Dependencies

```json
{
  "@nestjs/common": "^10.4.20",
  "@nestjs/config": "^3.3.0",
  "@nestjs/core": "^10.4.20",
  "@nestjs/jwt": "^10.2.0",
  "@nestjs/microservices": "^10.4.20",
  "@nestjs/mongoose": "^10.1.0",
  "@nestjs/passport": "^10.0.3",
  "@nestjs/platform-express": "^10.4.20",
  "@nestjs/platform-socket.io": "^10.4.20",
  "@nestjs/swagger": "^7.4.2",
  "@nestjs/websockets": "^10.4.20",
  "bcrypt": "^6.0.0",
  "class-transformer": "^0.5.1",
  "class-validator": "^0.14.2",
  "cryptr": "^6.4.0",
  "joi": "^18.0.1",
  "jsonwebtoken": "^9.0.2",
  "kafkajs": "^2.2.4",
  "minio": "^8.0.6",
  "mongoose": "^8.19.1",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "socket.io": "^4.7.2"
}
```

---

## Document Control

| Version | Date       | Author           | Changes       |
| ------- | ---------- | ---------------- | ------------- |
| 1.0     | March 2026 | Development Team | Initial draft |
