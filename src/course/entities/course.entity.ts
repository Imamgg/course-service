import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  credits: number;

  @Column()
  semester: number;

  @Column()
  maxCapacity: number;

  @Column({ default: 0 })
  currentEnrollment: number;

  @Column({ default: 'active' })
  status: string;

  @Column({ nullable: true })
  instructor: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
