# Operation Plugin Reference

Use `operation_ui` and `operation_api` as the preferred reference plugins when
the touched plugin has no stronger local pattern. The operation plugin is a
good baseline for feature-local structure, cursor lists, route/page splits,
backend module layout, permissions, and plugin metadata.

Reference paths:

- Frontend: `frontend/plugins/operation_ui`
- Backend: `backend/plugins/operation_api`

## General Rules

- Do not import from `operation_ui` or `operation_api` into another plugin.
  Copy the pattern locally or move truly reusable code to `erxes-ui`,
  `ui-modules`, or `erxes-api-shared` only when reuse is clear.
- Prefer the closest operation feature as the example:
  - `task` for rich list/detail/table/board behavior
  - `project` for detail layout, side widgets, progress queries, and relation
    subscriptions
  - `cycle` for compact cursor lists and date-driven progress queries
  - `triage` for two-pane flows and conversion actions
  - `team` for settings, members, statuses, and permission-managed records
  - `template` for compact CRUD settings patterns
- Keep behavior feature-local unless the repo already has a shared location.
- Preserve operation-style thin route/page files and move feature internals
  under `src/modules/<feature>`.

## Frontend Rules

- Keep plugin entry/config files at `src/config.tsx`, `src/main.ts`,
  `src/bootstrap.tsx`, and `module-federation.config.ts`.
- Put route-level wrappers in `src/pages` when the plugin already follows that
  split; put reusable feature internals under `src/modules/<feature>`.
- Keep feature `components`, `hooks`, `graphql`, `states`, `types`,
  `constants`, and `contexts` near the owning module.
- Use `@/*` for `src/modules/*` imports and `~/*` for `src/*` imports when the
  plugin config supports those aliases.
- Use `erxes-ui` and `ui-modules` components before creating new primitives.
- Use `@tabler/icons-react` for plugin icons.
- Put widget entry points under `src/widgets`; do not use `src/widgets` as a
  general shared component folder.
- Keep Module Federation exposes small and host-facing, like operation's
  `./config`, route entry, settings entry, and widget exposes.

## Lists, Filters, and State

- For cursor tables, prefer the operation pattern:
  `RecordTable.Provider`, `RecordTable.CursorProvider`,
  `RecordTable.CursorBackwardSkeleton`, `RecordTable.RowSkeleton`,
  `RecordTable.RowList`, and `RecordTable.CursorForwardSkeleton`.
- Use `useRecordTableCursor`, `validateFetchMore`, `mergeCursorData`, and a
  stable cursor session key for cursor pagination.
- Store list filters and table controls in URL query state when the page must
  survive reloads, links, or navigation.
- Use Jotai atoms for shared page state such as active detail sheets, create
  sheets, total counts, command bars, and persisted view mode.
- Keep atoms in the feature's `states` folder and name them with feature
  context, such as `taskCreateSheetState` or `tasksViewAtom`.
- Let Apollo own server data. Do not duplicate lists into Jotai or local state
  without a clear reason.

## GraphQL and Apollo

- Keep frontend GraphQL documents under the feature's `graphql/queries`,
  `graphql/mutations`, or `graphql/subscriptions` folder.
- Name new GraphQL queries, mutations, and subscriptions with the plugin or
  module prefix plus purpose, and keep names unique. Prefer names like
  `operationTaskList`, `operationTaskCreate`, and `cmsPageList`.
- Do not copy older unprefixed operation names such as `GetTasks` into new
  code; follow the current naming rule.
- Keep Apollo hook wrappers near the feature and mirror the operation name or
  behavior, such as `useTasks`, `useProjects`, `useGetCycle`, or
  `useCreateTask`.
- Build variables in a dedicated hook when they combine route params, URL
  state, current user, cursor state, and caller overrides.
- Use existing toast, refetch, cache update, subscription, and fetchMore
  patterns from the same feature before adding new behavior.
- After mutations, keep affected operation-style surfaces fresh without browser
  refresh: list tables, boards, detail sheets, side widgets, totals, progress
  widgets, and selectors should update through cache writes, refetching, or
  subscriptions.
- For live lists, follow operation's `subscribeToMore` update style and
  operation-prefixed subscription topics such as
  `operationTaskListChanged`.
- When adding backend mutations for real-time screens, publish both detail and
  list events when the UI subscribes to both, following
  `operationTaskChanged:<id>` plus `operationTaskListChanged` or the equivalent
  plugin-prefixed channel.

## Backend Rules

- Organize backend features under `src/modules/<feature>` with local
  `@types` or `types`, `db/definitions`, `db/models`, `graphql`, `utils`, and
  optional `trpc` folders.
- Define Mongoose schemas directly with `new Schema(...)`, explicit fields, and
  local options such as `timestamps: true`; do not introduce new
  `schemaWrapper` usage.
- Put business rules and data validation in model/static methods or feature
  utilities, then keep GraphQL resolvers thin.
- Use `load<Feature>Class(models, ...)` model loaders and register collections
  from `connectionResolvers.ts`.
- Prefix collection names with the plugin name, such as `operation_tasks` and
  `operation_projects`.
- Add GraphQL type/query/mutation strings in the feature schema file and wire
  them through `src/apollo/schema/schema.ts`.
- Add resolver maps in feature-local `queries`, `mutations`, and
  `customResolvers` folders, then aggregate them from `src/apollo/resolvers`.
- Call `checkPermission` at the start of every resolver that reads or mutates
  protected data.
- Use `cursorPaginate` for cursor-backed list responses and return
  `{ list, totalCount, pageInfo }`.
- Keep subscriptions and pubsub payload names plugin-prefixed, such as
  `operationTaskChanged` and `operationProjectListChanged`.
- Update `src/meta/permissions.ts`, `src/meta/notifications.ts`, tags, and
  worker/trpc wiring only when the feature behavior requires it.

## Validation

- Frontend operation reference validation:
  `pnpm nx lint operation_ui` and `pnpm nx build operation_ui`.
- Backend operation reference validation:
  `pnpm nx build operation_api`.
- Run tests when test setup or tested behavior changed.
