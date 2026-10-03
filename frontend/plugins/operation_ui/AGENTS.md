# `operation_ui` Plugin Guide

## Identity

- **Plugin:** `operation`
- **Project:** `operation_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/operation_ui`
- **Last synchronized:** `2026-09-29`

## Scope

### Owns

- Operation frontend routes, navigation, projects, tasks, teams, templates, triage, cycles, activity, integration surfaces, relation widgets, notification widgets, automation widgets, and search providers.

### Does not own

- Operation backend persistence or GraphQL resolvers, core UI primitives, shared libraries, or another plugin's source.

## Current Capabilities

- The automations widget answers built-in template prerequisites: the
  `templateRequirement` component type resolves `operation:task.status` by
  reusing `TaskStatusPropertyInput`, which asks for the team and the status
  together and already clears a status the chosen team does not have. It
  reports `{ teamId, status }` upward only once a status is picked, and
  nothing else — a half-made choice leaves the install closed.

- Runs as the `operation_ui` Module Federation remote on port `3006`.
- Registers operation navigation for projects, tasks, team, teams settings, and GitHub integration settings.
- Provides relation widgets for tasks and projects, a task status property input, notification widgets, and automation widgets.
- Task activity rows show the accepting member's avatar and name with a triage-acceptance action; the action component supplies only the action text while the shared activity wrapper supplies the actor and timestamp.
- The My Inbox notification widget shows task, triage, project and team details; task notifications include the task side widgets with a pinned icon column.
- Task and project detail right rails expose configured custom properties in an editable Properties panel with a header action linking to the matching property settings, evenly padded width-constrained scrollable content, and an empty state centered within the remaining rail height.
- Development Rspack serving ignores generated dependency/cache/output folders to keep local file watchers bounded.
- GraphQL codegen (`client-preset`) validates every operation document against the printed `operation_api` schema and generates result and variable types into `src/gql/`.

## Architecture

| Area                 | Path                                                                                     | Responsibility                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Runtime              | `frontend/plugins/operation_ui/src/main.ts`                                              | Starts the operation UI remote.                                                                             |
| Federation config    | `frontend/plugins/operation_ui/module-federation.config.ts`                              | Exposes config, routes, settings, widgets, notifications, and automation entry.                             |
| Dev server config    | `frontend/plugins/operation_ui/rspack.config.ts`                                         | Module Federation development serving and watch ignore rules.                                               |
| Plugin config        | `frontend/plugins/operation_ui/src/config.tsx`                                           | Registers navigation, modules, widgets, property inputs, and search providers.                              |
| Property side panel  | `frontend/plugins/operation_ui/src/modules/operation/components/PropertiesSidePanel.tsx` | Renders settings-configured task and project fields with a header, content inset, and centered empty state. |
| Operation modules    | `frontend/plugins/operation_ui/src/modules`                                              | Owns operation feature UI and route composition.                                                            |
| Pages                | `frontend/plugins/operation_ui/src/pages`                                                | Provides route-level operation pages.                                                                       |
| GraphQL codegen      | `frontend/plugins/operation_ui/codegen.ts`                                               | Generates `src/gql/` (gitignored) from `backend/plugins/operation_api/generated/schema.graphql`.            |
| Relation widgets     | `frontend/plugins/operation_ui/src/widgets/relation`                                     | Provides relation widget exports.                                                                           |
| Notification widgets | `frontend/plugins/operation_ui/src/widgets/notifications`                                | Provides notification widget exports.                                                                       |
| Automation widgets   | `frontend/plugins/operation_ui/src/widgets/automations`                                  | Provides automation remote entry exports.                                                                   |

## Contracts

### Provides

- Module Federation exposes: `./config`, `./operation`, `./operationSettings`, `./relationWidget`, `./notificationWidget`, and `./automationsWidget`.
- Frontend navigation paths under `operation/*` and `settings/operation/*` registered from `src/config.tsx`.
- Relation widget names `tasks` and `projects`, plus property input `taskStatus`.

### Consumes

- Public UI APIs from `erxes-ui` and `ui-modules`.
- Operation API contracts through the plugin's local GraphQL documents and hooks.
- The host i18next `operation` namespace, loaded from gateway English and Mongolian locale JSON files; acceptance activity uses `accepted-triage`.
- The printed operation subgraph schema from the `operation_api:schema:print` Nx target, consumed only at codegen time.
- Core property-field queries and the public `FieldsInDetail` renderer from `ui-modules` for `operation:task` and `operation:project`.
- React Router host mounting contracts from core UI Module Federation.

## Data and State

- Apollo Client owns server state where operation feature hooks use GraphQL.
- React Hook Form and local React state own editable form and component-local state.
- Widget state remains scoped to operation widget modules.
- Task and project custom values are read from and submitted as `propertiesData` through their existing Apollo detail/update flows.

## Local Invariants

- Keep operation-specific UI inside `frontend/plugins/operation_ui`.
- Module Federation exposes, route paths, widget names, and named exports must stay aligned.
- Use `erxes-ui` and `ui-modules`; do not import another plugin's source.
- Keep custom properties as a local panel in the existing task/project right-side `SideMenu`, separate from cross-record relation widget registration; do not duplicate the form in the main detail body.
- The property side panel uses `SideMenu.Header` with a standard-size secondary Manage action to `/settings/properties/<contentType>` and a `p-4` scroll-content inset like neighboring right-rail widgets, while suppressing the shared form's redundant InfoCard shell; its scroll viewport wrapper must remain block-sized to the rail width so fields do not erase the right inset, and it fills the remaining rail height to center the empty state.
- Dev watch ignores must not include plugin source directories required for hot reload.
- `TaskDetails` carries neither padding nor side widgets. Every caller supplies both: `TaskDetailPage`, `TaskDetailSheet` and the My Inbox `NotificationTaskDetail`. Check all three whenever `TaskDetails`' layout contract changes; the inbox caller is easy to miss because it only renders through the `./notificationWidget` remote.
- `TRIAGE_ACCEPTANCE` activities use the activity's `createdBy` for the accepting member and the task's `createdBy` for the original creator; do not nest another timeline row inside the acceptance action.
- My Inbox task and triage details (`NotificationTaskDetail`) keep the task page's dimensions: `p-6` content, `xl:max-w-3xl` centered, and the Open task action in a `max-w-3xl px-6 pt-6` row. Project and team inbox details keep their own `max-w-3xl px-6` layouts; the four stay visually aligned.
- Core-ui's inbox ScrollArea is the only scroll and its viewport content is `min-h-dvh` with no fixed height, so the task side column is `sticky top-0` with its height measured from the enclosing `[data-radix-scroll-area-viewport]`'s `clientHeight`. A `dvh` height leaves sticky no room to move; a nested ScrollArea adds a second, dead outer scroll. If core stops using that ScrollArea, the side column silently does not render while the detail still works.
- Task, triage and activity documents use `gql()` from `~/gql` (codegen's `gqlTagName`); their hooks take and return generated types. `ITask`/`ITriage` are the list item types and `ITaskDetail`/`ITriageDetail` the detail query types, all derived from `~/gql/graphql`. Do not reintroduce handwritten response interfaces for these documents.
- Query hooks take nullable ids (`string | null | undefined`) and guard with `skip`; callers never fabricate empty-string ids. Generated field types are honestly nullable, so components accept `T | null` rather than callers writing `?? undefined`/`?? ''`/`?? 0` at call sites. Remaining coalescing is limited to shared-library boundaries (`SelectMember.Provider`, `ISearchProvider` items) and genuine defaults (array index, form schema sentinels, `totalCount` arithmetic).
- `@/operation/utils/cursorList` adapts generated list responses to the `erxes-ui` cursor helpers (`toCursorPageInfo`, `compactList`, `mergeCursorList`).
- Real-time updates use `useSubscription`, not `subscribeToMore` inside `useEffect`. Detail subscriptions (`operationTaskChanged`) use `ignoreResults: true` and rely on the normalized cache (`__typename` + `_id` identity via `addTypename`, core-ui `InMemoryCache`) to merge changed fields — subscription payloads must not replace whole query results. List subscriptions (`operationTaskListChanged`, `operationActivityChanged`) use `onData`: `delete`/`removed` evicts the entity (`cache.evict` + `cache.gc`) and decrements `totalCount`; `create`/`created` prepends or appends through `cache.updateQuery` guarded by an `_id` presence check; `update`/`updated` needs no manual work. Progress hooks subscribe to `operationTaskListChanged` with a `filter` variable (`projectId` or `cycleId`) and `refetch` on each event. `useGetProject`/`useGetProjects` still use `subscribeToMore` because they watch project documents that are not part of the task/triage/activity set.
- Task list subscriptions handle the `delete` event type that `operation_api` publishes.
- GraphQL documents are static strings with no `${...}` interpolation. Codegen drops interpolated text, so an interpolated selection would be sent at runtime but missing from the generated types.
- `src/gql/` is generated and gitignored; `build` and `serve` depend on the `codegen` target.
- `tsconfig.json` maps both `ui-modules` and `ui-modules/*`. Without the wildcard, every `ui-modules` self-import fails to resolve and its component props silently become `any` in this plugin.
- The task board keeps two Jotai atoms only: `fetchedTasksState` (the items dnd-kit needs at `Board.Provider`, each carrying its `task`) and `taskCountByBoardAtom` (per-column totals shared with the toolbar). Each column replaces its own slice of `fetchedTasksState` wholesale so deleted tasks leave, and counts are written whenever `totalCount` is a number so 0 lands. Reset both atoms in an unmount cleanup, never on mount.
- Documents declare non-null variables (`String!`, `CycleInput!`) for arguments the resolvers can't run without. Optional list-filter variables stay nullable.

## Validation

- `pnpm nx run operation_ui:codegen`
- `pnpm nx build operation_ui`
- `npx tsc --noEmit -p frontend/plugins/operation_ui/tsconfig.app.json` - no errors under `frontend/plugins/operation_ui`; errors reported inside `frontend/libs` are pre-existing and owned by those libraries.
- Smoke scenario: open operation projects, tasks, team, operation settings, relation widgets, and automation widget entry through the remote.
- Inbox smoke: open a task, triage, project and team notification in My Inbox; the task detail is padded, shows side widgets, and its icon column stays put while scrolling.
- Triage smoke: when a second member accepts a triage, the task timeline shows the original creator and a separate acceptance row with the second member's photo, name, and acceptance time.
