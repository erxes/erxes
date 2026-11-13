# @erxes/core-db

Drizzle schema, client and migrator for core's tables.

## Layout

- `src/schema/<domain>.ts` defines tables. `src/schema/index.ts` exports them for drizzle-kit and
  the client, and as `@erxes/core-db/schema` for the contract, which builds its schemas from them
  (`packages/contract/AGENTS.md`). The published contract copies that subpath, so schema files
  import only `drizzle-orm`, `drizzle-orm/pg-core`, `../table`, `../enums` and each other: no Node,
  `pg` or client. The
  shapes a jsonb column stores (`ConditionGroup`, `ExportQuery`, `ViewSort`) are typed here, and
  the db package never imports the contract.
- `src/enums.ts` (`@erxes/core-db/enums`) has every `as const` value list: what the columns store,
  the contract's z.enums accept and the config reads. It imports nothing, so browsers load it
  without the tables. `erxes/no-inline-enum` (`tools/lint/erxes`) fails a `z.enum([...])`,
  `pgEnum`, `{ enum: [...] }` or SQL `IN ('a', 'b')` written out anywhere else.
- `src/table.ts` is `pgTable`, which prefixes every table with `core_`, and `inList(column, LIST)`,
  a CHECK's `IN (...)` built from the list the column's `enum` uses.
- `src/client.ts` has `configureDb`, `db()`, `withTransaction`, `Db` and `Transaction`.
- `src/migrate.ts` has `runMigrations()`. The API runs it at startup in one transaction under
  `pg_advisory_xact_lock(hashtext('core:migrate'))`, tracked in `public.__drizzle_migrations_core`.
- `src/ids.ts` has `newId()`: 17-character text ids, like old erxes, so imported `_id`s stay valid.
- `drizzle/` holds the generated SQL migrations and their snapshots.

## Rules

- The database is shared with plugins (`<plugin>_<name>` tables). Core touches only `core_*`
  (`tablesFilter` in `drizzle.config.ts`). Index and constraint names repeat the full table name:
  `core_tags_org_type_name_key`.
- Every table that holds an organisation's data has `org_id` with a foreign key to
  `core_organizations` (`onDelete('cascade')`), and its indexes lead with `org_id`.
- Columns that hold a fixed set of values carry it in the type: `text({ enum: ... })` with an
  array from `src/enums.ts`, or `.$type<...>()`, so services need no casts.
- Schema change: edit `src/schema`, run `pnpm db:generate`, read the SQL, commit both together.
  Never edit a released migration. Never use `drizzle-kit push`. `pnpm check:generated` fails when
  the schema and `drizzle/` disagree.
- Only transaction-scoped locks: core runs behind connection poolers.
- Future (Phase 1): row-level security per organisation, a separate migration role, and migrations
  moved out of API startup.

## Check

`pnpm check:generated`, then `pnpm test` with `DATA_TEST_URL` (each API test file migrates a new database).
