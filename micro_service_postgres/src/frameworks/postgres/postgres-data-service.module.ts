import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IDataServices } from "../../core/abstracts";
import { APP_CONFIG, AppConfig } from "../../services/config/app-config";
import { AppConfigModule } from "../../services/config/app-config.module";
import { Student } from "./model/student";
import { PostgresDataServices } from "./postgres-data-services.service";

/**
 * FRAMEWORKS LAYER: connects to PostgreSQL and binds the abstract IDataServices
 * to the Postgres implementation. This is the dependency-inversion point.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => ({
        type: "postgres",
        url: config.DATABASE_URL,
        autoLoadEntities: true,
        // Schema changes are applied manually from /migrations, so the app never
        // alters the schema itself, on dev or prod. See migrations/README.md.
        synchronize: false,
        migrationsRun: false,
      }),
    }),
  ],
  providers: [{ provide: IDataServices, useClass: PostgresDataServices }],
  exports: [IDataServices],
})
export class PostgresDataServiceModule {}
