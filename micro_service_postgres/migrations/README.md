# Database migrations

The app never changes the database schema itself (`synchronize: false`, `migrationsRun: false`).
Every new table or table change is a SQL file in this folder, applied by hand, in order,
first on dev and then on prod. The same files run on every environment, so dev and prod end up identical.

## Rules

1. **One change = one new file**, named `yyyymmddHHMMSS_what_changed.sql`
   (e.g. `20261111012603_create_students.sql`). The timestamp keeps files in the order they must run.
2. **Never edit a file that has already been applied** on any database. Fix mistakes with a new file.
3. Each file starts with a comment: what changes, why, how to apply it, and the rollback SQL.
4. Wrap the change in `begin; ... commit;` so it applies completely or not at all.
5. End the file by recording it in `"__EFMigrationsHistory"` (copy the block from an existing file).
6. Update the matching model in `src/frameworks/postgres/model/` in the same change.

## Apply

```bash
node apply_sql.js migrations/20261111012603_create_students.sql .env.dev    # dev
node apply_sql.js migrations/20261111012603_create_students.sql .env.prod   # prod
node apply_sql.js migrations/20261111012603_create_students.sql .env.dev --dry-run   # only shows the target
```

## Which files are already applied?

```sql
select "MigrationId" from "__EFMigrationsHistory" order by "MigrationId";
```

Run every file in this folder that is not in that list, oldest first.
