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

## WordPress WXR import

The WordPress importer is an explicit command and is not discovered by
`run.ts`. This prevents a normal erxes-to-erxes migration run from accidentally
starting an external import.

First create/select the target erxes client portal and content CMS. Export
WordPress through **Tools → Export → All content**, copy the resulting WXR 1.x
XML file to the machine running this command, and preview the import:

```bash
pnpm --dir backend/saas-migrations import:wordpress -- \
  --file=/absolute/path/wordpress.xml \
  --target-subdomain=acme \
  --client-portal-id=client_portal_id \
  --admin-user-id=web_admin_user_id \
  --dry-run
```

Run the same command without `--dry-run` after reviewing the counts and
warnings. All WordPress authors are deliberately mapped to the selected erxes
web admin for this first version. WXR stores attachment URLs rather than the
binary files, so keep the old WordPress uploads publicly reachable during the
real import.

The importer handles:

- site title, description, URL, and language;
- posts, pages, page parents, publish states, categories, and tags;
- Polylang post, page, category, and tag groups as base content plus
  `cms_translations`;
- custom post types in `cms_posts`;
- public post meta (keys not beginning with `_`) as CMS custom fields;
- WordPress navigation menu items;
- attachments, featured images, galleries, and content URL rewriting.

It deliberately does not import WordPress users, comments, WooCommerce data,
WPML translations, ACF field definitions, or plugin-specific tables and
configuration. The existing erxes page translation structure does not include
the page body field, so translated WordPress page bodies are reported but not
stored; page names, descriptions, and public custom-field values are imported.

Safety behavior:

- The target organization, portal, admin, and single CMS record are validated
  before upload or write.
- WXR XML containing DTD/entity declarations is rejected.
- Media downloads reject non-HTTP URLs and private/local network targets, and
  enforce redirect, timeout, and size limits.
- New records use normal erxes NanoIDs. `migration_wordpress_mappings` stores
  WordPress source IDs separately and reuses the same erxes IDs on reruns.
  Existing successfully uploaded media is also reused.
- Slugs are checked against the target portal before writing. Collisions use
  the normal erxes suffix sequence (`slug`, `slug_2`, `slug_3`, ...), while
  reruns preserve the slug already assigned to the mapped record.
- `--skip-media` keeps original WordPress media URLs and avoids file transfer.
  With `UPLOAD_SERVICE_TYPE=local`, files are copied to `LOCAL_UPLOADS_DIR` or
  the core API's default ignored uploads directory. Cloud storage uses the
  configured erxes storage service and requires Redis/service discovery.
- A media failure leaves that attachment retryable and returns exit code `2`
  after importing the remaining data.

Use `pnpm --dir backend/saas-migrations import:wordpress -- --help` for batch,
file-size, timeout, and concurrency options. Validate migration TypeScript with
`pnpm --dir backend/saas-migrations typecheck`.

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
