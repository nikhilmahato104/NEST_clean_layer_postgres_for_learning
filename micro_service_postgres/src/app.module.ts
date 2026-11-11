import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { GLOBAL_HTTP_PROVIDERS } from "./controllers/common/http.providers";
import { StudentController } from "./controllers/student.controller";
import { AppConfigModule } from "./services/config/app-config.module";
import { StudentUseCasesModule } from "./use-cases/student/student-use-cases.module";

/**
 * Composition root: wires controllers to use-case modules.
 *
 * Request flow:
 *   Controller -> UseCase -> IDataServices (core) -> PostgresDataServices (frameworks) -> PostgreSQL
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
    }),
    AppConfigModule,
    // Kept for protected endpoints: add @UseGuards(AuthGuard) to a controller to require a JWT.
    JwtModule.register({ global: true }),
    StudentUseCasesModule,
  ],
  controllers: [AppController, StudentController],
  providers: [AppService, ...GLOBAL_HTTP_PROVIDERS],
})
export class AppModule {}
