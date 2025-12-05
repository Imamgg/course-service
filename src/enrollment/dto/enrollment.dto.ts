import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateEnrollmentDto {
  @IsString()
  @IsNotEmpty()
  studentNim: string;

  @IsNumber()
  @IsNotEmpty()
  courseId: number;
}
