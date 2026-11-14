# @erxes/core-contract

The `/core/v1` API contract (zod 4 + `@orpc/contract`) and event schemas. Core implements it,
core-ui and plugins call it with a typed client, and `openapi.json` describes it for everyone else.

Types flow one way: the Drizzle table (`@erxes/core-db/schema`) → drizzle-zod → these schemas →
the oRPC router and `openapi.json` → `@orpc/tanstack-query` in core-ui. Renaming a column fails
the type check in the contract, the services and core-ui. Clients take only the types from that
chain: at runtime they pass `coreRoutes` (`routes.json`) to `OpenAPILink` and import values from
`src/values.ts`, so a browser never loads a table or drizzle.

- `src/<domain>.ts` has the domain's schemas and its `<domain>Contract`; `src/index.ts` assembles `coreContract`.
- `src/values.ts` has what browsers use at runtime and builds on no table: `CORE_API_PREFIX`, the
  z.enums a UI lists, `RoleKey`, `NewPassword`. A value a UI imports goes here, or in another module
  with no table import (`common.ts`, `money.ts`, `automationDefinition.ts`).
- `src/common.ts` has `Id`, `IdList`, `CursorQuery`, `cursorPageOf`, `isoDate`. `src/events.ts`
  has the event schemas plugins publish. The `/core/v1/stream` messages are Server-Sent Events
  outside the router: `StreamData` in `apps/core-api/src/modules/live/stream.http.ts`, read by
  `apps/core-ui/src/lib/liveClient.ts`.
- `openapi.json` and `routes.json` come from `pnpm openapi`.
- The package has no import-time side effects (`sideEffects: false` in its package.json).

## Rules

- A procedure is `oc.route({ method, path, successStatus?, summary })`, `.input()` and `.output()`.
  Paths are relative to `/core/v1`. Input is one object: path params, query and body merged
  (`{ id, ...changes }`). The summary names the error codes the procedure adds (`409 TAG_EXISTS`).
- List queries extend `CursorQuery` and answer `cursorPageOf(Row)`.
- A schema that mirrors a table starts from the table. Copy `src/tags.ts`:
  - Output: `createSelectSchema(table, refinements).pick({ ... })`, then `.extend({ ... })` for
    computed fields. Pick every column by name, so a new column (a hash, a secret, `orgId`) stays
    private until someone picks it. Services return the row as it is: the schema drops the rest.
  - Timestamps in an output are `isoDate`, a codec from the row's `Date` to an ISO string
    (`isoDate().nullable()` in a hand-written `z.object`). The handler returns the `Date`, clients
    and `openapi.json` see `string`/`date-time`. Inputs, and code that parses JSON from the wire
    (the plugin SDK's `DeliveredEvent`), use `z.iso.datetime()`, so an output schema with
    `isoDate` never goes inside an input.
  - Input: `createUpdateSchema(table, rules).pick({ ... })`; create adds `.required({ name: true })`,
    update `.extend({ id: Id })`. Not `createInsertSchema` with refinements: drizzle-zod 0.8.3 types
    a refined optional column as required.
  - A refinement (`(name) => name.trim().min(1)`, `isoDate`) keeps the column's nullability; a
    schema value (`Id`) replaces it, so add `.nullable()` or `.optional()` yourself. Integers are
    `() => z.int()`, jsonb columns their real shape, enums `z.enum(CONTENT_TYPES)` from `@erxes/core-db/enums`.
    A new list goes into `enums.ts` first: lint fails a `z.enum` with the values written out.
- Read the `openapi.json` diff after every change: zero difference unless the API is meant to
  change (properties moving within an object don't count). A change plugins see follows
  `.agents/skills/plugin-contract/SKILL.md`.
