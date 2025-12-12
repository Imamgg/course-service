# Course Service

Service untuk manajemen mata kuliah dan enrollment dalam Sistem SIAKAD Terdistribusi.

## Fitur

- ✅ CRUD Mata Kuliah
- ✅ Enrollment Mahasiswa (Transaction-safe)
- ✅ SELECT FOR UPDATE untuk race condition prevention
- ✅ Redis Distributed Locking
- ✅ Integrasi RabbitMQ
- ✅ Capacity Management

## Konfigurasi

Port: **3002**  
IP VM: **192.168.10.13**

## Environment Variables

```env
PORT=3002
DB_HOST=192.168.10.16
DB_PORT=3306
DB_USERNAME=siakad_app
DB_PASSWORD=admin
DB_DATABASE=siakad
REDIS_HOST=192.168.10.15
REDIS_PORT=6379
RABBITMQ_URL=amqp://192.168.10.15:5672
```

## Install Dependencies

```bash
npm install
```

## Run

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

### Course Management

- `POST /api/courses` - Buat mata kuliah baru
- `GET /api/courses` - Ambil semua mata kuliah
- `GET /api/courses?semester=1` - Filter by semester
- `GET /api/courses/:id` - Detail mata kuliah
- `GET /api/courses/code/:code` - Cari by kode mata kuliah
- `PATCH /api/courses/:id` - Update mata kuliah
- `DELETE /api/courses/:id` - Hapus mata kuliah

### Enrollment Management

- `POST /api/enrollments` - Daftar mata kuliah (dengan locking)
- `GET /api/enrollments` - Semua enrollment
- `GET /api/enrollments?studentNim=2024001` - Enrollment by mahasiswa
- `GET /api/enrollments?courseId=1` - Enrollment by mata kuliah
- `DELETE /api/enrollments/:id` - Batalkan enrollment

## Request Examples

```bash
# Buat mata kuliah
curl -X POST http://192.168.10.13:3002/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "code":"IF101",
    "name":"Pemrograman Dasar",
    "credits":3,
    "semester":1,
    "maxCapacity":40,
    "instructor":"Dr. Budi"
  }'

# Enrollment (dengan Redis lock & transaction)
curl -X POST http://192.168.10.13:3002/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{
    "studentNim":"2024001",
    "courseId":1
  }'
```

## Fitur Keamanan Enrollment

Sistem menggunakan **dua layer protection**:

1. **Redis Distributed Lock** - Mencegah race condition antar request
2. **SELECT FOR UPDATE** - Pessimistic locking di database level

Proses enrollment:

```typescript
// 1. Acquire Redis lock
await redisService.acquireLock(`enrollment:lock:${courseId}`);

// 2. Transaction dengan SELECT FOR UPDATE
await manager
  .createQueryBuilder(Course, "course")
  .setLock("pessimistic_write")
  .where("course.id = :id", { id: courseId })
  .getOne();

// 3. Check capacity & create enrollment
// 4. Release lock
```

## Database Schema

```sql
CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  credits INT NOT NULL,
  semester INT NOT NULL,
  maxCapacity INT NOT NULL,
  currentEnrollment INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  instructor VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE enrollments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  studentNim VARCHAR(20) NOT NULL,
  courseId INT NOT NULL,
  status VARCHAR(20) DEFAULT 'enrolled',
  grade VARCHAR(2),
  gradeValue DECIMAL(5,2),
  enrolledAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_enrollment (studentNim, courseId)
);
```

## Deployment ke VM

1. Copy folder `course-service` ke VM3
2. Pastikan Redis sudah running di VM5 (192.168.10.15)
3. Pastikan RabbitMQ sudah running di VM5
4. Konfigurasi `.env`
5. Jalankan `npm install`
6. Jalankan `npm run start:prod`
