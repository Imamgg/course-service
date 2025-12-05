import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { Course } from '../course/entities/course.entity';
import { CreateEnrollmentDto } from './dto/enrollment.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private redisService: RedisService,
    private dataSource: DataSource,
  ) {}

  async enroll(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    const { studentNim, courseId } = createEnrollmentDto;
    const lockKey = `enrollment:lock:${courseId}`;

    // Acquire distributed lock using Redis
    const lockAcquired = await this.redisService.acquireLock(lockKey, 5000);
    if (!lockAcquired) {
      throw new BadRequestException('Unable to acquire lock. Please try again.');
    }

    try {
      // Use transaction with SELECT FOR UPDATE
      const result = await this.dataSource.transaction(async (manager) => {
        // Lock the course row
        const course = await manager
          .createQueryBuilder(Course, 'course')
          .setLock('pessimistic_write')
          .where('course.id = :id', { id: courseId })
          .getOne();

        if (!course) {
          throw new BadRequestException('Course not found');
        }

        if (course.currentEnrollment >= course.maxCapacity) {
          throw new BadRequestException('Course is full');
        }

        // Check if already enrolled
        const existing = await manager.findOne(Enrollment, {
          where: { studentNim, courseId },
        });

        if (existing) {
          throw new ConflictException('Student already enrolled in this course');
        }

        // Create enrollment
        const enrollment = manager.create(Enrollment, createEnrollmentDto);
        await manager.save(enrollment);

        // Increment enrollment count
        course.currentEnrollment += 1;
        await manager.save(course);

        return enrollment;
      });

      return result;
    } finally {
      // Always release the lock
      await this.redisService.releaseLock(lockKey);
    }
  }

  async findAll(): Promise<Enrollment[]> {
    return this.enrollmentRepository.find();
  }

  async findByStudent(studentNim: string): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({ where: { studentNim } });
  }

  async findByCourse(courseId: number): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({ where: { courseId } });
  }

  async unenroll(id: number): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({ where: { id } });
    if (!enrollment) {
      throw new BadRequestException('Enrollment not found');
    }

    const lockKey = `enrollment:lock:${enrollment.courseId}`;
    const lockAcquired = await this.redisService.acquireLock(lockKey, 5000);
    
    if (!lockAcquired) {
      throw new BadRequestException('Unable to acquire lock. Please try again.');
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        await manager.remove(enrollment);

        const course = await manager.findOne(Course, {
          where: { id: enrollment.courseId },
        });

        if (course && course.currentEnrollment > 0) {
          course.currentEnrollment -= 1;
          await manager.save(course);
        }
      });
    } finally {
      await this.redisService.releaseLock(lockKey);
    }
  }
}
