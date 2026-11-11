/**
 * CORE LAYER: the repository contract every database must implement.
 * No database imports here (no typeorm, no mongoose). Use-cases depend on this
 * contract, never on the Postgres implementation.
 */

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class IGenericRepository<T> {
  abstract getAll(): Promise<T[]>;

  /** Returns null when the id is malformed or not found. */
  abstract get(id: string): Promise<T | null>;

  abstract getWithPopulate(
    id: string,
    populate: string | string[],
  ): Promise<T | null>;

  abstract create(item: T, session?: any): Promise<T>;

  /** Returns the updated record, or null when the id is malformed or not found. */
  abstract update(
    id: string,
    item: Partial<T>,
    session?: any,
  ): Promise<T | null>;

  abstract find(filter: any, session?: any): Promise<T[]>;

  abstract findWithPagination(
    filter: any,
    skip: number,
    limit: number,
    sort?: any,
    session?: any,
  ): Promise<T[]>;

  abstract findWithSortAndLimit(
    filter: any,
    sort: any,
    limit: number,
    session?: any,
  ): Promise<T[]>;

  abstract count(filter: any, session?: any): Promise<number>;

  abstract findOne(filter: any, session?: any): Promise<T | null>;

  /** Hard delete. Returns the deleted record, or null when nothing matched. */
  abstract delete(id: string, session?: any): Promise<T | null>;

  abstract findUnique(data: any, session?: any): Promise<T | null>;

  abstract updateMany(filter: any, update: any, session?: any): Promise<any>;

  abstract aggregate<R = any>(pipeline: any[], session?: any): Promise<R[]>;

  abstract aggregateWithPagination<R = any>(
    pipeline: any[],
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<R>>;

  abstract buildLookupStage(
    from: string,
    localField: string,
    foreignField?: string,
    as?: string,
    preserveNull?: boolean,
  ): any[];
}
