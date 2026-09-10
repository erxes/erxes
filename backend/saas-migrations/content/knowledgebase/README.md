# Knowledge Base to CMS

This explicit TypeScript command reads legacy Knowledge Base collections from
one SaaS tenant and inserts CMS content into an existing destination website.
Source and destination may be the same tenant. Both tenants must be available
through the configured MongoDB connection and core `organizations` collection.
It does not depend on first running `migrateFrontline.ts` or `migrateContent.ts`.
Neither automatic migration runner discovers this nested entry point.

## Mapping

| Source                                      | Destination                                                   |
| ------------------------------------------- | ------------------------------------------------------------- |
| `knowledgebase_topics`                      | Root `cms_categories`                                         |
| `knowledgebase_categories`                  | Nested `cms_categories`, preserving parent relationships      |
| `knowledgebase_articles`                    | `cms_posts` with a Knowledge Base custom post type            |
| Recognized KB records in `cms_translations` | CMS `post` / `category` translations with remapped `objectId` |
| Original documents and assigned IDs         | `migration_knowledgebase_mappings`                            |

The importer creates one custom type with code `knowledgebase`, or reuses an
existing active type with that code in the destination portal. Posts store its
**ID** in `type`; API filters use its **code**. All posts and categories receive
the destination `clientPortalId`. A post includes its direct category and its
ancestors, including the topic category, so filtering at any level finds it.

Article title and HTML remain intact; `summary` becomes `excerpt`, `image`
becomes `thumbnail`, `publish` becomes `published`, `createdBy` becomes
`authorId`, and legacy creation/modification/publication dates map to CMS dates.
Attachment/PDF references, aggregate view counts and supported reaction counts
are preserved. Missing dates use the initial reservation time for creation and
modification; a missing publication date stays absent. No historical daily view
records, tags, pages, menus, or translations inferred from matching titles are
created. The CMS website's existing settings are not changed.

Relationships come from `category.topicId`, `article.categoryId`, and
`parentCategoryId`. Incomplete inverse arrays are reported and rebuilt;
references to nonexistent or differently owned records block the entire import.
Missing topics/categories, contradictory article topics, category cycles and
hierarchies deeper than 100 levels also block writes.

## Access and feature limitations

**Only articles with `status: 'publish'` and `isPrivate: false` or absent can
be imported.** Any private, draft, scheduled, archived, unknown-status or
brand-scoped topic in the selection blocks the entire apply, including metadata
writes. There is no flag that bypasses this check. CMS portal reads currently
have no equivalent article privacy field and do not consistently enforce
published-only visibility; converting private content to a draft is unsafe.
Migrating those records requires a separately scoped CMS access change. The
report names the blocked records, and the source remains intact.

Each topic's language must match the target CMS default. A missing topic
language uses the target default with a warning. Run different-language topics
against matching CMS websites. Recognized translations use source types
`knowledgeBaseTopic`, `knowledgeBaseCategory`, and `knowledgeBaseArticle` and
must reference selected base records and enabled non-default CMS languages.
Duplicate, orphan, default-language or custom-field-bearing translations require
reconciliation rather than silent conversion.

Topic branding/styles, category icons, ordering arrays, original codes,
publisher/editor fields, forms, notification segments and unsupported reactions
remain in the source snapshots in the migration ledger. Storing them does not
recreate KB widgets, forms, notifications, automation/AI references, redirects,
or website appearance. This command changes no frontend or plugin API code.

## Configuration and dry run

Create/select the destination client portal and its single linked CMS through
the existing application. Set its default and enabled languages. Configure the
following in the repository root `.env` or exported environment; the entry point
loads the root file regardless of the current working directory. Exported values
take precedence. Do not commit real connection strings or tenant data.

```dotenv
CORE_MONGO_URL=mongodb://127.0.0.1:27017/erxes?directConnection=true
SOURCE_SUBDOMAIN=old-organization
TARGET_SUBDOMAIN=new-organization
CLIENT_PORTAL_ID=destination-portal-id
DRY_RUN=true

# Optional: comma-separated topic IDs. Omit to inspect all source KB records.
KB_TOPIC_IDS=topic-one,topic-two

# Optional: preserve matching author IDs by default; explicitly map exceptions.
KB_AUTHOR_MAP={"old-user-id":"new-user-id"}
# Optional fallback only for authors absent from the target.
ADMIN_USER_ID=destination-editor-id
```

`MONGO_URL` is accepted if `CORE_MONGO_URL` is not set. Every configured author
must exist in target `users`; users are never created or matched by display name.
Missing authors without a valid mapping/fallback block writes.

From the repository root:

```bash
pnpm exec tsx backend/saas-migrations/content/knowledgebase/migrateKnowledgeBaseToCms.ts
```

Dry-run is the default when `DRY_RUN` is absent. It reads the source, destination,
mapping ledger and actual unique indexes, and emits JSON counts, warnings and
errors. It writes **no MongoDB documents, indexes, files or media**. An invalid
plan returns exit code `1`, including in dry-run mode. Successful preview/apply
returns `0`. Review warnings as well as errors.

## Files and links

No media is downloaded, uploaded or probed over the network. Absolute HTTP(S)
attachment URLs are retained; keep their storage available. For relative
attachment/PDF URLs during a cross-tenant migration, set an absolute source file
base, including a trailing slash for directory-relative paths:

```dotenv
KB_MEDIA_BASE_URL=https://old-files.example.com/uploads/
```

URL resolution follows standard URL rules: `/file` resolves from the origin,
while `file` resolves relative to the base directory. Verify the real source
file-serving endpoint before applying. Cross-tenant article and translation
HTML with quoted relative `src`/`href` attributes is rejected. Normalize those
URLs first; `KB_MEDIA_BASE_URL` rewrites attachment fields, not HTML markup.
The importer preserves existing HTML rather than sanitizing or redesigning it.
Check inline CSS, `srcset`, embeds and other source-specific markup in staging.

Optionally identify the exact old article URL pattern:

```dotenv
KB_ARTICLE_URL_TEMPLATE=https://old-help.example.com/articles/{id}
```

With that setting, the target CMS must have a valid `publicUrl`,
`postUrlPrefix` and `_id`/`slug`/`count` `postUrlField`. Exact matching quoted
HTML `href` attributes are rewritten to the mapped destination, preserving
fragments. Other links remain unchanged. The mapping ledger records
`sourceUrl`/`targetUrl` for redirect setup outside this importer. Confirm the
destination website actually serves those CMS routes before cutover.

## Apply, resume and verification

1. Back up source KB collections and destination CMS collections, including the
   migration ledger when it exists. Retain source file storage. Record the
   selected tenant/topic/portal settings with the backup.
2. Freeze editorial writes on source KB and destination CMS during the import;
   allow only one importer per destination at a time. The importer does not lock
   application writers or take a transaction-wide snapshot.
3. Run dry-run and resolve every error. Validate media and the mapped page URLs
   in a staging copy. Creating source copies merely to change private records
   to public does not preserve their access policy.
4. Apply explicitly:

   ```bash
   DRY_RUN=false pnpm exec tsx backend/saas-migrations/content/knowledgebase/migrateKnowledgeBaseToCms.ts
   ```

5. Check JSON inserted/unchanged counts and run the same dry-run again. Use the
   CMS UI/API to verify the `knowledgebase` type, topic/category filters, detail
   reads, translated content, author attribution, media and configured links.
   Compare every selected source entity with its migration mapping and target.
6. Switch the external website/widget links only after validation. Keep the old
   KB data and storage until the destination has been accepted.

This is an insert-only migration, not ongoing synchronization. The ledger
reserves NanoIDs, slugs, post counts and source/target fingerprints **before**
content writes. Reruns use the same reservations and insert only missing records.
Existing CMS content is never replaced. Changed source content, changed import
settings that alter the output, modified ledger records, or edited destination
content cause an error. Live post/KB view/reaction counters and Mongoose
`updatedAt`/`__v` bookkeeping do not invalidate article reruns; original imported
counters are not reapplied over live destination counts.

Writes are bounded batches, without a transaction spanning the import. A runtime
failure can leave reservations and some inserted documents. Fix the cause and
rerun with the same source content/settings; do not delete the ledger to retry.
Actual unique indexes are inspected. Slug allocation conservatively avoids
collisions across the destination database, including pending reservations;
unknown unique indexes, collated indexes and partial unique indexes block apply
until explicit handling is added. Existing indexes are never dropped or changed.

Optional limits: `BATCH_SIZE` defaults to 500 (capped at 1000),
`KB_MAX_DOCUMENTS` defaults to 100000, and `KB_MAX_BYTES` defaults to 134217728.
The latter two bound the combined in-memory inventory across source/destination
records and mappings; total process memory is larger because planning creates
additional objects. The inventory fails instead of silently truncating. Narrow
`KB_TOPIC_IDS` or explicitly increase limits for larger imports. Destination
inventory includes other portals to check database-wide uniqueness and ownership.

## Rollback

Rollback is an operator action, never automatic after a failed batch. First
restore website routing to the old KB if cutover occurred and pause CMS writes.
Select ledger records using both `sourceDb` and `clientPortalId`; save that exact
selection before any removal.

For each mapped target, compare its current content using `targetFingerprint`
from `fingerprint.ts` with the stored `targetHash`. Stop for edited records and
resolve them using the backup. Even matching fingerprints may have newer view
or reaction counts; retain those before removal if needed. Check that new CMS
posts, menus, translations or field groups do not reference the imported IDs.

Only after reviewing those checks, remove the selected mapping-owned
translations, posts, categories (children first) and newly created custom type
by their exact target IDs. A reused existing type has no migration-owned type
mapping and must remain; a created type now used by other imports/content must
also remain. Never delete by slug/name or remove whole CMS collections. Remove
only the corresponding ledger records last, retaining their backup. Source KB,
users, client portals and CMS website settings do not need restoration because
this importer never writes them.

## Development checks

```bash
pnpm --dir backend/saas-migrations typecheck
pnpm --dir backend/saas-migrations lint:knowledgebase
pnpm --dir backend/saas-migrations test:knowledgebase
```

Tests use Node's test runner via `tsx`. The integration suite requires `mongod`
on `PATH`; it starts its own temporary local process on an unused loopback port,
seeds disposable fixtures and cleans up that process/directory. It does not load
`.env` or connect to an existing database. Tests cover real MongoDB index
behavior, dry-run, insert/rerun, interrupted reservations, conflicts, tenant and
author checks, alongside mapping, language, access and media cases. No Nx build
target exists for these standalone TypeScript migration scripts.
