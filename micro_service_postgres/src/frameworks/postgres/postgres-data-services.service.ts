import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IDataServices, IGenericRepository } from "../../core/abstracts";
import { Student } from "../../core/entities";
import { Student as StudentModel } from "./model/student";
import { PostgresGenericRepository } from "./postgres-generic-repository";

/**
 * FRAMEWORKS LAYER: PostgreSQL implementation of IDataServices.
 * Adding an entity = one model file + one property here + one forFeature entry.
 */
@Injectable()
export class PostgresDataServices
  implements IDataServices, OnApplicationBootstrap
{
  students: IGenericRepository<Student>;

  constructor(
    @InjectRepository(StudentModel)
    private StudentRepository: Repository<Student>,
  ) {}

  onApplicationBootstrap() {
    this.students = new PostgresGenericRepository<Student>(
      this.StudentRepository,
    );
  }
}
