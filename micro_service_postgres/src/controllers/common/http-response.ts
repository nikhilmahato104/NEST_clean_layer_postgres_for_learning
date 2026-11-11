import { PaginatedResult } from "../../core/abstracts";

export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends SuccessResponse<T[]> {
  meta: { page: number; limit: number; total: number; totalPages: number };
}

/**
 * Builds the success envelope every endpoint returns.
 * Errors use the matching shape via GlobalExceptionFilter.
 */
export class HttpResponse {
  static ok<T>(data: T, message: string): SuccessResponse<T> {
    return { success: true, message, data };
  }

  static paginated<T>(
    result: PaginatedResult<T>,
    message: string,
  ): PaginatedResponse<T> {
    const { data, ...meta } = result;
    return { success: true, message, data, meta };
  }
}
