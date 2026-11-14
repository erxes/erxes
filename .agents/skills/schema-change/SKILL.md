---
name: schema-change
description: Change core's Postgres schema. Use when adding or altering a table, column, index or constraint in packages/db/src/schema, or when pnpm check:generated or pnpm check:rls fails.
---

Copy `packages/db/src/schema/tags.ts`: an org-scoped table with a named unique index, a cascading
foreign key to `organizations` and a check constraint.

1. Edit `packages/db/src/schema/<domain>.ts` with `pgTable` from `../table` (it adds the `core_`
   prefix). A table with an organisation's data gets `orgId: orgIdColumn()` from `../table` (filled from the scope on insert), a foreign key
   `core_<table>_org_id_fkey` to `organizations.id` with `onDelete('cascade')`, and indexes that lead
   with `orgId`. Spell every index and constraint name out with the full table name.
2. Ids are `text().primaryKey()` filled by `newId()`. A column with a fixed set of values uses
   `text({ enum: CONSTANTS })` or `.$type<...>()` plus a check built with `inList(column, CONSTANTS)`
   from `../table`, so services read it
   without casts. The constant goes in `src/enums.ts` and the schema imports it from `../enums`;
   the contract's `z.enum` reads the same array. A jsonb column's shape is a type in `src/schema`.
3. A new table goes into `src/schema/index.ts`.
4. Run `pnpm db:generate` and read the SQL it writes to `packages/db/drizzle/`. A NOT NULL column on
   a table with rows needs a default or a backfill in that SQL. A new table with `org_id` gets its
   row level security appended to the same migration, as `drizzle/0020_auth_tokens.sql` does:
   `ENABLE ROW LEVEL SECURITY`, `FORCE ROW LEVEL SECURITY` and `CREATE POLICY core_tenant ... USING
   (core_tenant_visible(org_id)) WITH CHECK (core_tenant_visible(org_id))`. A table without `org_id`
   goes into the list in `tools/check-rls.sql` with the reason. Only new migrations change:
   `db:check-applied` fails CI on an edited one. Never run `drizzle-kit push`.
5. Run `vp run check`. The contract builds its schemas from the tables, so a renamed or retyped
   column fails the type check where the contract, the services and web still use the old one;
   fix each. A new column stays out of the API until the contract picks it
   (`.agents/skills/core-endpoint/SKILL.md`). Run `pnpm openapi` and read the `openapi.json` diff.
6. Run `pnpm check:rls` and `vp run test` with `DATA_TEST_URL`. Both migrate fresh databases, so a
   broken migration fails there.

Done when the schema file and its migration are in one commit, a second `pnpm db:generate` writes
nothing, and `vp run check`, `pnpm check:generated`, `pnpm check:rls` and `vp run test` pass.
