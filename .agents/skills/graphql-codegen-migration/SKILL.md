---
name: graphql-codegen-migration
description: Codegen for erxes GraphQL against the composed schema. Use when migrating a plugin UI to `gql()` from `~/gql`, fixing a codegen or `schema:compose` error, or adding a backend to the composed schema.
---

# GraphQL codegen migration

Each backend prints its subgraph SDL offline with the `schema:print` Nx target. `gateway:schema:compose` composes every backend that has that target into the **composed schema**, `backend/gateway/generated/schema.graphql`. Frontend codegen checks documents against the composed schema, so a plugin's queries for core, operation or content fields type-check.

The composed schema is the repo-wide codegen schema. No single deployment serves it. Each deployment's router composes core plus its enabled plugins at runtime. `@apollo/composition` is pinned to 2.9.3, the federation version the runtime router composes with, so a set of subgraphs that fails offline compose also fails in the router.

**Drift** is any mismatch between a document and the composed schema. Fix drift at its source: the query, or the backend SDL and resolver that own the field. Keep every type as strict as the composed schema says.

`operation_ui` is the finished reference. Copy its `codegen.ts`, the `codegen`, `build` and `serve` targets in its `project.json`, its `eslint.config.js`, and its `src/modules/task/types/index.ts` for types derived from generated queries.

Work inside `backend/plugins/<name>_api` and `frontend/plugins/<name>_ui`, plus the plugin's `ci-ui-<name>.yml`.

## Steps

Ship each step as its own PR when the plugin is large. Each one builds and type-checks by itself.

### 1. Join

- Backend: add `"schema:print": {}` to the plugin's `project.json`. `nx.json` supplies the target, and compose picks the backend up from it.
- Frontend: copy operation's `codegen.ts` and its `codegen` target, which depends on `gateway:schema:compose`. Add `codegen` to `dependsOn` for `build` and `serve`.
- Copy operation's `build` `inputs`, including `{ "dependentTasksOutputFiles": "**/*.ts" }`. `src/gql/` is gitignored, so Nx hashes it only through that input. Without it, a backend-only SDL change replays a cached bundle built against stale types.
- Add `src/gql/` to the plugin's `.gitignore`.
- Copy the backend `paths` block from `ci-ui-operation.yml` into the plugin's CI workflow. It watches every backend's `src/**`, because SDL strings import constants from anywhere in `src`.

Done when `nx run gateway:schema:compose` passes and `nx run <name>_ui:codegen --skip-nx-cache` runs as far as validating documents. Validation errors are expected at this point.

### 2. Make every document parse

Codegen reads documents statically and validates every one of them from the first run. A `${...}` interpolation inside a document fails to parse. Rewrite each one with the patterns in [fragments.md](fragments.md).

Done when codegen reports no syntax errors.

### 3. Clear validation errors

Sort each error with [errors.md](errors.md). Fix query mistakes in this plugin. Fix drift in this plugin's backend in its own PR, ahead of the frontend PR that needs it.

Operation names are unique repo-wide and named after the plugin and module (`frontlineConversationDetail`). Codegen turns a shared name like `mutation Mutation` into colliding types, and 122 names collide across the repo today.

Done when `nx run <name>_ui:codegen --skip-nx-cache` exits 0, or every remaining error is listed in the PR as drift in another team's subgraph with that owner's issue linked.

### 4. Convert modules

Convert one module per PR, largest first. In each module:

- Every document is `gql(\`...\`)`imported from`~/gql`, a static string.
- Every Apollo hook infers from its document: `useQuery(GET_X)`.
- Every handwritten response interface becomes a type derived from the generated query:

  ```ts
  export type IDeal = NonNullable<NonNullable<NonNullable<GetDealsQuery['getDeals']>['list']>[number]>;
  ```

- Component props take the generated types, `null` included, so values pass through as they are, with no `?? undefined` conversions.
- Live updates use `useSubscription(DOC, { variables, onData })` or `subscribeToMore`, typed by the generated subscription and query types. `operation_ui/src/modules/task/hooks/useGetTask.tsx` shows the shape.

After each module, click through it in the browser. Every create, update and delete shows up without a reload, and the console has no Apollo cache or missing-field warnings.

Done when this prints nothing for the module, and codegen and the filtered `tsc` from **Verify** are clean:

```bash
rg -U -l "graphql-tag|\bgql\b[^}]*\}\s*from\s*['\"]@apollo/client['\"]|use(Query|Mutation|Subscription|LazyQuery|SuspenseQuery)<|subscribeToMore<" \
  frontend/plugins/<name>_ui/src/modules/<module>
```

### 5. Enforce

Copy the `no-restricted-imports` and `no-restricted-syntax` rules and the `src/gql/**` ignore from operation's `eslint.config.js`.

Done when the step 4 `rg` over all of `frontend/plugins/<name>_ui/src` prints nothing, so every document in the plugin goes through `gql()` from `~/gql`, and `nx lint <name>_ui` reports no new errors.

## Nullability

Generated types follow the composed schema. A nullable field comes out `T | null`, and an `Int` comes out `number`. Each new type error asks whether the SDL or the UI is wrong.

Tighten an output field to non-null only when all three hold:

1. The Mongoose schema marks it `required`, it comes from `timestamps`, or it is `_id`.
2. A count against real tenant data finds zero documents where it is null or missing. For arrays, check separately, because `$type: 'string'` also matches an array holding a string.
3. Every write path upholds it. `findOneAndUpdate` and `updateOne` skip Mongoose validators, so add a guard in the model's write method.

Fields with only a Mongoose `default` stay nullable, because `.lean()` list queries skip defaults on older documents. A non-null field that resolves to null nulls its parent, and in a list that blanks the whole query. When in doubt, the field stays nullable and the UI handles `null`.

## Ground rules

- SDL stays as template strings in TypeScript, which the print script imports from `src/apollo/typeDefs.ts` and `src/apollo/subscription.ts`. A subscription field lives in `subscription.ts` only. Declaring it in the subgraph SDL too fails `schema:print`.
- Generated output (`src/gql/`, `backend/**/generated/`) is gitignored and built by Nx.
- Backend changes stay inside the plugin's own `src`. Dockerfiles, `erxes-api-shared` and the shared print and compose scripts are platform work with their own PRs.
- Resolvers keep their current typing. Codegen types the frontend only, for now.

## Verify

Run from the repo root, scoped to the plugin. On a shared machine, wrap each command as [shared-box.md](shared-box.md) describes.

```bash
pnpm nx run gateway:schema:compose --parallel=2
pnpm nx run <name>_ui:codegen --skip-nx-cache --parallel=2
npx tsc -p frontend/plugins/<name>_ui/tsconfig.app.json --noEmit | rg <name>_ui
pnpm nx build <name>_ui --parallel=2
pnpm nx lint <name>_ui
```

`--skip-nx-cache` keeps Nx from replaying a cached codegen pass. The `rg` filter hides type errors that belong to `erxes-ui` and `ui-modules`.

## Gotchas

- A subscription that evicts cache entries selects `__typename`, so `cache.identify` finds the entry.
- The shared `PageInfo` SDL has nullable booleans, and list items come out nullable. `erxes-ui` cursor helpers expect non-null values. Operation adapts them in `@/operation/utils/cursorList`. Stop and report before copying that into another plugin, because the real fix is tightening `PageInfo` in core.
- Frontend plugins have no `package.json`, so `pnpm nx` from inside a plugin folder runs at the workspace root. Run Nx from the repo root with the project name.
