import { Module } from "@nestjs/common";
import { PostgresDataServiceModule } from "../../frameworks/postgres/postgres-data-service.module";

/**
 * COMPOSITION: chooses which database implementation the app uses.
 * Use-case modules import THIS module, never frameworks/* directly.
 * Switching databases means changing this one import.
 */
@Module({
  imports: [PostgresDataServiceModule],
  exports: [PostgresDataServiceModule],
})
export class DataServicesModule {}
