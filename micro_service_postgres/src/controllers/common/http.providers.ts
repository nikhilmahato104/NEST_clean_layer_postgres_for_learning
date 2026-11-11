import { Provider, ValidationPipe } from "@nestjs/common";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { GlobalExceptionFilter } from "./global-exception.filter";

/**
 * Global HTTP behaviour: input validation and error format.
 * AppModule and the tests both use this list, so they behave identically.
 */
export const GLOBAL_HTTP_PROVIDERS: Provider[] = [
  {
    provide: APP_PIPE,
    useValue: new ValidationPipe({
      whitelist: true, // strip fields that are not in the DTO
      forbidNonWhitelisted: true, // ...and reject the request if any were sent
      transform: true, // give handlers real DTO instances with defaults applied
    }),
  },
  { provide: APP_FILTER, useClass: GlobalExceptionFilter },
];
