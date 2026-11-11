import { Module } from "@nestjs/common";
import { DataServicesModule } from "../../services/data-services/data-services.module";
import { StudentFactoryService } from "./student-factory.service";
import { StudentUseCases } from "./student.use-case";

/**
 * Imports DataServicesModule (which provides IDataServices), never a
 * frameworks/* module directly. That keeps this module database-agnostic.
 */
@Module({
  imports: [DataServicesModule],
  providers: [StudentFactoryService, StudentUseCases],
  exports: [StudentUseCases],
})
export class StudentUseCasesModule {}
