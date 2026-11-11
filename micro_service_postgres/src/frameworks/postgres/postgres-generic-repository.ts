import { isUUID } from "class-validator";
import {
  DeepPartial,
  EntityManager,
  FindOptionsOrder,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from "typeorm";
import { IGenericRepository, PaginatedResult } from "../../core/abstracts";

type SortInput = Record<string, 1 | -1 | "asc" | "desc">;

/**
 * FRAMEWORKS LAYER: PostgreSQL (TypeORM) implementation of IGenericRepository.
 * Same contract as the Mongo version, so use-cases and controllers do not change.
 *
 * Translations done here, and only here:
 *  - sort `{ created_at: -1 }` -> TypeORM order `{ created_at: "DESC" }`
 *  - malformed uuid -> null (Postgres would otherwise throw and return a 500)
 *  - `session` is a TypeORM EntityManager, e.g. from `dataSource.transaction(...)`
 */
export class PostgresGenericRepository<T extends ObjectLiteral>
  implements IGenericRepository<T>
{
  private _repository: Repository<T>;
  private _relationsOnFind: string[];

  constructor(repository: Repository<T>, relationsOnFind: string[] = []) {
    this._repository = repository;
    this._relationsOnFind = relationsOnFind;
  }

  getAll(): Promise<T[]> {
    return this._repository.find({ relations: this._relationsOnFind });
  }

  async get(id: string): Promise<T | null> {
    if (!isUUID(id)) return null;
    return this._repository.findOne({
      where: this.byId(id),
      relations: this._relationsOnFind,
    });
  }

  async getWithPopulate(
    id: string,
    populate: string | string[],
  ): Promise<T | null> {
    if (!isUUID(id)) return null;
    return this._repository.findOne({
      where: this.byId(id),
      relations: Array.isArray(populate) ? populate : [populate],
    });
  }

  create(item: T, session?: EntityManager): Promise<T> {
    const repo = this.repo(session);
    return repo.save(repo.create(item as DeepPartial<T>));
  }

  async update(
    id: string,
    item: Partial<T>,
    session?: EntityManager,
  ): Promise<T | null> {
    if (!isUUID(id)) return null;
    const repo = this.repo(session);
    const existing = await repo.findOne({ where: this.byId(id) });
    if (!existing) return null;
    return repo.save(repo.merge(existing, item as DeepPartial<T>));
  }

  find(filter: FindOptionsWhere<T>, session?: EntityManager): Promise<T[]> {
    return this.repo(session).find({ where: filter });
  }

  findWithPagination(
    filter: FindOptionsWhere<T>,
    skip: number,
    limit: number,
    sort?: SortInput,
    session?: EntityManager,
  ): Promise<T[]> {
    return this.repo(session).find({
      where: filter,
      skip,
      take: limit,
      order: this.toOrder(sort),
    });
  }

  findWithSortAndLimit(
    filter: FindOptionsWhere<T>,
    sort: SortInput,
    limit: number,
    session?: EntityManager,
  ): Promise<T[]> {
    return this.repo(session).find({
      where: filter,
      order: this.toOrder(sort),
      take: limit,
    });
  }

  count(filter: FindOptionsWhere<T>, session?: EntityManager): Promise<number> {
    return this.repo(session).count({ where: filter });
  }

  findOne(
    filter: FindOptionsWhere<T>,
    session?: EntityManager,
  ): Promise<T | null> {
    return this.repo(session).findOne({ where: filter });
  }

  async delete(id: string, session?: EntityManager): Promise<T | null> {
    if (!isUUID(id)) return null;
    const repo = this.repo(session);
    const existing = await repo.findOne({ where: this.byId(id) });
    if (!existing) return null;
    const deleted = { ...existing }; // remove() clears the id on the object it removes
    await repo.remove(existing);
    return deleted;
  }

  findUnique(
    data: FindOptionsWhere<T>,
    session?: EntityManager,
  ): Promise<T | null> {
    return this.repo(session).findOne({
      where: data,
      relations: this._relationsOnFind,
    });
  }

  updateMany(
    filter: FindOptionsWhere<T>,
    update: Partial<T>,
    session?: EntityManager,
  ): Promise<any> {
    return this.repo(session).update(filter, update);
  }

  // ---------------------------------------------------------------------------
  // MongoDB-only operations. Postgres has no aggregation pipelines or $lookup.
  // For joins/reports, add a QueryBuilder method in an entity-specific
  // repository (e.g. PostgresBookingRepository extends PostgresGenericRepository).
  // ---------------------------------------------------------------------------

  aggregate<R = any>(): Promise<R[]> {
    return Promise.reject(this.mongoOnly("aggregate"));
  }

  aggregateWithPagination<R = any>(): Promise<PaginatedResult<R>> {
    return Promise.reject(this.mongoOnly("aggregateWithPagination"));
  }

  buildLookupStage(): any[] {
    throw this.mongoOnly("buildLookupStage");
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** Uses the transaction's EntityManager when one is passed in. */
  private repo(session?: EntityManager): Repository<T> {
    return session
      ? session.getRepository<T>(this._repository.target)
      : this._repository;
  }

  /** `{ <primary key>: id }`, using the entity's own primary key name. */
  private byId(id: string): FindOptionsWhere<T> {
    const key = this._repository.metadata.primaryColumns[0].propertyName;
    return { [key]: id } as FindOptionsWhere<T>;
  }

  /** Mongo-style `{ field: -1 | 1 }` to TypeORM `{ field: "DESC" | "ASC" }`. */
  private toOrder(sort?: SortInput): FindOptionsOrder<T> | undefined {
    if (!sort) return undefined;
    const order: Record<string, "ASC" | "DESC"> = {};
    for (const [key, direction] of Object.entries(sort)) {
      order[key] = direction === -1 || direction === "desc" ? "DESC" : "ASC";
    }
    return order as FindOptionsOrder<T>;
  }

  private mongoOnly(method: string): Error {
    return new Error(
      `${method}() is MongoDB-only and is not available on PostgreSQL. Use a QueryBuilder in an entity-specific repository.`,
    );
  }
}
