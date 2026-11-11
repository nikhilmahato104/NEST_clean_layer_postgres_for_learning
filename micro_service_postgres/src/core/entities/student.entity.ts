/**
 * CORE LAYER: the Student business object.
 * Plain TypeScript only. No decorators, no typeorm, no NestJS.
 */
export class Student {
  _id?: string;
  name: string;
  reg_number: number;
  dob: Date;
  created_at?: Date;
  updated_at?: Date;
}
