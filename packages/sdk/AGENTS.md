# `erxes-sdk` Package Guide

## Identity

- **Package:** `erxes-sdk` (private, workspace only)
- **Project:** `erxes-sdk`
- **Layer:** Author SDK and CLI for erxes extensions
- **Path:** `packages/sdk`
- **Last synchronized:** `2026-11-04`

## Scope

### Owns

- What an extension's server imports: `defineExtension`, `collection`, `Context`, `ExtensionError` and the `ctx.db` types (`erxes-sdk/server`).
- The worker entry `serve(extension)` that `erxes-ext build` bundles into each extension (`erxes-sdk/worker`).
- What an extension's UI imports: `extensionComponent`, `permissionAction`, and `useQuery`/`useLazyQuery`/`useMutation` (`erxes-sdk/react`).
- The schema rules shared by `erxes-ext` and the runtime's install (`checkExtensionSchema`, `extensionTypeDefs`, `pluginName`).
- The `erxes-ext` CLI: `create`, `codegen`, `check`, `build`, `install`, `dev`, and the rspack, codegen and tsconfig settings every extension uses.

### Does not own

- Running extensions, installs and `ctx.db` enforcement. `backend/services/extensions-runtime` does that.
- Where the host renders extension components. core-ui and ui-modules (`PlacementProvider`) do.

## Current Capabilities

- `defineExtension({ types, queries, mutations, resolvers, collections, indexes, permissions, fieldPermissions })` types `fieldPermissions` by the root resolvers and the permission keys. A missing entry fails tsc.
- `Context<typeof collections>` types `ctx.db` from the mongodb driver's types (type-only import). Cursor methods (`find`, `aggregate`) return arrays.
- `erxes-ext create <id> [--host <plugin>]` copies `template/` with the names replaced (`ext-template`, `extTemplate`, `ExtTemplate`, `ext-template-host`) and writes `package.json` and a one-line `tsconfig.json`.
- `erxes-ext codegen` types `server/operations/*.graphql` against the erxes schema into `server/gql/` (persisted, sha256), then `ui/src/**` `gql()` documents against the extension's own SDL into `ui/src/gql/`. The erxes schema is `--schema`, else `ERXES_SCHEMA`, else `backend/gateway/generated/schema.graphql`.
- `erxes-ext check [--schema ...]` runs codegen (the generated `gql/` folders are gitignored), then tsc over `server/` and `ui/src/`, ignoring diagnostics inside `frontend/libs/`.
- `erxes-ext build` runs codegen, then bundles the worker with esbuild (300 KB budget), builds the UI remote with rspack (Module Federation, only `./config` exposed, host libraries shared with `import: false`) and Tailwind CSS the host lacks, and writes `dist/<id>-<version>.erxext.json`.
- `erxes-ext install` builds and POSTs to `<url>/pl:extensions/install` with `ERXES_TOKEN` as a bearer token, or with a minted session for `--owner=<userId>` (needs the stack's Redis env). `--url` defaults to `http://localhost:4000`.
- `erxes-ext dev` installs, then reinstalls on every change under `server/` and `ui/src/`. Live reload: the developer reloads the page. No HMR.

## Architecture

| Area               | Path                                | Responsibility                                                                                            |
| ------------------ | ----------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Server API         | `src/server.ts`                     | `defineExtension`, `collection`, `Context`, `ExtensionCollection`                                         |
| Worker             | `src/worker.ts`                     | `serve`: one `invoke('Query.<field>', args, user, host)` per root field, errors as the runtime's envelope |
| UI API             | `src/react.tsx`                     | Per-extension ApolloClient in a context, hooks bound to it, `extensionComponent`, `permissionAction`, CSS |
| Schema rules       | `src/schema.ts`, `src/names.ts`     | `checkExtensionSchema`, `extensionTypeDefs`, `pluginName`                                                 |
| Errors             | `src/errors.ts`                     | `ExtensionError`, error body types                                                                        |
| CLI                | `src/cli/*.ts`, `bin/erxes-ext.cjs` | Commands; `bin` loads the TypeScript through `tsx/cjs`                                                    |
| Scaffold           | `template/`                         | What `create` copies                                                                                      |
| Extension tsconfig | `tsconfig.extension.json`           | What every extension's `tsconfig.json` extends                                                            |

## Contracts

### Provides

- `erxes-sdk`, `erxes-sdk/server`, `erxes-sdk/worker`, `erxes-sdk/react`, as TypeScript source. `tsconfig.build.json` compiles only `src/index.ts` for the runtime's Docker image.
- The `erxes-ext` bin, linked into every workspace package that depends on `erxes-sdk`.
- The install body: `{ id, version, graphql: { types, queries, mutations }, resolvers, collections, indexes, permissions, fieldPermissions, operations, code, ui }`.
- Build-time globals in the UI remote: `__ERXES_EXT_ID__`, `__ERXES_EXT_CSS__`.

### Consumes

- `REACT_APP_API_URL` from `erxes-ui`. The UI client talks to `${REACT_APP_API_URL}/pl:extensions/graphql/<id>`.
- The composed erxes schema from `gateway:schema:compose`.
- The runtime's `POST /install` route.

## Data and State

- None stored. `extensionComponent` keeps one ApolloClient per extension bundle in module scope and provides it through an SDK context, not `ApolloProvider`.

## Local Invariants

- `src/index.ts` stays loadable in Node with only `graphql` installed: the runtime imports it.
- The worker bundle never includes graphql-js or zod's locales.
- The CLI runs from the monorepo. It resolves `erxes-sdk`, `erxes-ui`, `ui-modules` and React from here, not from the extension.
- An extension's own `tsconfig.json` is one `extends` line. Settings belong in `tsconfig.extension.json`.

## Validation

- `NODE_OPTIONS=--max-old-space-size=4096 node node_modules/typescript/bin/tsc -p packages/sdk/tsconfig.json`
- `pnpm nx lint erxes-sdk`. There is no test target.
- `erxes-ext codegen`, `check` and `build` in `extensions/response-templates`.
- `erxes-ext create probe-ext` in a scratch directory inside the repo, then `check` and `build` in it.
