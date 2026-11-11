/**
 * CORE LAYER: business errors.
 * Use-cases throw these instead of HTTP exceptions. The HTTP layer
 * (controllers/common/global-exception.filter.ts) decides the status code.
 */
export abstract class DomainError extends Error {
  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(entityName: string) {
    super(`${entityName} not found`);
  }
}

/** The request clashes with existing data, e.g. a duplicate unique value. */
export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}
