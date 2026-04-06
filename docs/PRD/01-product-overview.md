# Product Requirements Document (PRD)

## Zodiak Chat App

**Version:** 1.0  
**Date:** March 2026  
**Status:** Draft

---

## 1. Product Overview

### 1.1 Product Description

**Zodiak Chat App** adalah aplikasi chat real-time berbasis NestJS yang menggabungkan komunikasi instan dengan fitur astrologi (zodiak dan horoskop). Aplikasi ini memungkinkan pengguna untuk:

1. **Berkomunikasi** dengan pengguna lain secara real-time
2. **Mengenal karakter** berdasarkan zodiak dan horoskop
3. **Menyimpan dan berbagi** profil personal dengan informasi astrologi

### 1.2 Product Vision

Membuat platform komunikasi yang personal dan bermakna melalui integrasi astrologi, dimana pengguna tidak hanya berkomunikasi tetapi juga memahami karakter lawan bicara berdasarkan zodiak.

### 1.3 Product Scope

**In Scope:**

- Authentication (Register, Login, JWT)
- Profile Management (CRUD, Avatar, Zodiac calculation)
- Real-time Chat (WebSocket + Kafka)
- File Upload (MinIO)

**Out of Scope:**

- Video/Audio call
- Group chat (>2 participants)
- Payment gateway
- Push notifications (Phase 2)

---

## 2. User Stories

### 2.1 Authentication

| ID          | User Story                                                                                       | Acceptance Criteria                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| US-AUTH-001 | Sebagai user baru, saya ingin register dengan email dan password agar dapat menggunakan aplikasi | - Email validasi format<br>- Password minimal 8 karakter<br>- Hash password sebelum simpan<br>- Return JWT token |
| US-AUTH-002 | Sebagai user, saya ingin login agar dapat mengakses aplikasi                                     | - Validasi credential<br>- Return encrypted JWT token<br>- Update last_login                                     |
| US-AUTH-003 | Sebagai user, saya ingin sistem mengingat saya dengan token yang aman                            | - Token terenkripsi<br>- Token expires dalam 30 hari<br>- Refresh token mechanism                                |

### 2.2 Profile Management

| ID          | User Story                                                    | Acceptance Criteria                                                                                  |
| ----------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| US-PROF-001 | Sebagai user, saya ingin membuat profil dengan data diri saya | - Simpan gender, birthday, height, weight<br>- Hitung zodiac otomatis<br>- Hitung horoscope otomatis |
| US-PROF-002 | Saya sebagai user ingin mengupdate profil saya kapan saja     | - Update semua field profil<br>- Recalculate zodiac jika birthday berubah                            |
| US-PROF-003 | Saya sebagai user ingin upload foto profil                    | - Accept gambar (jpg, png, webp)<br>- Max size 5MB<br>- Simpan ke MinIO                              |
| US-PROF-004 | Saya sebagai user ingin melihat profil saya                   | - Tampilkan semua data profil<br>- Include avatar URL                                                |
| US-PROF-005 | Saya sebagai user ingin menghapus avatar                      | - Hapus file dari MinIO<br>- Set avatar field ke null                                                |

### 2.3 Chat

| ID          | User Story                                                       | Acceptance Criteria                                                       |
| ----------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------- |
| US-CHAT-001 | Saya sebagai user ingin memulai percakapan dengan user lain      | - Create conversation dengan participant<br>- Return conversation list    |
| US-CHAT-002 | Saya sebagai user ingin mengirim pesan text                      | - Kirim pesan via WebSocket<br>- Simpan ke MongoDB<br>- Emit ke recipient |
| US-CHAT-003 | Saya sebagai user ingin melihat riwayat percakapan               | - List semua conversation<br>- List message dengan pagination             |
| US-CHAT-004 | Saya sebagai user ingin tahu siapa yang sudah membaca pesan saya | - Update isRead=true<br>- Tampilkan readAt timestamp                      |
| US-CHAT-005 | Saya sebagai user ingin menerima pesan secara real-time          | - Connect via WebSocket<br>- Receive message event                        |

---

## 3. Functional Specifications

### 3.1 Authentication Module

#### 3.1.1 Registration Flow

```
User Input (email, password, name)
    ↓
Validate input (format, required)
    ↓
Hash password (bcrypt, salt=12)
    ↓
Save to MongoDB (User collection)
    ↓
Return success response + JWT token
```

#### 3.1.2 Login Flow

```
User Input (email, password)
    ↓
Find user by email
    ↓
Compare password (bcrypt compare)
    ↓
Generate JWT token (sign with secret)
    ↓
Encrypt token (Cryptr)
    ↓
Return token + user data
```

#### 3.1.3 API Endpoints

| Endpoint        | Method | Request         | Response        |
| --------------- | ------ | --------------- | --------------- |
| `/api/register` | POST   | UserRegisterDTO | { token, user } |
| `/api/login`    | POST   | UserLoginDTO    | { token, user } |

### 3.2 Profile Module

#### 3.2.1 Profile Data Flow

```
User Input (birthday)
    ↓
Calculate Western Zodiac (birthday → zodiac sign)
    ↓
Calculate Chinese Zodiac (birth year → zodiac animal)
    ↓
Save to Profile collection
    ↓
Return updated profile
```

#### 3.2.2 Zodiac Calculation Rules

**Western Zodiac:**
| Date Range | Zodiac |
|------------|--------|
| Dec 22 - Jan 19 | Capricorn |
| Jan 20 - Feb 18 | Aquarius |
| Feb 19 - Mar 20 | Pisces |
| Mar 21 - Apr 19 | Aries |
| Apr 20 - May 20 | Taurus |
| May 21 - Jun 20 | Gemini |
| Jun 21 - Jul 22 | Cancer |
| Jul 23 - Aug 22 | Leo |
| Aug 23 - Sep 22 | Virgo |
| Sep 23 - Oct 22 | Libra |
| Oct 23 - Nov 21 | Scorpio |
| Nov 22 - Dec 21 | Sagittarius |

**Chinese Zodiac:**
Cycle: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig

#### 3.2.3 API Endpoints

| Endpoint             | Method | Auth | Description               |
| -------------------- | ------ | ---- | ------------------------- |
| `/api/getProfile`    | GET    | JWT  | Get my profile            |
| `/api/createProfile` | POST   | JWT  | Create profile            |
| `/api/updateProfile` | POST   | JWT  | Update profile            |
| `/api/uploadAvatar`  | POST   | JWT  | Upload avatar (multipart) |
| `/api/removeAvatar`  | DELETE | JWT  | Remove avatar             |

### 3.3 Chat Module

#### 3.3.1 Architecture

```
┌─────────────┐    WebSocket     ┌─────────────┐
│   Client A  │──────────────────▶│  NestJS API │
└─────────────┘                   └──────┬──────┘
                                         │
                                  ┌──────▼──────┐
                                  │    Kafka    │
                                  │   Producer  │
                                  └──────┬──────┘
                                         │
                                  ┌──────▼──────┐
                                  │    Kafka    │
                                  │   Consumer  │
                                  └──────┬──────┘
                                         │
                                  ┌──────▼──────┐
                                  │  WebSocket  │
                                  │   Gateway   │
                                  └─────────────┘
```

#### 3.3.2 Kafka Topics

| Topic               | Event        | Payload                                                |
| ------------------- | ------------ | ------------------------------------------------------ |
| `chat.message`      | New message  | { conversationId, senderId, content, type, timestamp } |
| `chat.message.read` | Message read | { conversationId, messageId, userId, readAt }          |

#### 3.3.3 WebSocket Events

| Event     | Direction       | Payload                                                    |
| --------- | --------------- | ---------------------------------------------------------- |
| `join`    | Client → Server | { conversationId }                                         |
| `leave`   | Client → Server | { conversationId }                                         |
| `message` | Bidirectional   | { id, conversationId, senderId, content, type, timestamp } |
| `read`    | Client → Server | { conversationId, messageId }                              |
| `typing`  | Bidirectional   | { conversationId, userId, isTyping }                       |

#### 3.3.4 REST API Endpoints

| Endpoint                                | Method | Auth | Description               |
| --------------------------------------- | ------ | ---- | ------------------------- |
| `/api/chat/conversations`               | GET    | JWT  | List conversations        |
| `/api/chat/conversation/:participantId` | POST   | JWT  | Create/get conversation   |
| `/api/chat/messages/:conversationId`    | GET    | JWT  | Get messages (pagination) |

### 3.4 File Upload Module

#### 3.4.1 Flow

```
User Upload File
    ↓
Validate (type: image/*, size: <5MB)
    ↓
Generate unique filename (timestamp + original)
    ↓
Upload to MinIO
    ↓
Get public URL
    ↓
Save URL to database
    ↓
Return URL
```

#### 3.4.2 Supported Formats

- Images: jpg, jpeg, png, webp, gif
- Max size: 5MB

---

## 4. Data Models

### 4.1 User Collection

```typescript
{
  _id: ObjectId,
  name: string,           // Required
  email: string,         // Required, unique
  password: string,      // Required, hashed
  last_login: Date,      // Default: now
  profile: ObjectId,     // Ref to Profile
  createdAt: Date,
  updatedAt: Date
}
```

### 4.2 Profile Collection

```typescript
{
  _id: ObjectId,
  user: ObjectId,        // Ref to User
  avatar: string,        // URL from MinIO
  gender: enum,          // MALE, FEMALE
  birthday: Date,
  horoscope: string,     // Calculated from birthday
  zodiac: string,        // Calculated from birthday
  height: number,        // cm
  weight: number,        // kg
  interest: string[],    // Array of interests
  createdAt: Date,
  updatedAt: Date
}
```

### 4.3 Conversation Collection

```typescript
{
  _id: ObjectId,
  participants: ObjectId[],  // Array of User _id
  lastMessage: ObjectId,     // Ref to Message
  createdAt: Date,
  updatedAt: Date
}
```

### 4.4 Message Collection

```typescript
{
  _id: ObjectId,
  conversation: ObjectId,    // Ref to Conversation
  sender: ObjectId,          // Ref to User
  content: string,
  type: enum,                // text, image, file
  isRead: boolean,          // Default: false
  readAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 5. API Specifications

### 5.1 Authentication APIs

#### POST /api/register

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**

```json
{
  "statusCode": 201,
  "message": "Registration is successful",
  "data": {
    "token": "encrypted-jwt-token",
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

#### POST /api/login

**Request:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "statusCode": 200,
  "message": "login is successful",
  "data": {
    "token": "encrypted-jwt-token",
    "user": { ... }
  }
}
```

### 5.2 Profile APIs

#### GET /api/getProfile

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "statusCode": 200,
  "message": "Get my data is successful",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "profile": {
      "_id": "...",
      "avatar": "https://...",
      "gender": "MALE",
      "birthday": "1995-06-15",
      "horoscope": "Gemini",
      "zodiac": "Tiger",
      "height": 175,
      "weight": 70,
      "interest": ["music", "travel"]
    }
  }
}
```

#### POST /api/createProfile

**Request:**

```json
{
  "gender": "MALE",
  "birthday": "1995-06-15",
  "height": 175,
  "weight": 70,
  "interest": ["music", "travel"]
}
```

**Response (201):**

```json
{
  "statusCode": 201,
  "message": "Success create profile.",
  "data": { ... }
}
```

### 5.3 Chat APIs (REST)

#### GET /api/chat/conversations

**Response (200):**

```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "...",
      "participants": [...],
      "lastMessage": {
        "content": "Hello!",
        "sender": "...",
        "createdAt": "..."
      }
    }
  ]
}
```

### 5.4 WebSocket Protocol

#### Connection

```
URL: ws://domain.com
Headers: Authorization: Bearer <token>
```

#### Join Room

```json
{
  "event": "join",
  "data": {
    "conversationId": "conv_123"
  }
}
```

#### Send Message

```json
{
  "event": "message",
  "data": {
    "conversationId": "conv_123",
    "content": "Hello!",
    "type": "text"
  }
}
```

---

## 6. UI/UX Requirements

### 6.1 Design Principles

1. **Clean & Modern** - Interface yang bersih dan tidak ramai
2. **Astrology-themed** - Gunakan elemen-elemen astrologi sebagai aksen
3. **Mobile-first** - Desain dioptimalkan untuk mobile
4. **Accessible** - Pertimbangkan aksesibilitas untuk semua pengguna

### 6.2 Color Palette

| Color          | Hex     | Usage                   |
| -------------- | ------- | ----------------------- |
| Primary        | #6C5CE7 | Buttons, links, accents |
| Secondary      | #A29BFE | Secondary elements      |
| Background     | #FFFFFF | Main background         |
| Surface        | #F8F9FA | Cards, containers       |
| Text Primary   | #2D3436 | Main text               |
| Text Secondary | #636E72 | Secondary text          |
| Success        | #00B894 | Success states          |
| Error          | #E74C3C | Error states            |

### 6.3 Typography

| Element | Font    | Size | Weight   |
| ------- | ------- | ---- | -------- |
| H1      | Poppins | 28px | Bold     |
| H2      | Poppins | 24px | SemiBold |
| H3      | Poppins | 20px | SemiBold |
| Body    | Inter   | 16px | Regular  |
| Caption | Inter   | 14px | Regular  |

### 6.4 Key Screens

1. **Splash Screen** - Logo + Loading
2. **Login/Register** - Form dengan validasi
3. **Home** - List conversations
4. **Chat** - Message list + input
5. **Profile** - User profile + edit
6. **Settings** - App settings

---

## 7. Acceptance Criteria

### 7.1 Authentication

| Criteria            | Test Scenario                                        |
| ------------------- | ---------------------------------------------------- |
| User dapat register | Submit form valid → Akun dibuat → Token dikembalikan |
| User dapat login    | Credential benar → Token dikembalikan                |
| Invalid login       | Credential salah → Error message                     |
| JWT valid           | Token digunakan → Request berhasil                   |
| JWT expired         | Token expired → 401 Unauthorized                     |

### 7.2 Profile

| Criteria      | Test Scenario                                          |
| ------------- | ------------------------------------------------------ |
| Buat profil   | Submit data → Profil tersimpan dengan zodiac terhitung |
| Update profil | Ubah data → Perubahan tersimpan                        |
| Upload avatar | Upload gambar → URL dikembalikan, tampil di profil     |
| Hapus avatar  | Klik hapus → File dihapus, avatar null                 |

### 7.3 Chat

| Criteria     | Test Scenario                                     |
| ------------ | ------------------------------------------------- |
| Kirim pesan  | Kirim via WebSocket → Penerima menerima real-time |
| Terima pesan | Pesan masuk → Tampilkan di UI                     |
| Riwayat chat | Buka conversation → Pesan lama termuat            |
| Read status  | Buka conversation → Pesan ditandai read           |

### 7.4 Performance

| Criteria          | Target  |
| ----------------- | ------- |
| API response      | < 200ms |
| Message delivery  | < 500ms |
| File upload (1MB) | < 3s    |
| Page load         | < 2s    |

---

## 8. Release Plan

### 8.1 Phase 1 - MVP (Q2 2026)

**Timeline:** April - June 2026

**Features:**

- User registration & login
- Profile management (CRUD)
- Avatar upload
- Zodiac/Horoscope calculation
- Basic chat (WebSocket)
- Kafka integration for message persistence

**Success Metrics:**

- 1,000 registered users
- Basic engagement tracking

### 8.2 Phase 2 - Enhancement (Q3 2026)

**Timeline:** July - September 2026

**Features:**

- Image sharing in chat
- Read receipts
- Typing indicators
- Push notifications
- Group chat (2-10 participants)

**Success Metrics:**

- 5,000 registered users
- DAU > 30%

### 8.3 Phase 3 - Scale (Q4 2026)

**Timeline:** October - December 2026

**Features:**

- Video/Audio call (WebRTC)
- Advanced search
- Analytics dashboard
- Performance optimization

**Success Metrics:**

- 10,000 registered users
- Revenue optimization
- Scale infrastructure

---

## Appendices

### A. DTO Definitions

```typescript
// UserRegisterDTO
{
  name: string;        // Required, min 2 chars
  email: string;       // Required, valid email format
  password: string;   // Required, min 8 chars
}

// UserLoginDTO
{
  email: string;      // Required
  password: string;   // Required
}

// ProfileDTO
{
  gender?: Gender;    // Optional
  birthday?: Date;    // Optional
  height?: number;     // Optional
  weight?: number;    // Optional
  interest?: string[] // Optional
}
```

### B. Error Codes

| Code | Message               |
| ---- | --------------------- |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 404  | Not Found             |
| 409  | Conflict              |
| 500  | Internal Server Error |

---

**Document Control**

| Version | Date       | Author           | Changes       |
| ------- | ---------- | ---------------- | ------------- |
| 1.0     | March 2026 | Development Team | Initial draft |
