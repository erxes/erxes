---
name: erxes-extensions
description: Erxes extensions, tenant-installed apps built with erxes-sdk and the erxes-ext CLI. Use when creating an extension, writing its server (schema, resolvers, ctx.db, ctx.gql) or UI (CONFIG placements), or running erxes-ext codegen, check, build, install or dev.
---

# Erxes extensions

An **extension** is one directory under `extensions/` with two halves:

- `server/` runs in a workerd isolate, one call per root GraphQL field. It stores data in its own Mongo collections through `ctx.db` and reads erxes through persisted GraphQL as the signed-in user (`ctx.gql`).
- `ui/src/` is a Module Federation remote. Its `CONFIG` places components into one host plugin's pages, record panels, lists and composers.

The runtime (`backend/services/extensions-runtime`) builds the extension's GraphQL schema from the install and executes it with graphql-js. Each root field checks its permission, then calls the isolate. Nested fields come from the returned JSON. `extensions/response-templates` is the finished reference: copy its shapes.

The id (`package.json` name, kebab case) fixes three names. `pluginName(id)` is the camel case form, so `deal-insights` gives `dealInsights`. That name prefixes every root field (`dealInsightsList`), names the permissions (`dealInsights.<module>.<action>`) and names the remote (`dealInsights_ui`).

## Steps

### 1. Create

From `extensions/`, run `node ../packages/sdk/bin/erxes-ext.cjs create <id> --host <plugin>`, then `pnpm install` at the repo root to link it. The scaffold builds as is: one `Notes` collection, one query, one mutation and a page.

Done when `pnpm --filter <id> build` writes `dist/<id>-1.0.0.erxext.json`.

### 2. Server

Write the schema, resolvers, collections and permissions, then collect them all in the one `defineExtension({...})` call in `server/index.ts`. Rules and the full API are in [`server.md`](server.md). `ctx.db` methods, operators and limits are in [`db.md`](db.md).

Done when every root field has a resolver and a `fieldPermissions` entry, and `pnpm --filter <id> check` is clean. tsc flags a missing entry.

### 3. UI

Write `gql()` documents in `ui/src/graphql.ts`, use them with the `useQuery`/`useMutation` hooks from `erxes-sdk/react`, and name each placed component in `CONFIG` with `extensionComponent(() => import(...))`. See [`ui.md`](ui.md).

Done when every mutation refetches or updates the queries it changes, and every list has loading, empty and error states.

### 4. Build and run

Run `codegen`, then `check`, then `build`. Install on a running stack with `install`, or iterate with `dev`. Flags, auth and dev mode are in [`cli.md`](cli.md).

Done when `erxes-ext build` passes. The runtime refuses at install anything the checks missed.
