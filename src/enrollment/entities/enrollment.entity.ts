import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('enrollments')
@Unique(['studentNim', 'courseId'])
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentNim: string;

  @Column()
  courseId: number;

  @Column({ default: 'enrolled' })
  status: string;

  @Column({ nullable: true })
  grade: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  gradeValue: number;

  @CreateDateColumn()
  enrolledAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
