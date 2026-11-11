/** Injection token for the resolved application config. */
export const APP_CONFIG = "APP_CONFIG";

/**
 * Only the settings this app actually uses, read from .env.<NODE_ENV>.
 * Add a key here (and to .env.example) when a feature needs it.
 */
export interface AppConfig {
  DATABASE_URL: string;
  TOKEN_SECRET: string;
}
