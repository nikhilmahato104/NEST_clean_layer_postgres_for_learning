import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ConflictError, DomainError, NotFoundError } from "../../core/errors";

interface ResolvedError {
  statusCode: number;
  message: string;
  errors?: string[];
}

/**
 * Turns every thrown error into one consistent JSON shape:
 *   { success: false, statusCode, message, errors?, path, timestamp }
 *
 * Domain errors are translated to HTTP here, so use-cases never import
 * HttpException. Unknown errors become a generic 500 and are logged; internal
 * details are never sent to the client.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { statusCode, message, errors } = this.resolve(exception);

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} failed`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      ...(errors && { errors }),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private resolve(exception: unknown): ResolvedError {
    if (exception instanceof DomainError) {
      return {
        statusCode: this.domainErrorStatus(exception),
        message: exception.message,
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === "object"
          ? (body as { message?: unknown }).message
          : body;

      // ValidationPipe reports every failed rule as an array in `message`.
      // Set removes repeats when several rules share one message.
      if (Array.isArray(message)) {
        return {
          statusCode,
          message: "Validation failed",
          errors: [...new Set(message.map(String))],
        };
      }
      return {
        statusCode,
        message: typeof message === "string" ? message : exception.message,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    };
  }

  /** Add a line here for each new DomainError subclass. */
  private domainErrorStatus(error: DomainError): HttpStatus {
    if (error instanceof NotFoundError) return HttpStatus.NOT_FOUND;
    if (error instanceof ConflictError) return HttpStatus.CONFLICT;
    return HttpStatus.BAD_REQUEST;
  }
}
