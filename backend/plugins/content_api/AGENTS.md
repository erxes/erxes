# `content_api` Plugin Guide

## Identity

- **Plugin:** `content`
- **Project:** `content_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/content_api`
- **Last synchronized:** `2026-09-24`

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

- `pnpm nx build content_api`
- `node --test backend/plugins/content_api/test/dockerfile.test.cjs`
- `pnpm exec tsc --noEmit -p backend/plugins/content_api/tsconfig.json`
- `pnpm exec jest --config backend/plugins/content_api/jest.postiz.cjs --runInBand`
- No Nx `lint` or `test` target is defined.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-24` - Bound SaaS delivery sweep memory

- **Summary:** Stream tenant discovery, skip idle delivery collections without loading models, and reuse models for active tenants.
- **Affected areas:** CMS Postiz worker and its regression tests.
- **Contracts changed:** None.

### `2026-09-16` - Include Postiz sharing in CMS authoring roles

- **Summary:** Grant Postiz sharing to the four existing CMS authoring/editor/admin groups without creating a custom group or changing approval rules.
- **Affected areas:** Default permission metadata and role-resolution regression tests.
- **Contracts changed:** Existing default role IDs resolve `cmsPostsSharePostiz` after updated metadata is loaded; Viewer and publication/approval grants are unchanged. No database backfill is required.

### `2026-09-16` - Persist CMS delivery tenant routing

- **Summary:** Route enterprise and SaaS delivery jobs through their originating tenant, including retries and remote status polling.
- **Affected areas:** CMS delivery model, service, worker, history query, tenant guards and regression tests.
- **Contracts changed:** Add optional persisted `subdomain` for backward compatibility. No GraphQL input, signing protocol, secret or startup configuration changes. Legacy enterprise deliveries require verified recovery as documented in `CMS_POSTIZ.md`.

### `2026-09-15` - Match agent installer QEMU compatibility

- **Summary:** Use agent_api's installer-only JIT workaround and preserve dependency installation failures.
- **Affected areas:** Dockerfile, Docker contract tests and this guide.
- **Contracts changed:** None. CI workflow, architectures, image tags, runtime settings and plugin startup remain unchanged.

### `2026-09-15` - Reuse internal JWT authentication for CMS

- **Summary:** Derive CMS signing keys from the existing JWT secret and start the delivery worker without a new secret setting.
- **Affected areas:** CMS bridge, worker startup, authentication tests and deployment notes.
- **Contracts changed:** Retire `CMS_POSTIZ_SHARED_SECRET`; require matching `JWT_TOKEN_SECRET` and coordinated content_api/agent_api deployment. Envelope fields and authorization checks are unchanged.
