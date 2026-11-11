import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import {
  CreateStudentDto,
  PaginationQueryDto,
  UpdateStudentDto,
} from "../core/dtos";
import { StudentUseCases } from "../use-cases/student/student.use-case";
import { HttpResponse } from "./common/http-response";
import {
  CreateStudentDocs,
  DeleteStudentDocs,
  GetStudentDocs,
  ListStudentsDocs,
  UpdateStudentDocs,
} from "./docs/student.docs";

/**
 * CONTROLLER LAYER: HTTP in, HTTP out. No business logic.
 * Every handler does three things: receive a validated DTO, call ONE use-case
 * method, wrap the result. Swagger docs live in ./docs/student.docs.ts.
 */
@ApiTags("Students")
@Controller("api/students")
export class StudentController {
  constructor(private readonly studentUseCases: StudentUseCases) {}

  @Post()
  @CreateStudentDocs()
  async create(@Body() dto: CreateStudentDto) {
    const student = await this.studentUseCases.createStudent(dto);
    return HttpResponse.ok(student, "Student created successfully");
  }

  @Get()
  @ListStudentsDocs()
  async findAll(@Query() query: PaginationQueryDto) {
    const result = await this.studentUseCases.getStudents(query);
    return HttpResponse.paginated(result, "Students fetched successfully");
  }

  @Get(":id")
  @GetStudentDocs()
  async findOne(@Param("id") id: string) {
    const student = await this.studentUseCases.getStudentById(id);
    return HttpResponse.ok(student, "Student fetched successfully");
  }

  @Patch(":id")
  @UpdateStudentDocs()
  async update(@Param("id") id: string, @Body() dto: UpdateStudentDto) {
    const student = await this.studentUseCases.updateStudent(id, dto);
    return HttpResponse.ok(student, "Student updated successfully");
  }

  @Delete(":id")
  @DeleteStudentDocs()
  async remove(@Param("id") id: string) {
    await this.studentUseCases.deleteStudent(id);
    return HttpResponse.ok(null, "Student deleted successfully");
  }
}
