# `extensions-runtime` Service Guide

## Identity

- **Service:** `extensions` (service-discovery name; the gateway proxies `/pl:extensions/*` here)
- **Project:** `extensions-runtime`
- **Layer:** Backend service
- **Path:** `backend/services/extensions-runtime`
- **Last synchronized:** `2026-11-04`

## Scope

### Owns

- Running tenant-installed extension code (built with `erxes-ext`, `packages/sdk`) in workerd isolates.
- Each extension's GraphQL endpoint: the schema from its install, executed here with graphql-js. Only root `Query` and `Mutation` fields reach the isolate.
- Install lifecycle per tenant: install, versions, rollback, disable/enable, uninstall, purge.
- Extension-owned Mongo collections `ext.<extId>.<Name>` in the tenant's database, plus their declared indexes.
- Running an install's persisted GraphQL operations through the gateway as the caller.
- Serving installed extensions' UI files and the remote list core-ui loads.

### Does not own

- The SDK and the author CLI (`erxes-ext`). Both live in `packages/sdk`.
- Permission checks themselves: `canGroup` from `erxes-api-shared/core-modules` decides them. This service only writes each tenant's extension permission configs to Redis (`extensions:permissions:<tenant>`).
- The GraphQL deny checks. They live in `backend/erxes-api-shared/src/utils/graphqlPolicy.ts` and are shared with the core agent.
- Any other plugin's collections. Extensions reach other data only through GraphQL as the user.

## Current Capabilities

- `POST /graphql/:extId` runs a GraphQL request against the extension's schema as the signed-in user. Each root field checks its `fieldPermissions` entry (`'public'` skips it), then runs as one isolate call named `Query.<field>` or `Mutation.<field>`. Nested fields resolve from the returned JSON with graphql-js's default resolver. Only a field at the top of the operation (`info.path.prev === undefined`) calls the isolate, and install refuses a root type used as a field type. A request is parsed with a token cap (`EXT_GRAPHQL_MAX_TOKENS`, 2000) before `validate()` runs, then capped on depth and root fields.
- `ctx.db` `find` and `aggregate` read their cursor with a running BSON byte count and stop with `RESULT_TOO_LARGE` once it passes `EXT_MAX_DB_RESULT_BYTES`.
- Errors on `/graphql/*` are GraphQL errors with `extensions.code` (and `extensions.issues` for `INVALID_INPUT`), status 200. Other routes answer `{ ok: false, error: { code, message, issues? } }`.
- Owner-only routes: `POST /install`, `POST /operations` (install-dialog summary), `GET /installed`, `POST /rollback/:extId`, `POST /disable/:extId`, `POST /enable/:extId`, `POST /uninstall/:extId` (`{ purge }`).
- `GET /remotes` and `GET /ui/:extId/:version/*` serve UI remotes. Versions are immutable, except in dev mode.
- Host routes on loopback for workerd only (`x-ext-runtime-token`): `POST /db` (`ctx.db`) and `POST /graphql` (`ctx.gql`).
- `ctx.db` is the Mongo Collection API over one host request `{ collection, method, args }`: `find`, `findOne`, `countDocuments`, `estimatedDocumentCount`, `distinct`, `insertOne`, `insertMany`, `updateOne`, `updateMany`, `replaceOne`, `deleteOne`, `deleteMany`, `findOneAndUpdate`, `findOneAndReplace`, `findOneAndDelete`, `bulkWrite`, `aggregate`. Results follow the driver's; cursors come back as arrays. Every query and update operator works, pipeline updates included.
- Declared indexes are built when a version activates, optionally `unique` and `sparse`. Unique indexes turn duplicate writes into `CONFLICT`.
- Dev mode (`EXT_DEV_MODE=true`): reinstalling a version with a different build replaces it in place, and UI files are served `no-cache`. `erxes-ext dev` relies on it. The process refuses to start with it when `NODE_ENV=production`.

## Architecture

| Area              | Path                              | Responsibility                                                                                                                          |
| ----------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Entry             | `src/main.ts`                     | Starts the public app and the loopback host app, registers the service address in Redis, refuses dev mode in production                 |
| HTTP              | `src/app.ts`                      | Hono routes, session/owner middleware, error envelope and GraphQL errors                                                                |
| Extension GraphQL | `src/extensionGraphql.ts`         | Schema per `buildHash` (cached), token, depth and root-field caps, root resolvers that check permissions and call the isolate           |
| Installs          | `src/installs.ts`                 | Install body validation, schema checks (`checkExtensionSchema`), build hash, versions, activation, disable/enable, uninstall/purge      |
| Storage           | `src/hostDb.ts`                   | `ctx.db` argument parsing, operator and stage refusals, collection-name rewrites, `_id` and timestamp stamping, index build and cleanup |
| GraphQL out       | `src/graphql.ts`                  | Operation summaries at install, persisted-operation calls through the gateway                                                           |
| Permissions       | `src/permissions.ts`              | Action names, per-tenant permission configs in Redis                                                                                    |
| Sandbox           | `src/sandbox.ts`, `src/workerd/*` | workerd process pool, per-call grants, supervisor `Host` entrypoint                                                                     |
| Limits            | `src/limits.ts`                   | Every enforced bound and its env override, `DEV_MODE`                                                                                   |
| Models            | `src/connectionResolver.ts`       | `extensions`, `extension_versions`, `extension_assets`                                                                                  |

## Contracts

### Provides

- HTTP under `/pl:extensions/*` through the gateway. `POST /graphql/<extId>` is what each extension's UI ApolloClient talks to.
- Redis `extensions:permissions:<tenant>`: `IPermissionConfig[]` for the tenant's enabled extensions.
- `GET /remotes`: `{ name, entry }[]` for core-api's `get-frontend-plugins`. `entry` is a gateway path, `/pl:extensions/ui/<extId>/<version>/remoteEntry.js`, never an absolute URL: core-ui prepends its own `REACT_APP_API_URL`, so one runtime serves every SaaS tenant on its own domain without a per-tenant public URL.

### Consumes

- `erxes-sdk`: `checkExtensionSchema`, `pluginName`, error and index types. The worker side (`serve`) is bundled into each extension by `erxes-ext build`, not loaded here.
- `erxes-api-shared`: `createGenerateModels`, `redis`, `getSubdomain`, `canGroup`, `extensionTenant`, `parseGraphqlOperation`, `assertGraphqlResultAllowed`.
- The gateway at `EXT_GATEWAY_URL` for persisted operations, with the caller's credential (their `erxes-sid` session cookie, or a legacy login JWT as a bearer token) and `nginx-hostname`.
- core-api's login sessions in Redis (`session:<subdomain>:<sha256(sid)>`), read to verify the `erxes-sid` cookie.

## Data and State

- Tenant key: `extensionTenant(subdomain)`, the subdomain in SaaS and `os` when self-hosted. Models come from `generateModels(tenant)`, one database per tenant.
- Extension collections: `ext.<extId>.<Name>`. Names match `/^[a-zA-Z][a-zA-Z0-9_]*$/`, PascalCase by convention (`ResponseTemplates`).
- The active version's `typeDefs`, `resolvers` and `fieldPermissions` are copied onto the `extensions` document at activation. The built schema is cached in memory by `buildHash`.
- Grants are in-memory, one per call, revoked when the call ends or the extension is disabled or uninstalled.
- No per-call run log. Failures go to the service log with a correlation id.

## Local Invariants

- Install and every lifecycle route are owner-only.
- Install refuses a schema that doesn't parse or build, a `schema`/`extend schema` definition, a `Subscription` type, a root field not prefixed with `pluginName(id)`, a root field without a resolver or without a `fieldPermissions` entry (`'public'` or a declared `<module>.<action>`), and resolvers on any type but `Query` and `Mutation`.
- graphql-js runs only here. The worker bundle gets plain functions and JSON.
- A version's identity is `buildHash`, one sha256 over the whole install body. Reinstalling a version with a different hash fails `VERSION_EXISTS` outside dev mode. `codeHash` stays as workerd's cache key.
- `ui.remote` must be `<pluginName(id)>_ui`, and `pluginName(id)` must not match another installed extension's or a plugin in the gateway's active plugin list (`getActivePlugins`).
- Switching version (install or rollback) keeps the extension's status. Only a first install, or one after uninstall, starts `installed`.
- `ctx.db` names only the extension's own collections. `$lookup.from`, `$graphLookup.from`, `$unionWith.coll`, `$merge.into` and `$out` are rewritten at any depth to `ext.<id>.<Name>`, and any other name, or a `db` key, is refused with `UNKNOWN_COLLECTION`.
- Refused anywhere in `ctx.db` arguments: `$where`, `$function`, `$accumulator`, `$currentOp`, `$collStats`, `$indexStats`, `$planCacheStats`, `$listSessions`, `$listLocalSessions`, `$changeStream`. Admin methods (`drop`, `rename`, `createIndex`, `watch`, ...) are `METHOD_NOT_ALLOWED`.
- `ctx.db` bounds: `maxTimeMS` 2000 on every call, `allowDiskUse: false`, `find` limit at most 500, `bulkWrite` and `insertMany` at most 500 operations, results at most `EXT_MAX_DB_RESULT_BYTES`. No sessions or transactions.
- `_id` is always a string. Inserts always get a new uuid. Upserts get one unless the filter or the update sets `_id`. Every write stamps `updatedAt`; inserts and upserts set `createdAt`, and replaces keep it.
- An extension runs only GraphQL documents its install shipped, by `sha256:` hash. The shared deny checks run at install on every document, and at call time on the document and variables before the gateway and on the result before the extension.
- An extension's permission actions are always `<pluginName>.<action>`. Core drops anything else.
- workerd has no outbound network. The only ways out are the `Host` methods `db` and `gql`.
- A failed activation drops the indexes it built. One install declares at most 20 collections and 20 indexes.
- `EXT_WORKERD_PROCESSES` defaults to 1. SaaS raises it by env. A process never changes tenant.

## Validation

- `NODE_OPTIONS=--max-old-space-size=4096 node node_modules/typescript/bin/tsc -p backend/services/extensions-runtime/tsconfig.json --noEmit` (src against shared sources)
- `pnpm nx build extensions-runtime` (needs a built `erxes-api-shared`)
- No test or lint target exists.
- Smoke: start the runtime with `EXT_DEV_MODE=true`, then `erxes-ext install --owner <userId>` in `extensions/response-templates` and open Frontline > Response templates.
