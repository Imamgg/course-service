import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/enrollment.dto';

@Controller('api/enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  enroll(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentService.enroll(createEnrollmentDto);
  }

  @Get()
  findAll(
    @Query('studentNim') studentNim?: string,
    @Query('courseId') courseId?: string,
  ) {
    if (studentNim) {
      return this.enrollmentService.findByStudent(studentNim);
    }
    if (courseId) {
      return this.enrollmentService.findByCourse(+courseId);
    }
    return this.enrollmentService.findAll();
  }

  @Delete(':id')
  unenroll(@Param('id') id: string) {
    return this.enrollmentService.unenroll(+id);
  }
}
