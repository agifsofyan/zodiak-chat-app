# BRD - Business Requirements Document

## Zodiak Chat App

**Version:** 1.0  
**Date:** March 2026  
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Project Overview

**Zodiak Chat App** adalah aplikasi chat real-time berbasis mobile/web yang dirancang untuk pengguna berusia 18-35 tahun. Aplikasi ini menggabungkan fitur komunikasi real-time dengan elemen astrologi (zodiak dan horoskop) untuk menciptakan pengalaman bersosialisasi yang unik dan personal.

### 1.2 Vision Statement

Menjadi platform chat berbasis astrologi yang membantu pengguna menemukan koneksi yang lebih bermakna melalui pemahaman karakter berdasarkan zodiak dan horoskop.

### 1.3 Key Business Goals

1. Menyediakan platform komunikasi real-time yang aman dan terpercaya
2. Mengintegrasikan fitur astrologi untuk personalisasi pengalaman pengguna
3. Membangun basis pengguna yang aktif dan terlibat

---

## 2. Business Objectives

### 2.1 Primary Objectives

| Objective                         | Success Metric               | Target               |
| --------------------------------- | ---------------------------- | -------------------- |
| Launch aplikasi dengan fitur core | Semua fitur Phase 1 berjalan | Q2 2026              |
| Akuisisi pengguna baru            | Total registered users       | 10,000 users         |
| Engagement pengguna               | Daily Active Users (DAU)     | 30% dari total users |
| Retensi pengguna                  | 30-day retention rate        | 40%                  |

### 2.2 Secondary Objectives

- Monetisasi melalui fitur premium
- Partnership dengan brand astrology
- Ekspansi ke pasar Asia Tenggara

---

## 3. Stakeholders

### 3.1 Internal Stakeholders

| Role               | Responsibility                          |
| ------------------ | --------------------------------------- |
| Product Manager    | Product vision, roadmap, prioritization |
| Lead Developer     | Technical architecture, code review     |
| Backend Developer  | API development, database design        |
| Frontend Developer | Client application development          |
| QA Engineer        | Testing, quality assurance              |
| UI/UX Designer     | User interface, experience design       |

### 3.2 External Stakeholders

| Stakeholder       | Interest                             |
| ----------------- | ------------------------------------ |
| End Users         | Fitur chat, astrologi, keamanan data |
| Investors         | Pertumbuhan users, revenue           |
| Regulatory Bodies | Kepatuhan hukum, privasi data        |

---

## 4. Market Analysis

### 4.1 Industry Overview

Industri aplikasi chat global terus berkembang dengan fokus pada:

- **Real-time communication**: Kebutuhan komunikasi instan yang andal
- **Social features**: Fitur-fitur sosial yang memperkaya interaksi
- **Personalization**: Pengalaman yang disesuaikan dengan preferensi pengguna

### 4.2 Target Market

**Primary Market:** Indonesia

- Populasi: 270+ juta
- Pengguna internet: 220+ juta
- Pengguna smartphone: 160+ juta

**Demographics:**

- Usia: 18-35 tahun
- Gender: All
- Minat: Astrologi, bersosialisasi, teknologi

### 4.3 Competitive Landscape

| Competitor | Strengths              | Weaknesses                         |
| ---------- | ---------------------- | ---------------------------------- |
| WhatsApp   | User base, reliability | Tidak ada fitur astrologi          |
| Telegram   | Features, speed        | Tidak ada integrasi astrologi      |
| Bumble     | Dating focus           | Fokus pada dating, bukan chat umum |

### 4.4 Opportunity

Belum ada aplikasi chat populer yang mengintegrasikan fitur astrologi secara mendalam. Ini menjadi differentiator utama Zodiak Chat App.

---

## 5. User Personas

### 5.1 Persona A: Astrology Enthusiast - "Sarah"

**Demographics:**

- Umur: 24 tahun
- Pekerjaan: Marketing Specialist
- Lokasi: Jakarta

**Goals:**

- Berkomunikasi dengan teman yang memiliki interest sama tentang astrologi
- Mengetahui karakter orang berdasarkan zodiak sebelum berkomunikasi
- Mendapatkan rekomendasi konten horoskop harian

**Pain Points:**

- Sulit menemukan platform yang mengintegrasikan astrologi dengan chat
- Aplikasi astrology yang ada tidak memiliki fitur chat real-time

**Behavior:**

- Aktif di media sosial terkait astrologi
- Menggunakan aplikasi chat 5-10 kali per hari
- Membaca horoskop setiap pagi

---

### 5.2 Persona B: Social User - "Budi"

**Demographics:**

- Umur: 28 tahun
- Pekerjaan: Software Engineer
- Lokasi: Bandung

**Goals:**

- Berbagi konten dan berkomunikasi dengan teman
- Menemukan grup diskusi berdasarkan minat
- Pengalaman chat yang cepat dan andal

**Pain Points:**

- Aplikasi chat yang ada terasa generik
- Ingin pengalaman yang lebih personal

**Behavior:**

- Heavy user messaging (50+ pesan per hari) -重视kecepatan dan reliabilitas
- Mulai tertarik dengan astrologi setelah melihat fitur ini

---

### 5.3 Persona C: Curious Explorer - "Maya"

**Demographics:**

- Umur: 21 tahun
- Mahasiswa
- Lokasi: Surabaya

**Goals:**

- Menemukan teman baru denganinterest sama
- Eksplorasi topik baru termasuk astrologi
- Pengalaman yang fun dan engaging

**Pain Points:**

- Bingung memulai percakapan dengan stranger
- Ingin icebreaker yang natural

**Behavior:**

- Suka mencoba aplikasi baru
- Aktif di platform social
- Baru mengenal konsep zodiak/horoskop

---

## 6. Functional Requirements

### 6.1 Authentication Module

| ID       | Requirement                                   | Priority    |
| -------- | --------------------------------------------- | ----------- |
| AUTH-001 | User dapat register dengan email dan password | Must Have   |
| AUTH-002 | User dapat login dengan email dan password    | Must Have   |
| AUTH-003 | Sistem menghasilkan JWT token setelah login   | Must Have   |
| AUTH-004 | Token dienkripsi untuk keamanan               | Must Have   |
| AUTH-005 | User dapat logout                             | Should Have |
| AUTH-006 | Password minimal 8 karakter                   | Must Have   |

### 6.2 Profile Module

| ID                           | Requirement                                          | Priority    |
| ---------------------------- | ---------------------------------------------------- | ----------- |
| PROF-001                     | User dapat membuat profil                            | Must Have   |
| User dapat mengupdate profil | Must Have                                            |
| PROF-003                     | User dapat upload avatar                             | Must Have   |
| PROF-004                     | Sistem menghitung zodiak otomatis dari tanggal lahir | Must Have   |
| PROF-005                     | Sistem menghitung horoskop Chinese zodiac otomatis   | Must Have   |
| PROF-006                     | User dapat menambah interest                         | Should Have |
| PROF-007                     | User dapat melihat profil orang lain                 | Should Have |

### 6.3 Chat Module

| ID       | Requirement                                    | Priority    |
| -------- | ---------------------------------------------- | ----------- |
| CHAT-001 | User dapat membuat percakapan dengan user lain | Must Have   |
| CHAT-002 | User dapat mengirim pesan text                 | Must Have   |
| CHAT-003 | User dapat mengirim pesan gambar               | Should Have |
| CHAT-004 | User dapat melihat riwayat percakapan          | Must Have   |
| CHAT-005 | User dapat menandai pesan sudah dibaca         | Should Have |
| CHAT-006 | Percakapan real-time dengan latensi rendah     | Must Have   |

### 6.4 File Upload Module

| ID       | Requirement                       | Priority    |
| -------- | --------------------------------- | ----------- |
| FILE-001 | User dapat upload avatar gambar   | Must Have   |
| FILE-002 | User dapat upload gambar di chat  | Should Have |
| FILE-003 | Sistem menyimpan file di MinIO/S3 | Must Have   |
| FILE-004 | Sistem generate unique filename   | Must Have   |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric               | Target    |
| -------------------- | --------- |
| API Response Time    | < 200ms   |
| Chat Message Latency | < 500ms   |
| File Upload (1MB)    | < 3 detik |
| Concurrent Users     | 10,000+   |

### 7.2 Scalability

- Arsitektur microservices-ready
- Support horizontal scaling
- Database partitioning by user_id

### 7.3 Security

| Requirement        | Implementation             |
| ------------------ | -------------------------- |
| Password Hashing   | bcrypt with salt           |
| Token Encryption   | AES encryption (Cryptr)    |
| API Authentication | JWT                        |
| File Validation    | MIME type, file size limit |

### 7.4 Availability

- Uptime target: 99.5%
- Graceful degradation
- Error handling yang proper

### 7.5 Maintainability

- Clean code principles
- Comprehensive documentation
- Unit test coverage > 70%

---

## 8. Business Constraints

### 8.1 Budget Constraints

| Component      | Budget Allocation |
| -------------- | ----------------- |
| Development    | 60%               |
| Infrastructure | 25%               |
| Marketing      | 15%               |

### 8.2 Timeline Constraints

| Milestone     | Target Date |
| ------------- | ----------- |
| MVP Launch    | Q2 2026     |
| Beta Release  | Q3 2026     |
| Public Launch | Q4 2026     |

### 8.3 Resource Constraints

- Tim pengembang: 3-4 orang
- Infrastructure: Cloud-based (AWS/DigitalOcean)
- Tools: GitHub, Jira, Figma

---

## 9. Risk Analysis

### 9.1 Technical Risks

| Risk                 | Impact | Probability | Mitigation                             |
| -------------------- | ------ | ----------- | -------------------------------------- |
| Kafka latency tinggi | High   | Medium      | Optimasi konfigurasi, WebSocket hybrid |
| Database performance | High   | Low         | Indexing, caching                      |
| MinIO downtime       | Medium | Low         | Backup strategy                        |

### 9.2 Market Risks

| Risk                | Impact | Probability | Mitigation                           |
| ------------------- | ------ | ----------- | ------------------------------------ |
| Low user adoption   | High   | Medium      | Marketing campaign, referral program |
| Competitor response | Medium | High        | Fast iteration, unique features      |

### 9.3 Regulatory Risks

| Risk                   | Impact | Probability | Mitigation          |
| ---------------------- | ------ | ----------- | ------------------- |
| Data privacy violation | High   | Low         | GDPR/PDP compliance |
| Content moderation     | Medium | Medium      | AI-based filtering  |

---

## 10. Success Criteria

### 10.1 Launch Criteria

- [ ] Semua fitur Phase 1 berfungsi dengan baik
- [ ] Unit test coverage > 70%
- [ ] Security audit passed
- [ ] Load testing passed (10,000 concurrent users)
- [ ] Dokumentasi teknis lengkap

### 10.2 Post-Launch Metrics

- [ ] 10,000 registered users dalam 3 bulan
- [ ] DAU/MAU ratio > 30%
- [ ] Average session duration > 10 menit
- [ ] App store rating > 4.0

---

## Appendices

### A. Glossary

| Term      | Definition                                    |
| --------- | --------------------------------------------- |
| JWT       | JSON Web Token - standar untuk authentication |
| MinIO     | S3-compatible object storage                  |
| Kafka     | Distributed event streaming platform          |
| WebSocket | Protocol untuk real-time communication        |
| Zodiak    | Sistem astrologi Barat                        |
| Horoskop  | Ramalan berdasarkan posisi bintang            |

### B. References

- NestJS Documentation
- MongoDB Documentation
- Kafka Documentation
- MinIO Documentation
- JWT Specification (RFC 7519)

---

**Document Control**

| Version | Date       | Author           | Changes       |
| ------- | ---------- | ---------------- | ------------- |
| 1.0     | March 2026 | Development Team | Initial draft |
