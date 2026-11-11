import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_CONFIG, AppConfig } from "./app-config";

/**
 * Builds the typed AppConfig from environment variables.
 * The app refuses to start if a required value is missing.
 */
function resolveAppConfig(env: ConfigService): AppConfig {
  const config: AppConfig = {
    DATABASE_URL: env.get<string>("DATABASE_URL"),
    TOKEN_SECRET: env.get<string>("TOKEN_SECRET"),
  };

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  return config;
}

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: APP_CONFIG,
      inject: [ConfigService],
      useFactory: resolveAppConfig,
    },
  ],
  exports: [APP_CONFIG],
})
export class AppConfigModule {}
