import { Student } from "../entities";
import { IGenericRepository } from "./generic-repository.abstract";

/**
 * CORE LAYER: the single entry point use-cases use to reach data.
 * Use-cases inject this abstract class and never know the database is PostgreSQL.
 * The concrete class is bound in frameworks/postgres/postgres-data-service.module.ts.
 */
export abstract class IDataServices {
  abstract readonly students: IGenericRepository<Student>;
}
