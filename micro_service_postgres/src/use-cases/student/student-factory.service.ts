import { Injectable } from "@nestjs/common";
import { CreateStudentDto, UpdateStudentDto } from "../../core/dtos";
import { parseDdMmYyyy } from "../../core/dtos/validators/date-dd-mm-yyyy.validator";
import { Student } from "../../core/entities";

/**
 * USE-CASE LAYER: turns API input (DTOs) into domain entities.
 * Keeping this mapping in one place means a change to the API shape never
 * leaks into the entity or the database, and vice versa.
 * Example: the API takes dob as "15-08-2005"; the entity stores a real Date.
 */
@Injectable()
export class StudentFactoryService {
  createNewStudent(dto: CreateStudentDto): Student {
    const student = new Student();
    student.name = dto.name;
    student.reg_number = dto.reg_number;
    student.dob = parseDdMmYyyy(dto.dob);
    return student;
  }

  /** Copies only the fields the client actually sent. */
  updateStudent(dto: UpdateStudentDto): Partial<Student> {
    const changes: Partial<Student> = {};
    if (dto.name !== undefined) changes.name = dto.name;
    if (dto.reg_number !== undefined) changes.reg_number = dto.reg_number;
    if (dto.dob !== undefined) changes.dob = parseDdMmYyyy(dto.dob);
    return changes;
  }
}
