# Backend Plugin Rules

## Project Shape

- Backend plugins live in `backend/plugins/<name>_api`.
- The entry point is `src/main.ts` calling `startPlugin()` from
  `erxes-api-shared/utils`.
- Organize features under `src/modules/<feature>` (singular feature names,
  e.g. `task`, `project`, `cycle`) with local `@types` or `types`,
  `db/definitions`, `db/models`, `graphql`, `utils`, and optional `trpc`
  folders.
- Aggregate GraphQL schema strings through `src/apollo/schema/schema.ts` and
  resolver maps through `src/apollo/resolvers`.
- Register models in `src/connectionResolvers.ts` via
  `load<Feature>Class(models, ...)` loaders.
- Plugin metadata (permissions, notifications, automations, segments) lives
  under `src/meta/`.
- Shared backend code belongs in `backend/erxes-api-shared`; rebuild it with
  `pnpm nx build erxes-api-shared` after changes.

## Imports

- Use the plugin's aliases: `~/*` for `src/*`, `@/*` for `src/modules/*`, and
  `erxes-api-shared/*` for the shared library.
- Do not import from another plugin's `src`. Cross-service calls go through
  GraphQL federation or tRPC.
- Do not add a dependency when `erxes-api-shared` or an existing library
  already covers the need.

## Data Layer (Mongoose)

- Define schemas directly with `new Schema(...)`, explicit fields, and local
  options such as `timestamps: true`; do not introduce new `schemaWrapper`
  usage.
- Prefix collection names with the plugin name, such as `operation_tasks`.
- Put business rules and validation in model static methods or feature
  utilities; keep GraphQL resolvers thin.
- All data access is tenant-scoped: always go through the `models` from
  context (built per subdomain in `connectionResolvers.ts`), never a global
  connection.

## GraphQL Rules

- Name queries, mutations, and subscriptions with the plugin or module prefix
  plus purpose (e.g. `operationTaskList`, `operationTaskCreate`); operation
  names must be unique across the federation.
- Call `await checkPermission('<action>')` from context at the start of every
  resolver that reads or mutates protected data.
- Use `cursorPaginate` from `erxes-api-shared/utils` for list responses and
  return `{ list, totalCount, pageInfo }`.
- Keep pubsub/subscription topics plugin-prefixed, such as
  `operationTaskChanged:<id>` and `operationTaskListChanged`. Publish both
  detail and list events when the UI subscribes to both.

## Meta and Wiring

- Update `src/meta/permissions.ts` when adding protected resolvers.
- Update `src/meta/notifications.ts`, automations, segments, and worker/trpc
  wiring only when the feature behavior requires it.
- New plugins must be added to `ENABLED_PLUGINS` in `.env` and follow the port
  allocation in the root CLAUDE.md.

## Validation

Before finishing code changes:

1. Run `pnpm nx build <plugin>_api`.
2. Run `pnpm nx lint <plugin>_api` if a lint target exists.
3. Run `pnpm nx test <plugin>_api` when tests, test setup, or tested behavior
   were touched.
4. Fix introduced TypeScript, build, and Sonar warnings.
5. Remove debug code and review the final diff for unrelated changes.

For documentation-only edits, verify referenced paths and commands exist.
