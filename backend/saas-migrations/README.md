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
tsx backend/saas-migrations/run.ts

# Only specific domains
tsx backend/saas-migrations/run.ts core frontline

# A single script (by domain/file or bare name)
tsx backend/saas-migrations/run.ts core/migratePost.ts
tsx backend/saas-migrations/run.ts migratePost

# Preview the order without running anything
tsx backend/saas-migrations/run.ts --list

# Keep going past failures instead of stopping on the first
tsx backend/saas-migrations/run.ts --continue
```

Or via the package scripts (from this directory):

```bash
pnpm migrate          # run all
pnpm migrate:list     # list only
```

The runner exits non-zero if any migration fails. By default it **stops on the
first failure**; pass `--continue` to run the rest regardless.

### Existing target data

By default the domain migrations are **insert-only**: a source document whose
`_id` already exists in the target is left untouched, so re-runs never
overwrite changes made in the target. Set `OVERWRITE_EXISTING=1` to replace
existing target documents with the source version instead.

In `sales/migrateSales.ts`, a source deal whose `number` is already used in the
target is inserted with a `-1`, `-2`, … suffix, and a pipeline label whose
`pipelineId`/`name`/`colorCode` already exists in the target is skipped.

### Organizations

Both `run.ts` and `run-commands.ts` run every selected script once per
organization pair, finishing one organization before starting the next:

- When `SOURCE_SUBDOMAIN` and `TARGET_SUBDOMAIN` are both set in the shell
  environment (as the Kubernetes Job does), only that single pair runs.
- Otherwise every pair in `ORG_PAIRS` in [`orgs.ts`](orgs.ts) runs. Limit it
  with `--org=<subdomain>[,<subdomain>…]`, matching either the source or the
  target subdomain.

The runner passes each pair to the scripts as `SOURCE_SUBDOMAIN` and
`TARGET_SUBDOMAIN`, overriding any values in `.env`.

```bash
tsx backend/saas-migrations/run.ts --list                    # orgs × scripts
tsx backend/saas-migrations/run.ts --org=belty,hipay core
tsx backend/saas-migrations/run-commands.ts --org=belty propertiesData
```

## Knowledge Base to CMS

The explicit [Knowledge Base importer](content/knowledgebase/README.md) converts
topics into root CMS categories, preserves category hierarchy, and imports
articles as Knowledge Base posts in an existing client portal/CMS. It supports
dry-run, author/ID mapping, recognized KB translations, collision checks and
resumable insert-only writes. Source collections remain intact.

```bash
pnpm exec tsx backend/saas-migrations/content/knowledgebase/migrateKnowledgeBaseToCms.ts
```

Run from the repository root after configuring the tenant and portal settings
in the linked guide. Dry-run defaults to true. The command is deliberately not
discovered by either automatic runner. Private/non-public content blocks apply
because current CMS portal reads cannot preserve those access semantics;
review the guide's access, media, backup and rollback requirements first.

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
