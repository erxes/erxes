---
name: graphql-codegen-migration
description: Migrate an erxes plugin to schema-generated GraphQL types. Use when converting a plugin's frontend GraphQL documents to `gql()` from `~/gql`, adding codegen or `schema:print` to a plugin, replacing handwritten GraphQL response types or `useQuery<T>` generics, or tightening a plugin's SDL nullability to match its data.
---

# GraphQL codegen migration

The backend SDL is the **contract**. Codegen checks every frontend document against it and generates the result and variable types, so **drift** between SDL, resolvers and UI goes **red** at build time instead of surfacing as a runtime Apollo error.

`operation` is the finished **reference plugin**. Read its files before writing anything, and copy their shape:

- `scripts/print-subgraph-schema.ts` and the `schema:print` default in `nx.json`, which `backend/plugins/operation_api/project.json` turns on with `"schema:print": {}`
- `backend/gateway/compose-schema.ts` and the `schema:compose` target in `backend/gateway/project.json`, which compose every printed subgraph into `backend/gateway/generated/schema.graphql`
- `frontend/plugins/operation_ui/codegen.ts`, the `codegen` target and the `codegen` entries in `dependsOn` for `build` and `serve` in `frontend/plugins/operation_ui/project.json`, and `src/gql/` in its `.gitignore`
- `frontend/plugins/operation_ui/eslint.config.js` for the enforcement rules
- `frontend/plugins/operation_ui/src/modules/task/types/index.ts` for types derived from generated queries

Work only inside `backend/plugins/<name>_api` and `frontend/plugins/<name>_ui`. The codegen packages already sit in the root `devDependencies`, and every gateway subgraph already has `schema:print`. Codegen reads the **composed** schema, because a plugin's frontend also queries fields that core and other plugins own. Update both plugin `AGENTS.md` guides in every layer.

## Steps

Ship each step as one **layer**: a PR stacked on the one before. Each layer builds, type-checks and passes lint by itself.

### 1. Setup layer

Add `codegen.ts`, the `codegen` target, and the `codegen` entries in `dependsOn` for `build` and `serve` to the frontend. The schema path is `backend/gateway/generated/schema.graphql`, and the `codegen` target depends on `gateway:schema:compose`. A new backend plugin gets `"schema:print": {}` in its `project.json`; the print script picks up `src/apollo/typeDefs.ts` and, when present, `src/apollo/subscription.ts`.

Codegen validates every document in the plugin from the first run, typed or not, so it goes **red** on documents that already drift. Fix each one in this layer: a misspelled field, a field the SDL never had, a wrong argument, an operation name used twice.

Done when `pnpm nx run <name>_ui:codegen --skip-nx-cache` passes, and `pnpm nx build <name>_ui` passes from a clean `src/gql/`.

### 2. Type-error layer

Run `npx tsc -p frontend/plugins/<name>_ui/tsconfig.app.json --noEmit | rg <name>_ui`. Fix every error it prints that points into this plugin. The shared libraries print errors of their own, and the filter hides them.

Done when the filtered output is empty.

### 3. Backend contract layers

Converting documents exposes where the SDL disagrees with the resolvers and the stored data. Fix the backend in its own layers, ahead of the frontend layers that depend on it. Split them by concern, for example required arguments, resolver behavior, and regex escaping. Follow the rules under **Nullability** and **Contract fixes**.

Done when every SDL change has the matching resolver change, and `npx tsc --noEmit -p backend/plugins/<name>_api/tsconfig.json` is clean.

### 4. Module layers

Convert one module per layer, largest first. In each module:

- Every document is `gql(\`...\`)`imported from`~/gql`, written as a function call with no `${}` interpolation.
- Every Apollo hook infers from its document: `useQuery(GET_X)`, never `useQuery<XResponse>(GET_X)`.
- Every handwritten response interface is a type derived from the generated query type:

  ```ts
  export type IDeal = NonNullable<NonNullable<NonNullable<GetDealsQuery['getDeals']>['list']>[number]>;
  ```

- Every `subscribeToMore` and `updateQuery` takes its types from the generated subscription and query types.

Run codegen and the filtered `tsc` after each module, then click through the module in the browser. Every create, update and delete shows up without a reload, and the console stays free of Apollo cache or missing-field warnings.

Done when this prints nothing for the module, codegen passes, and the filtered `tsc` is empty:

```bash
rg -U -l "graphql-tag|\bgql\b[^}]*\}\s*from\s*['\"]@apollo/client['\"]|use(Query|Mutation|Subscription|LazyQuery|SuspenseQuery)<|subscribeToMore<" \
  frontend/plugins/<name>_ui/src/modules/<module>
```

### 5. Enforcement layer

Copy the `no-restricted-imports` and `no-restricted-syntax` rules and the `src/gql/**` ignore from the reference `eslint.config.js`.

Done when the step 4 `rg`, run on `frontend/plugins/<name>_ui/src`, prints nothing, and `pnpm nx lint <name>_ui` reports no new errors.

## Nullability

The generated types follow the SDL. A field that is nullable in the SDL comes out `T | null`, and a field typed `Int` comes out `number`, even where a handwritten interface claimed `string`. Treat every new type error as a question: is the SDL wrong, or was the UI wrong?

Tighten an output field to non-null only when all three hold:

1. The Mongoose schema marks it `required`, or it comes from `timestamps`, or it is `_id`.
2. A count against real tenant data finds zero documents where it is null or missing. Arrays need a separate check, because `$type: 'string'` also matches an array that contains a string.
3. Every write path upholds it. `findOneAndUpdate` and `updateOne` skip Mongoose validators, so an update resolver can still store null. Add a guard in the model's write method when it can.

Fields with only a Mongoose `default` stay nullable. List queries use `.lean()`, which skips defaults on older documents.

A non-null field that resolves to null nulls its parent, and in a list that blanks the whole query. When in doubt, keep the field nullable and handle `null` in the UI.

## Contract fixes

- **Required arguments.** An argument the resolver cannot run without is non-null in the SDL. Keep a runtime guard for empty strings, which GraphQL validation lets through.
- **JSON outputs.** When the UI reads structure out of a `JSON` field, replace it with SDL object types. The resolver then returns that shape every time, with zero-valued objects or empty arrays instead of `{}`.
- **Resolver parity.** Every SDL field has a resolver, and every resolver is declared in the SDL.
- **Regex input.** Request-controlled text that reaches `new RegExp()` or `$regex` goes through `escapeRegExp` from `erxes-api-shared/utils`. The operation plugin's backend `eslint.config.js` has a rule that enforces this.

## Gotchas

- `scripts/print-subgraph-schema.ts` ends with `process.exit`. `erxes-api-shared/utils` opens Redis on import and keeps the process alive.
- One subgraph breaking composition fails every plugin's codegen. Run `pnpm nx run gateway:schema:compose --parallel=2` after changing any SDL. Composition errors here are the same ones the router would hit in production.
- `posclient_api` is not composed. posclient-front talks to it directly, not through the gateway.
- Codegen reads documents statically. A `${FRAGMENT}` interpolation hides the fragment's fields from it, so write fields inline, or define a GraphQL fragment with `gql()` and spread it by name.
- Operation names must be unique. A name like `mutation Mutation` generates `MutationMutation` types, so name every operation after the plugin and module.
- A subscription that evicts cache entries needs `__typename` in its selection, or `cache.identify` finds nothing.
- The shared `PageInfo` SDL marks its booleans nullable, and list items come out nullable. The `erxes-ui` cursor helpers expect non-null values. The reference plugin adapts them in `@/operation/utils/cursorList`, a workaround that stays until core tightens `PageInfo`. Stop and report before copying it into another plugin.
- Pass `--skip-nx-cache` when checking codegen. Otherwise Nx can replay a cached pass.
- From inside a plugin folder, `npx nx codegen --skip-nx-cache` runs that plugin's target. Use `npx` there, because frontend plugins have no `package.json` and `pnpm nx` jumps to the workspace root, where Nx can't tell which project you mean.
- `src/gql/` is gitignored. Running `pnpm nx build` or `serve` regenerates it, and calling rspack directly skips that step.
