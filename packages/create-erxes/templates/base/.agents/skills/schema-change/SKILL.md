---
name: schema-change
description: Change the Postgres schema. Use when adding or altering a table, column or index in api/src/db/schema.ts, or when the CI migration drift check or pnpm check:rls fails.
---

1. Edit `api/src/db/schema.ts`. Declare tables with `table('<name>')` from
   `./table.ts`, which makes them `__id___<name>`. A new table has
   `id: text().primaryKey()` and `orgId: text().notNull()`, and its indexes and
   constraints lead with `orgId` and carry their full `__id___` name.
2. Run `pnpm db:generate` and read the SQL in `api/drizzle/`. For each new
   table, append to that same file:

   ```sql
   --> statement-breakpoint
   SELECT core_enable_tenant_rls('__id___<name>');
   ```

   A table that can't have `org_id` goes into `no_org_id` in
   `tools/check-rls.sql`, with the reason.

3. Migrations only add or alter. Never edit one that has been applied anywhere,
   and never run `drizzle-kit push`. To retire a column, stop reading and
   writing it and leave it in the table.
4. Run `pnpm db:check`, then `pnpm check:rls` and `vp run test` with
   `DATA_TEST_URL`. Both migrate fresh databases.

Done when the schema change and its migration are in one commit,
`pnpm check:rls` passes, and a second `pnpm db:generate` writes nothing.
