import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  credits: number;

  @IsNumber()
  @IsNotEmpty()
  semester: number;

  @IsNumber()
  @IsNotEmpty()
  maxCapacity: number;

  @IsString()
  @IsOptional()
  instructor?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  credits?: number;

  @IsNumber()
  @IsOptional()
  semester?: number;

  @IsNumber()
  @IsOptional()
  maxCapacity?: number;

  @IsString()
  @IsOptional()
  instructor?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
