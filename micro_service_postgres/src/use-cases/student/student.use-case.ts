import { Injectable } from "@nestjs/common";
import { IDataServices, PaginatedResult } from "../../core/abstracts";
import {
  CreateStudentDto,
  PaginationQueryDto,
  UpdateStudentDto,
} from "../../core/dtos";
import { Student } from "../../core/entities";
import { ConflictError, NotFoundError } from "../../core/errors";
import { StudentFactoryService } from "./student-factory.service";

/**
 * USE-CASE LAYER: every business rule for students lives here.
 *
 * Allowed:   core (entities, dtos, abstracts, errors) and @Injectable for DI.
 * Forbidden: typeorm, express, HttpException, concrete services.
 *
 * Business rules:
 *  - A registration number belongs to exactly one student.
 */
@Injectable()
export class StudentUseCases {
  constructor(
    private readonly dataServices: IDataServices,
    private readonly studentFactory: StudentFactoryService,
  ) {}

  async createStudent(dto: CreateStudentDto): Promise<Student> {
    await this.assertRegNumberIsFree(dto.reg_number);

    const student = this.studentFactory.createNewStudent(dto);
    return this.dataServices.students.create(student);
  }

  async getStudents(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Student>> {
    const { page, limit } = query;
    const [data, total] = await Promise.all([
      this.dataServices.students.findWithPagination(
        {},
        (page - 1) * limit,
        limit,
        { created_at: -1, _id: -1 },
      ),
      this.dataServices.students.count({}),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getStudentById(id: string): Promise<Student> {
    const student = await this.dataServices.students.get(id);
    if (!student) throw new NotFoundError("Student");
    return student;
  }

  async updateStudent(id: string, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.getStudentById(id);
    if (dto.reg_number !== undefined && dto.reg_number !== student.reg_number) {
      await this.assertRegNumberIsFree(dto.reg_number);
    }

    const changes = this.studentFactory.updateStudent(dto);
    const updated = await this.dataServices.students.update(id, changes);
    if (!updated) throw new NotFoundError("Student");
    return updated;
  }

  async deleteStudent(id: string): Promise<void> {
    const deleted = await this.dataServices.students.delete(id);
    if (!deleted) throw new NotFoundError("Student");
  }

  private async assertRegNumberIsFree(regNumber: number): Promise<void> {
    const existing = await this.dataServices.students.findOne({
      reg_number: regNumber,
    });
    if (existing) {
      throw new ConflictError(
        `Registration number ${regNumber} is already in use`,
      );
    }
  }
}
