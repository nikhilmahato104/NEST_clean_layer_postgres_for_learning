import { ApiProperty, PartialType } from "@nestjs/swagger";
import { Transform, TransformFnParams } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { IsPastDateDdMmYyyy } from "./validators/date-dd-mm-yyyy.validator";

/**
 * CORE LAYER: input contracts for the Student use-cases.
 * The decorators describe valid input. The global ValidationPipe
 * (controllers/common/http.providers.ts) enforces them before a use-case runs.
 */

/** Removes leading/trailing spaces before validation: "  Rohit  " -> "Rohit". */
const trim = ({ value }: TransformFnParams): unknown =>
  typeof value === "string" ? value.trim() : value;

const REG_NUMBER_MESSAGE =
  "reg_number must be an 8-digit number (e.g. 12205416)";

export class CreateStudentDto {
  @ApiProperty({
    example: "Rohit Sharma",
    maxLength: 100,
    description:
      "Full name, max 100 characters. Leading/trailing spaces are removed.",
  })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 12205416,
    minimum: 10000000,
    maximum: 99999999,
    description:
      'Exactly 8 digits, sent as a JSON number (12205416, not "12205416"). Must be unique.',
  })
  @IsInt({ message: REG_NUMBER_MESSAGE })
  @Min(10000000, { message: REG_NUMBER_MESSAGE })
  @Max(99999999, { message: REG_NUMBER_MESSAGE })
  reg_number: number;

  @ApiProperty({
    example: "15-08-2005",
    description:
      "Date of birth in DD-MM-YYYY format. Must be a real date, not in the future.",
  })
  @Transform(trim)
  @IsPastDateDdMmYyyy()
  dob: string;
}

/** Every field is optional. Only the fields that are sent get updated. */
export class UpdateStudentDto extends PartialType(CreateStudentDto) {}
