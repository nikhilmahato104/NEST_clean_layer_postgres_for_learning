# micro_service_postgres

Learning project: a Student CRUD API built with NestJS using clean architecture, stored in **PostgreSQL** (TypeORM).
It is the same app as `../micro_service` (MongoDB); only the database layer differs.

## Run

```bash
npm install
node apply_sql.js migrations/20261111012603_create_students.sql .env.dev   # once, creates the table
npm run start:dev                                                           # reads .env.dev
```

Swagger: http://localhost:3005/api

Copy `.env.example` to `.env.dev` and fill in `DATABASE_URL` and `TOKEN_SECRET`.

## Layers

| Folder | What it holds | May import |
|---|---|---|
| `src/core/` | entities, DTOs, repository contracts (`IDataServices`, `IGenericRepository`), domain errors | nothing outside `core/` |
| `src/use-cases/` | business rules | `core/` |
| `src/controllers/` | routes, Swagger docs, auth guard, response and error format | `use-cases/`, `core/` |
| `src/frameworks/postgres/` | TypeORM models and the generic repository | `core/` |
| `src/services/` | wiring: config, and which database implementation to use | `frameworks/` |

Request flow: `Controller -> UseCase -> IDataServices (core) -> PostgresDataServices (frameworks) -> PostgreSQL`

## Database migrations

The app never creates or changes tables (`synchronize: false`). Every table change is a SQL file in
`migrations/`, applied by hand with `apply_sql.js`, first on dev, then the same file on prod.
Rules and commands: [migrations/README.md](migrations/README.md).

## Adding a new CRUD (e.g. Course)

1. `core/entities/course.entity.ts` and `core/dtos/course.dto.ts`
2. `migrations/<yyyymmddHHMMSS>_create_courses.sql`, then apply it on dev
3. `frameworks/postgres/model/course.ts` (TypeORM entity, matching the migration)
4. `use-cases/course/`: factory, use-case, module
5. `controllers/course.controller.ts` and `controllers/docs/course.docs.ts`
6. Wire it up: a `courses` property in `IDataServices` and `PostgresDataServices`, a `forFeature` entry in
   `postgres-data-service.module.ts`, and the module + controller in `app.module.ts`

The Student module is the reference: copy it and rename.
