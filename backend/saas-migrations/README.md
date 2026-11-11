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

Either side of a pair (and either environment variable) may be the
organization's `_id` instead of its subdomain, and the two can be mixed:

```ts
{ source: '66f1a2b3c4d5e6f7a8b9c0d1', target: 'esight' },
```

Scripts resolve the value through [`findOrganization.ts`](findOrganization.ts),
which matches `organizations.subdomain` or `organizations._id` (string or
ObjectId). It fails when the value is one organization's subdomain and a
different organization's `_id`. `--org=` matches the value exactly as written
in `ORG_PAIRS`.

A source organization whose record was deleted from `organizations` can still
be migrated by `_id`: when the value is a 24-character ObjectId and the
`erxes_<_id>` database exists, the source → target scripts read that database
and print a warning. The target must always be a registered organization.

Two scripts outside the runners still take subdomains only:
`content/knowledgebase` and `core/searchTokens/backfillCustomerSearchTokens.ts`.

## Single customer / company

`core/commands/migrateRelationsToContactFields.ts` moves existing data to the
model where records keep their own contacts. Unlike the source → target
migrations, it changes one database in place and also serves self-hosted
servers. Run it before the new code serves traffic; it is safe to run again,
and `DRY_RUN=true` only counts.

It gives deals, tickets, tasks, projects, triages and cars one `customerId` /
`companyId` (old arrays or relations → the first), and rewrites saved
automations to those fields. Deals and tickets still without a customer get
the customer of the inbox conversation they were made from (conversation
relations, the old `sourceConversationIds` field, or a migrated ticket's
`customerFieldData.sourceConversationIds`): records keep no conversation link,
so this keeps them in the customer's ticket and deal widgets. Old
`customerIds` / `companyIds` arrays are kept (only their indexes are dropped),
so every contact stays on the record and old code can be rolled back.

Which databases it touches (`core/commands/_organizationDbs.ts`):

```bash
# SaaS, every organization (MONGO_URL = core database)
ALL_ORGS=true npx tsx backend/saas-migrations/core/commands/migrateRelationsToContactFields.ts
# SaaS, one organization
TARGET_SUBDOMAIN=<subdomain> npx tsx backend/saas-migrations/core/commands/migrateRelationsToContactFields.ts
# Self-hosted (MONGO_URL = the erxes database)
npx tsx backend/saas-migrations/core/commands/migrateRelationsToContactFields.ts
```

## AppSumo organizations

AppSumo customers (a redeemed `promo_codes` entry of type `appsumo` whose
`usedBy` is their subdomain, or `plan: 'lifetime'`) were removed from
`organizations` and live in `organizations_held`; their databases are still
`erxes_<_id>`. `appsumo/migrateOrganization.ts` runs first for every pair and
creates the target organization, so a pair is the held organization's `_id` (or
subdomain) and the subdomain to create:

```ts
{ source: '5f8bcfc86c2488e0e6687c1d', target: '026000' },
```

```bash
[APPSUMO_OWNER_ID=<user _id>] [APPSUMO_RUN_ID=<id>] tsx backend/saas-migrations/run.ts
```

The organization has the shape of a freshly provisioned next organization
(`status: 'active'`, `isNext: true`, `onboardingDone: true`, `charge`, `saas`,
`gp*`), keeps the held organization's name, and is stamped with
`migration: { runId, source: 'appsumo-v1', sourceOrganizationId, … }`. The owner is `APPSUMO_OWNER_ID`, else the held
organization's owner restored from `users_held` (or the active user with the
same `_id` or email); the new organization is added to that user's
`organizationIds`. Stripe is not touched (`billing.status: 'none'`,
`gpStatus: 'new'`). An active `organization_plan_histories` record is added
for the bundle and product found by code (`APPSUMO_BUNDLE_CODE`, default
`everything`; `APPSUMO_PRODUCT_CODE`, default `erxes-everything`); `APPSUMO_PLAN_INTERVAL`,
default `yearly`, ending `APPSUMO_PLAN_MONTHS` months from now, default 120) unless the organization already has one. Plugins of a `gpStatus:
'new'` organization come from Stripe, so when `GP2_STRIPE_SECRET_KEY` is set a
Stripe customer is created with `free_plugins` = `APPSUMO_FREE_PLUGINS` (default:
every plugin, as Everything grants; when it is set empty the bundle's
`pluginLimits` are used instead) and stored in
`gpStripeCustomerId` / `billing.customerId`; without the key the organization is
created but gets no plugins, and the run says so. A target subdomain that already carries the same
`migration.sourceOrganizationId` is reused; one that belongs to another
organization stops the run before any data is copied. `DRY_RUN=true` only
prints what would be created.

## Frontline channel

`frontline/commands/migrateChannel.ts` creates a team channel (named
`DEFAULT_CHANNEL_NAME`, default `Support`) when the target has none, with the
target's users as members and its owner as admin. `migrateForms.ts`,
`migrateTickets.ts` and `migrateResponseTemplates.ts` then assign
`STATIC_CHANNEL_ID` when it is set, otherwise the target's only team channel;
with several team channels and no `STATIC_CHANNEL_ID` they stop instead of
writing an empty `channelId`. Response templates whose `channelId` is empty
from an earlier run are assigned again.

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
   connection, do the work, `process.exit()`. Look organizations up with
   `findOrganization` so both subdomains and `_id`s work.
2. If the owning plugin builds it, add the file to that plugin's
   `tsconfig.json` `include` array (see how `core-api` / `frontline_api` do it).

## Not included here

Migrations that are **loaded at runtime** by a plugin (rather than run as a
standalone script) stay in the plugin, next to the `connectionResolvers.ts`
that imports and invokes them.
