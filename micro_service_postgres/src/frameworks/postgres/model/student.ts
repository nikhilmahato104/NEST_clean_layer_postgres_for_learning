import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  ValueTransformer,
} from "typeorm";

/** Saves text without leading/trailing spaces (Postgres has no Mongoose-style `trim: true`). */
const trim: ValueTransformer = {
  to: (value: unknown) => (typeof value === "string" ? value.trim() : value),
  from: (value: unknown) => value,
};

/**
 * FRAMEWORKS LAYER: how a Student is stored in PostgreSQL.
 * This is the only place that knows about tables, columns and TypeORM
 * decorators. The core Student entity stays database-free.
 *
 * The table itself is created by migrations/20261111012603_create_students.sql.
 * Keep this class and the migration files in step: change both together.
 */
@Entity({ name: "students" })
@Unique("uq_students_reg_number", ["reg_number"])
@Check(
  "ck_students_reg_number_8_digits",
  `"reg_number" BETWEEN 10000000 AND 99999999`,
)
export class Student {
  // The property stays `_id` so API responses match the Mongo version;
  // the column itself uses the usual Postgres name `id`.
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  _id: string;

  // trim: the name is always saved without leading/trailing spaces.
  @Column({ type: "varchar", length: 100, transformer: trim })
  name: string;

  @Column({ type: "integer" })
  reg_number: number;

  // timestamptz keeps the response format the same as Mongo: "2005-08-15T00:00:00.000Z".
  @Column({ type: "timestamptz" })
  dob: Date;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updated_at: Date;
}
