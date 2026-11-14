# @erxes/core-db

Drizzle schema, client and migrator for core's tables. Schema changes follow `.agents/skills/schema-change/SKILL.md`.

- `src/schema/<domain>.ts` defines tables with `pgTable` from `src/table.ts`, which adds `core_`.
  The published contract copies the schema, so schema files import only drizzle, `../table`,
  `../enums` and each other (`no-restricted-imports`). A jsonb column's shape is typed here; this
  package never imports the contract.
- `src/enums.ts` has every `as const` value list: what the columns store, the contract's z.enums
  accept and the config reads. A CHECK builds its `IN (...)` from the column's list with
  `inList(column, LIST)` from `src/table.ts`. `erxes/no-inline-enum` fails a list written out elsewhere.
- `src/tenant.ts` scopes every query. `withOrg(orgId, fn)` opens one transaction for that
  organisation, and `db()` inside it returns that transaction. `withSystem(reason, fn)` spans
  organisations as `erxes_core_system`, for jobs and the lookups before one is known; a `withOrg`
  inside it narrows to that organisation (an event consumer handling one organisation's event). `withOrgDetached` commits on its own
  even when the surrounding scope rolls back (recording why a request was refused). `savepoint(fn)`
  rolls back only `fn` when it throws, for errors the caller handles.
- A table with an organisation's data has `org_id` with a cascading foreign key to
  `core_organizations`, indexes that lead with `org_id`, and row level security in its migration:
  `ENABLE` and `FORCE ROW LEVEL SECURITY` and `CREATE POLICY core_tenant`, as in
  `drizzle/0020_auth_tokens.sql`. Plugin tables are checked by `core_plugin_tenancy_problems('<plugin>')`
  (`drizzle/0051`), which plugins run in CI after migrating. `pnpm check:rls` fails a table with `org_id` and no forced RLS or
  no `core_tenant` policy. A table without `org_id` is listed in `tools/check-rls.sql` with the reason.
- `runMigrations()` (`src/migrate.ts`) applies `drizzle/` in one transaction under an advisory
  transaction lock. Production runs it with `pnpm db:migrate`; the API runs it at startup only when
  `DATA_MIGRATE_ON_START` is on, the default outside production.
- Released migrations never change (`db:check-applied` in CI). Never use `drizzle-kit push`.
