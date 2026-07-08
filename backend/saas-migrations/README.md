# Database migrations

One-off migration scripts, organized by domain (`core/`, `frontline/`, `loyalty/`,
`mongolian/`, `operation/`, `content/`, …). Each file is a **standalone script**:
it loads its own env via `dotenv`, opens its own Mongo connection, does its work,
and calls `process.exit()` when done.

## Running

Each script reads its connection string from the environment (`MONGO_URL`, and a
few use domain-specific overrides such as `CORE_MONGO_URL`). Provide these via a
`.env` file in your working directory or by exporting them.

```bash
# Run everything (core first, then the rest)
tsx backend/migrations/run.ts

# Only specific domains
tsx backend/migrations/run.ts core frontline

# A single script (by domain/file or bare name)
tsx backend/migrations/run.ts core/migratePost.ts
tsx backend/migrations/run.ts migratePost

# Preview the order without running anything
tsx backend/migrations/run.ts --list

# Keep going past failures instead of stopping on the first
tsx backend/migrations/run.ts --continue
```

Or via the package scripts (from this directory):

```bash
pnpm migrate          # run all
pnpm migrate:list     # list only
```

The runner exits non-zero if any migration fails. By default it **stops on the
first failure**; pass `--continue` to run the rest regardless.

## How it works

`run.ts` discovers every `*.ts` under each domain subfolder and runs each in its
**own child process** (`node --import tsx <file>`). A separate process per script
is required because the scripts self-invoke and call `process.exit()` — running
them in-process would tear the runner down after the first one.

## Adding a migration

1. Drop a standalone `*.ts` script into the relevant domain folder (create the
   folder if needed). Follow the existing pattern: `dotenv.config()`, open a
   connection, do the work, `process.exit()`.
2. If the owning plugin builds it, add the file to that plugin's
   `tsconfig.json` `include` array (see how `core-api` / `frontline_api` do it).

## Not included here

Migrations that are **loaded at runtime** by a plugin (rather than run as a
standalone script) stay in the plugin. For example,
`insurance_api`'s `dropCodeIndex.ts` is imported and invoked from
`connectionResolvers.ts`, so it is not a standalone migration and lives with the
plugin.
