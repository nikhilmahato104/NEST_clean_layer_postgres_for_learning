import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * CONTROLLER LAYER: Swagger shapes for the response envelope that every
 * endpoint returns (built in controllers/common/http-response.ts and
 * controllers/common/global-exception.filter.ts). Documentation only.
 */

const EXAMPLE_TIMESTAMP = "2026-11-10T09:30:00.000Z";

export class PaginationMetaDoc {
  @ApiProperty({ example: 2, description: "Total number of records." })
  total: number;

  @ApiProperty({ example: 1, description: "Current page (starts at 1)." })
  page: number;

  @ApiProperty({ example: 20, description: "Records per page." })
  limit: number;

  @ApiProperty({ example: 1, description: "Total number of pages." })
  totalPages: number;
}

export class ErrorResponseDoc {
  @ApiProperty({ example: false, description: "Always false for errors." })
  success: boolean;

  @ApiProperty({ example: 404, description: "Same as the HTTP status code." })
  statusCode: number;

  @ApiProperty({
    example: "Student not found",
    description: "Short, human-readable reason. Safe to show to users.",
  })
  message: string;

  @ApiPropertyOptional({
    type: [String],
    example: ["name should not be empty"],
    description:
      "Only for 400 validation errors: one message per failed rule. Show these next to the form fields.",
  })
  errors?: string[];

  @ApiProperty({ example: "/api/students/abc", description: "Request path." })
  path: string;

  @ApiProperty({
    example: EXAMPLE_TIMESTAMP,
    description: "When the error happened (ISO, UTC).",
  })
  timestamp: string;
}

export function okExample<T>(message: string, data: T) {
  return { success: true, message, data };
}

export function errorExample(
  statusCode: number,
  message: string,
  path: string,
  errors?: string[],
) {
  return {
    success: false,
    statusCode,
    message,
    ...(errors && { errors }),
    path,
    timestamp: EXAMPLE_TIMESTAMP,
  };
}
