---
name: schema-change
description: Change core's Postgres schema. Use when adding or altering a table, column, index or constraint in packages/db/src/schema, or when pnpm check:generated reports migration drift.
---

Copy `packages/db/src/schema/tags.ts`: an org-scoped table with a named unique index, a cascading
foreign key to `organizations` and a check constraint.

1. Edit `packages/db/src/schema/<domain>.ts` with `pgTable` from `../table` (it adds the `core_`
   prefix). A table with an organisation's data gets `orgId: text().notNull()`, a foreign key
   `core_<table>_org_id_fkey` to `organizations.id` with `onDelete('cascade')`, and indexes that lead
   with `orgId`. Spell every index and constraint name out with the full table name.
2. Ids are `text().primaryKey()` filled by `newId()`. A column with a fixed set of values uses
   `text({ enum: ... })` or `.$type<...>()` plus a check constraint, so services read it without casts.
3. A new table goes into `src/schema/index.ts`.
4. Run `pnpm db:generate` and read the SQL it writes to `packages/db/drizzle/`. A NOT NULL column on
   a table with rows needs a default or a backfill in that SQL. Never edit a migration that is
   already on `postgre`, and never run `drizzle-kit push`.
5. Update the services and DTOs that read the table, and the contract if the API shape changes
   (`.agents/skills/core-endpoint/SKILL.md`).
6. Run `pnpm test` with `DATA_TEST_URL`: every API test file migrates a fresh database, so a broken
   migration fails there.

Done when the schema file and its migration are in one commit, a second `pnpm db:generate` writes
nothing, and `pnpm check:generated` and `pnpm test` pass.
