import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProduction = process.env.NODE_ENV === "prod";

  app.enableCors();
  app.enableShutdownHooks();

  // API docs are for development only.
  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Student API (PostgreSQL)")
      .setDescription(
        [
          "Every response uses the same JSON envelope.",
          "",
          '**Success:** `{ "success": true, "message": "...", "data": ... }`. Lists also include `meta` with pagination info.',
          "",
          '**Error:** `{ "success": false, "statusCode": 404, "message": "...", "errors": [...], "path": "...", "timestamp": "..." }`. `errors` is only present for 400 validation failures and lists one message per failed rule.',
          "",
          "Status codes: 200 OK, 201 created, 400 invalid input, 404 not found, 409 conflict (duplicate), 500 server error.",
        ].join("\n"),
      )
      .setVersion("1.0")
      .addBearerAuth(
        { type: "http", scheme: "Bearer", bearerFormat: "JWT" },
        "token",
      )
      .build();

    SwaggerModule.setup(
      "api",
      app,
      SwaggerModule.createDocument(app, swaggerConfig),
      { swaggerOptions: { persistAuthorization: true } },
    );
  }

  const port = Number(process.env.PORT) || (isProduction ? 3006 : 3005);
  await app.listen(port);
  Logger.log(
    `Server running on port ${port} (${process.env.NODE_ENV ?? "local"})`,
    "Bootstrap",
  );
}

bootstrap();
