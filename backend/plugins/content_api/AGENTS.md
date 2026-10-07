# `content_api` Plugin Guide

## Identity

- **Plugin:** `content`
- **Project:** `content_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/content_api`
- **Last synchronized:** `2026-10-07`

## Scope

### Owns

- CMS websites, posts, translations, categories, tags, pages, menus and custom fields.
- Web Builder websites and pages.
- Tenant-local CMS social delivery snapshots and the Postiz delivery worker.

### Does not own

- Core users, permission storage, Postiz membership/placement, the managed gateway or social provider credentials.
- Frontend routes and presentation.

## Current Capabilities

- Serves CMS and Web Builder GraphQL from the Content plugin on port 3303.
- CMS access respects assigned members, author scope and allowed languages.
- Ordinary published CMS posts can be explicitly shared to Postiz after CMS and Postiz authorization.

## Architecture

| Area            | Path                         | Responsibility                                         |
| --------------- | ---------------------------- | ------------------------------------------------------ |
| Runtime         | `src/main.ts`                | Plugin startup and CMS delivery-worker initialization. |
| Models          | `src/connectionResolvers.ts` | Tenant-scoped models.                                  |
| CMS             | `src/modules/cms`            | CMS persistence, GraphQL and access rules.             |
| Social delivery | `src/modules/cms/postiz`     | Signed bridge, delivery queue and worker.              |
| Web Builder     | `src/modules/webbuilder`     | Websites and page persistence.                         |
| Permissions     | `src/meta/permissions.ts`    | CMS actions, language grants and default groups.       |

## Contracts

### Provides

- CMS and Web Builder GraphQL through `src/apollo`, including `cmsPostiz*` sharing, validation and delivery operations.
- `cmsPostsSharePostiz` permission, included in CMS Journalist 1, Journalist 2, Editor and Admin default groups; excluded from CMS Viewer.

### Consumes

- Public `erxes-api-shared` startup, tenant model and permission APIs.
- Core user and permission-group tRPC contracts.
- Agent `postizCms.execute` through signed server-to-server tRPC.

## Data and State

- Tenant models come from `generateModels(subdomain)`.
- CMS records use `clientPortalId` to identify a website.
- `cms_postiz_deliveries` stores immutable snapshots and deterministic request IDs through retries.
- New snapshots include the authenticated request `subdomain`; older records may lack it.

## Local Invariants

- Sharing is only for ordinary published posts. Recheck CMS assignment, publishing/sharing permissions, author scope and language access before enqueue and dispatch.
- Journalist 2's sharing grant does not grant approval or immediate publication. That role alone still cannot dispatch a share; the existing publish/approve and Postiz membership requirements remain mandatory.
- Never accept browser workspace IDs or Postiz credentials; agent_api owns workspace routing and Postiz membership.
- Signer and worker startup use existing `JWT_TOKEN_SECRET`. Derive the CMS-purpose key exactly as specified in `CMS_POSTIZ.md`; reject missing/blank JWT. `CMS_POSTIZ_SHARED_SECRET` is ignored.
- Tenant context remains signed and verified even when SaaS tenants share a JWT root.
- The SaaS delivery sweep streams tenant identifiers and checks for due work through the MongoDB driver before loading tenant models. Reuse worker models for tenants with due jobs; idle tenants must not create cached Mongoose models.
- Preserve leases, snapshots and request IDs. UNKNOWN means manual review, not permission to publish again.
- Enterprise workers scan the installation database without using a synthetic routing tenant. Dispatch, user lookup and status polling use each saved `subdomain`; no DOMAIN-derived fallback or installation-specific setting is used.
- SaaS workers enumerate tenant databases and reject snapshots naming another tenant. Legacy SaaS rows can be bound to their database tenant under the claimed lease. Legacy enterprise rows without a tenant become UNKNOWN and require verified operator recovery; never infer ownership from an article URL, user ID or another job.
- Enqueue/retry accepts tenant context only from the server; conflicting saved tenants are rejected. Delivery history excludes records explicitly bound to another tenant while retaining legacy records for recovery visibility.
- Never remove JWT or delivery ledgers to stop/retry CMS work. Coordinate both API versions on rollout/rollback.
- Docker's installer stage uses `NODE_OPTIONS=--jitless`, matching agent_api's QEMU workaround. The runtime stage must not inherit it; dependency-install failures must not be swallowed by optional file pruning.

## Validation

- `pnpm nx run content_api:schema:print` - prints this subgraph's SDL to `generated/schema.graphql` (gitignored) offline, for `gateway:schema:compose`.
- `pnpm nx build content_api`
- `node --test backend/plugins/content_api/test/dockerfile.test.cjs`
- `pnpm exec tsc --noEmit -p backend/plugins/content_api/tsconfig.json`
- `pnpm exec jest --config backend/plugins/content_api/jest.postiz.cjs --runInBand`
- No Nx `lint` or `test` target is defined.
