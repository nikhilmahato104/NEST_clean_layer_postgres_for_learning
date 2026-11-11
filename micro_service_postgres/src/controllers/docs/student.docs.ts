import { applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
} from "@nestjs/swagger";
import { CreateStudentDto, UpdateStudentDto } from "../../core/dtos";
import {
  ErrorResponseDoc,
  errorExample,
  okExample,
  PaginationMetaDoc,
} from "./common.docs";

/**
 * CONTROLLER LAYER: Swagger documentation for /api/students.
 * Kept out of the controller so the controller stays short. The examples
 * mirror real responses, so update them whenever the API changes.
 */

// ---------------------------------------------------------------------------
// Example data (copied from real responses)
// ---------------------------------------------------------------------------

const STUDENT = {
  _id: "3f6c1d2e-8b4a-4c9e-9f1a-2b7d5e8c4a10",
  name: "Rohit Sharma",
  reg_number: 12205416,
  dob: "2005-08-15T00:00:00.000Z",
  created_at: "2026-11-10T09:30:00.000Z",
  updated_at: "2026-11-10T09:30:00.000Z",
};

const OTHER_STUDENT = {
  _id: "9a2e4b7c-1d3f-4e5a-8b6c-7d9e0f1a2b3c",
  name: "Priya Verma",
  reg_number: 12205417,
  dob: "2004-02-29T00:00:00.000Z",
  created_at: "2026-11-10T09:31:00.000Z",
  updated_at: "2026-11-10T09:31:00.000Z",
};

const STUDENT_PATH = `/api/students/${STUDENT._id}`;

const REG_NUMBER_ERROR = "reg_number must be an 8-digit number (e.g. 12205416)";
const DOB_FORMAT_ERROR =
  "dob must be a valid date in DD-MM-YYYY format (e.g. 15-08-2005)";

const FIELD_RULES = [
  "**Field rules**",
  "- `name`: text, max 100 characters. Leading/trailing spaces are removed before saving.",
  "- `reg_number`: a JSON **number** (not a string) with exactly 8 digits, e.g. `12205416`. Must be unique.",
  "- `dob`: text in `DD-MM-YYYY` format, e.g. `15-08-2005`. Must be a real date and not in the future.",
].join("\n");

const DOB_RESPONSE_NOTE = [
  "**Date of birth in the response**",
  "You send `dob` as `DD-MM-YYYY`, but the response returns it as an ISO date-time in UTC: `2005-08-15T00:00:00.000Z`.",
  "To display it, take the first 10 characters (`2005-08-15`) and reorder them. Do not convert it to local time, or users west of UTC will see the previous day.",
].join("\n");

// ---------------------------------------------------------------------------
// Response shapes
// ---------------------------------------------------------------------------

class StudentDoc {
  @ApiProperty({
    example: STUDENT._id,
    format: "uuid",
    description: "Unique id (UUID). Use it in `/api/students/{id}`.",
  })
  _id: string;

  @ApiProperty({ example: STUDENT.name })
  name: string;

  @ApiProperty({ example: STUDENT.reg_number, description: "8-digit number." })
  reg_number: number;

  @ApiProperty({
    example: STUDENT.dob,
    format: "date-time",
    description: "Date of birth as ISO date-time (UTC midnight).",
  })
  dob: string;

  @ApiProperty({ example: STUDENT.created_at, format: "date-time" })
  created_at: string;

  @ApiProperty({ example: STUDENT.updated_at, format: "date-time" })
  updated_at: string;
}

class StudentResponseDoc {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: "Student fetched successfully" })
  message: string;

  @ApiProperty({ type: StudentDoc })
  data: StudentDoc;
}

class StudentListResponseDoc {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: "Students fetched successfully" })
  message: string;

  @ApiProperty({ type: [StudentDoc], description: "Newest student first." })
  data: StudentDoc[];

  @ApiProperty({ type: PaginationMetaDoc })
  meta: PaginationMetaDoc;
}

class StudentDeletedResponseDoc {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: "Student deleted successfully" })
  message: string;

  @ApiProperty({
    type: Object,
    nullable: true,
    example: null,
    description: "Always null.",
  })
  data: null;
}

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

const idParam = () =>
  ApiParam({
    name: "id",
    description: "The student's `_id` from the create or list response.",
    example: STUDENT._id,
  });

const notFound = () =>
  ApiNotFoundResponse({
    description:
      "No student with this id. Also returned for a malformed id or a student that was already deleted.",
    type: ErrorResponseDoc,
    example: errorExample(404, "Student not found", STUDENT_PATH),
  });

const regNumberTaken = (path: string) =>
  ApiConflictResponse({
    description: "Another student already has this `reg_number`.",
    type: ErrorResponseDoc,
    example: errorExample(
      409,
      "Registration number 12205416 is already in use",
      path,
    ),
  });

// ---------------------------------------------------------------------------
// One decorator per endpoint
// ---------------------------------------------------------------------------

export const CreateStudentDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: "Create a student",
      description: [
        "Creates a new student. No login token is needed.",
        FIELD_RULES,
        DOB_RESPONSE_NOTE,
      ].join("\n\n"),
    }),
    ApiBody({
      type: CreateStudentDto,
      examples: {
        valid: {
          summary: "Valid student",
          value: {
            name: "Rohit Sharma",
            reg_number: 12205416,
            dob: "15-08-2005",
          },
        },
      },
    }),
    ApiCreatedResponse({
      description: "Student created. `data` is the saved student.",
      type: StudentResponseDoc,
      example: okExample("Student created successfully", STUDENT),
    }),
    ApiBadRequestResponse({
      description:
        "Validation failed. `errors` lists every problem, one message per rule.",
      type: ErrorResponseDoc,
      example: errorExample(400, "Validation failed", "/api/students", [
        "name should not be empty",
        REG_NUMBER_ERROR,
        DOB_FORMAT_ERROR,
      ]),
    }),
    regNumberTaken("/api/students"),
  );

export const ListStudentsDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: "List students",
      description: [
        "Returns students one page at a time, newest first.",
        "- `page`: starts at 1 (default 1).",
        "- `limit`: students per page (default 20, max 100).",
        "- `meta.totalPages` tells you how many pages exist. A page after the last one returns an empty `data` array.",
        DOB_RESPONSE_NOTE,
      ].join("\n"),
    }),
    ApiOkResponse({
      description: "One page of students plus pagination info in `meta`.",
      type: StudentListResponseDoc,
      example: {
        ...okExample("Students fetched successfully", [OTHER_STUDENT, STUDENT]),
        meta: { total: 2, page: 1, limit: 20, totalPages: 1 },
      },
    }),
    ApiBadRequestResponse({
      description: "`page` or `limit` is out of range or not a whole number.",
      type: ErrorResponseDoc,
      example: errorExample(
        400,
        "Validation failed",
        "/api/students?limit=500",
        ["limit must not be greater than 100"],
      ),
    }),
  );

export const GetStudentDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: "Get one student",
      description: [
        "Returns a single student by `_id`.",
        DOB_RESPONSE_NOTE,
      ].join("\n\n"),
    }),
    idParam(),
    ApiOkResponse({
      description: "The student.",
      type: StudentResponseDoc,
      example: okExample("Student fetched successfully", STUDENT),
    }),
    notFound(),
  );

export const UpdateStudentDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: "Update a student",
      description: [
        "Send **only** the fields you want to change. Fields you leave out keep their current value.",
        FIELD_RULES,
        "Changing `reg_number` to one that another student already has returns 409.",
      ].join("\n\n"),
    }),
    idParam(),
    ApiBody({
      type: UpdateStudentDto,
      examples: {
        nameOnly: { summary: "Change name only", value: { name: "Rohit S." } },
        dobOnly: {
          summary: "Change date of birth only",
          value: { dob: "01-01-2005" },
        },
        allFields: {
          summary: "Change all fields",
          value: { name: "Rohit S.", reg_number: 12205499, dob: "01-01-2005" },
        },
      },
    }),
    ApiOkResponse({
      description: "Student updated. `data` is the student after the change.",
      type: StudentResponseDoc,
      example: okExample("Student updated successfully", {
        ...STUDENT,
        name: "Rohit S.",
        updated_at: "2026-11-10T10:00:00.000Z",
      }),
    }),
    ApiBadRequestResponse({
      description: "Validation failed. `errors` lists every problem.",
      type: ErrorResponseDoc,
      example: errorExample(400, "Validation failed", STUDENT_PATH, [
        "dob cannot be in the future",
      ]),
    }),
    notFound(),
    regNumberTaken(STUDENT_PATH),
  );

export const DeleteStudentDocs = () =>
  applyDecorators(
    ApiOperation({
      summary: "Delete a student",
      description:
        "Permanently deletes the student. This cannot be undone. Deleting the same id again returns 404.",
    }),
    idParam(),
    ApiOkResponse({
      description: "Student deleted. `data` is always null.",
      type: StudentDeletedResponseDoc,
      example: okExample("Student deleted successfully", null),
    }),
    notFound(),
  );
