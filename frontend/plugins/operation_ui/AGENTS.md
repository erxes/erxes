# `operation_ui` Plugin Guide

## Identity

- **Plugin:** `operation`
- **Project:** `operation_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/operation_ui`
- **Last synchronized:** `2026-10-23`

## Scope

### Owns

- Operation frontend routes, navigation, projects, tasks, teams, templates, triage, cycles, activity, integration surfaces, relation widgets, notification widgets, automation widgets, and search providers.

### Does not own

- Operation backend persistence or GraphQL resolvers, core UI primitives, shared libraries, or another plugin's source.

## Current Capabilities

- Task date filters use the shared date picker for due, start, creation, update, and completion ranges. Task lists and statistics parse the same URL ranges into paired API bounds, and date-filtered lists refetch on task subscription events.

- The automations widget answers built-in template prerequisites: the
  `templateRequirement` component type resolves `operation:task.status` by
  reusing `TaskStatusPropertyInput`, which asks for the team and the status
  together and already clears a status the chosen team does not have. It
  reports `{ teamId, status }` upward only once a status is picked, and
  nothing else — a half-made choice leaves the install closed.

- Runs as the `operation_ui` Module Federation remote on port `3006`.
- Registers operation navigation for projects, tasks, team, teams settings, and GitHub integration settings.
- The main menu lists Projects, My Tasks, and each of the current user's teams. The host context column shows only the active team's Triage, Projects, Tasks, and Cycles, with team-settings and copy-link actions, on `operation/team/:teamId/*` routes and stays hidden on every other operation route.
- Provides relation widgets for tasks and projects, a task status property input, notification widgets, and automation widgets. Relation widgets also list tasks and projects linked to the host's customers and companies under a "Through contacts" section.
- Task activity rows show the accepting member's avatar and name with a triage-acceptance action; the action component supplies only the action text while the shared activity wrapper supplies the actor and timestamp.
- GitHub-created triages show a link to the originating repository issue above the name, like the task GitHub badge. Their creation timeline and relation widget card use the short "Created from GitHub issue" attribution; manually created triages retain their user attribution.
- Task, project, and triage activity timelines use action-specific icons; assignee changes and triage acceptance show the actor's avatar and hover label instead. The sentence names each entry's creator, while assignee changes show the new assignee only in the change detail.
- The My Inbox notification widget shows task, triage, project and team details; task notifications include the task side widgets with a pinned icon column.
- Task and project detail right rails expose configured custom properties in an editable Properties panel with a header action linking to the matching property settings, evenly padded width-constrained scrollable content, and an empty state centered within the remaining rail height.
- Imports plain Markdown descriptions from GitHub issues into editable task and triage blocks while retaining BlockNote JSON for locally edited descriptions.
- Development Rspack serving ignores generated dependency/cache/output folders to keep local file watchers bounded.
- GraphQL codegen (`client-preset`) validates every operation document against the composed gateway schema and generates result and variable types into `src/gql/`.
- Task detail and add-task form chips render as labelled field groups, as Sales' deal and Frontline's ticket chips do: a muted label segment, then the value and a chevron, e.g. `Priority | High ⌄`. Status, priority, assignee, start date, due date, team, cycle, project, estimate, milestone and tags are labelled in the detail; the add-task form labels the same fields except team, which stays the sheet header breadcrumb.
- Task start/due dates follow Sales' `DateSelectDeal`: every variant's popover holds erxes-ui `DatePicker` in `inline` mode (typed input above the calendar) and closes on any date change and on Enter in the typed input. A labelled chip swaps its chevron for an X that clears the date while one is set; clearing sends `null`. The picked date shows at once, and a failed save rolls back to the last server-confirmed value only when it is the latest save.
- Task tags render as one `Tags | Tag +N` chip (`OperationTagsChip`, `operation:task`) in both the detail and the add-task form, matching ticket and deal detail; the detail tags through `targetIds`, the form through `onValueChange`.
- The add-project form draws the same labelled chips for status, priority, lead, members, start date, target date and tags; team stays the sheet header breadcrumb. The project detail draws them too, plus a labelled team chip and labelled Customers and Companies chips (`ProjectContactsField`: ui-modules `ContactsRelationField` with `variant="chip"`; each linked contact opens in the side panel, the chevron opens the customer/company picker, saved on the project's own single `customerId` / `companyId` through `updateProject`, which also evicts cached `getProjects` lists). Labelled project date chips open erxes-ui `DatePicker` in `inline` mode (typed input above the calendar, Enter closes), as task dates do; a set date's chip shows an X that clears it, and in the detail clearing sends `null`. Unlabelled project date selects (table, filters) keep the plain `Calendar`.

- Tasks open in the app's side panel (`?panel=/detail/operation:task/<id>`), not a popup: list rows, board cards, the more-column, relation-widget cards, triage conversion and a task just created all open there. Its Detail tab is drawn like a customer's: one column of `PanelField` rows (label, then the value as a record-table cell; click to edit, Enter saves, Escape cancels) for name, status, priority, assignee, dates, team, project, cycle, milestone, estimate, tags, customers and companies (ui-modules `ContactsRelationField`: chips that open the customer/company in the panel, a pencil/Add opening the usual customer/company picker; saved on the task's own single `customerId` / `companyId` through `updateTask`), then the shared `PanelDescriptionField`. The panel's top bar holds the task's actions (`actions` view, `TaskPanelActions`): the GitHub link when synced and `TaskDetailActions`, whose menu holds Convert to project (or Go to project once converted) beside Set due date, Move to team, Make a copy and Copy; the project form opens from `ConvertToProjectSheet` outside the menu so it survives the menu closing. Convert to project is offered only there (the full-page task view uses the same menu). Templates are not offered in the panel. Properties and Activity (operation's own `ActivityList`) also come from `./recordPanel`; a task has no Relations tab: its customers and companies are in Detail, and other records link to it through them (open the customer to see them). Old `?task_id=` links are moved into the panel by `TaskDetailLink`.
- Triages are their own record type, `operation:triage`, and open in the side panel too (`recordPanels` entry with `properties: false`, so no Properties tab): Detail (`TriagePanelDetail`: name, priority, team, customers, companies via `RecordContactsField` saved with `operationUpdateTriage`, description), Activity, and Accept as task / Decline in the top bar (`TriagePanelActions`). There is no add-triage form: `AddTriageButton` (triage pages, the task relation widget) and the contact Tasks section open a triage draft (`useCreateTriageRecord().openTriageDraft`) in the page's triage team (else the user's first team with triage on); `TriagePanelNew` is the triage's Detail fields as a form (name, priority, triage team, customers, companies, description; ui-modules `PanelFormRow` / `PanelFormLayout`); nothing is saved until Save, then `operationAddTriage` creates it with its customer / company (no relation is made to the record it was filed from) and the triage replaces the draft. Cancel leaves nothing. With no triage team the button and the contact section's `+` are hidden. Accepted or declined, the triage becomes a task with the same `_id` that keeps its links; `useConvertTriage` evicts the cached `getTask` for that id.
- New tasks start as a draft in the side panel (`/detail/operation:task/new`, ui-modules `openNewRecord`): `AddTaskButton` (and `C`), the board column `+` and the contact Tasks section call `useCreateTaskRecord().openTaskDraft`, which resolves the team (page → project's → first team), project, cycle and assignee into the draft. `TaskPanelNew` (the `new` view) is the task's Detail fields as a form (ui-modules `PanelFormRow` / `PanelFormLayout`, the selects' `FormItem` variants), prefilled from the draft, with Name focused; nothing is saved until Save, then `createTaskRecord` creates it in one `createTask` (with any contacts) and the task replaces the draft (`replace`, Back unchanged). Cancel leaves nothing. Closing a draft leaves nothing. Make a copy creates directly with `createTaskRecord`. There is no add-task form.

## Architecture

| Area                    | Path                                                                                     | Responsibility                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| App sidebar | `frontend/plugins/operation_ui/src/Sidebar.tsx` | `OperationSidebar` (app sidebar) and `OperationSidebarFooter` (Settings link), rendered by the `./operation` entry through `AppLayout` |
| Runtime                 | `frontend/plugins/operation_ui/src/main.ts`                                              | Starts the operation UI remote.                                                                                              |
| Federation config       | `frontend/plugins/operation_ui/module-federation.config.ts`                              | Exposes config, routes, settings, widgets, notifications, and automation entry.                                              |
| Dev server config       | `frontend/plugins/operation_ui/rspack.config.ts`                                         | Module Federation development serving and watch ignore rules.                                                                |
| Plugin config           | `frontend/plugins/operation_ui/src/config.tsx`                                           | Registers navigation, modules, widgets, property inputs, and search providers.                                               |
| Navigation              | `frontend/plugins/operation_ui/src/modules/navigation`                                   | `MainNavigation` (`navigationGroup.content`) and the active-team `TeamsNavigation` (`navigationGroup.subGroup`).             |
| Property side panel     | `frontend/plugins/operation_ui/src/modules/operation/components/PropertiesSidePanel.tsx` | Renders settings-configured task and project fields with a header, content inset, and centered empty state.                  |
| Description editor      | `frontend/plugins/operation_ui/src/modules/operation/hooks/useDescriptionEditor.ts`      | Loads BlockNote JSON or imports Markdown for task and triage details.                                                        |
| Operation modules       | `frontend/plugins/operation_ui/src/modules`                                              | Owns operation feature UI and route composition.                                                                             |
| Activity timeline       | `frontend/plugins/operation_ui/src/modules/activity/components`                          | Renders activity actors and field changes for task, project, and triage details.                                             |
| GitHub triage detection | `frontend/plugins/operation_ui/src/modules/operation/utils/isGithubTriage.ts`            | Shared type guard for GitHub source links and creator attribution in triage details, creation timelines, and relation cards. |
| Pages                   | `frontend/plugins/operation_ui/src/pages`                                                | Provides route-level operation pages.                                                                                        |
| GraphQL codegen         | `frontend/plugins/operation_ui/codegen.ts`                                               | Generates `src/gql/` (gitignored) from `backend/gateway/generated/schema.graphql`.                                           |
| Relation widgets        | `frontend/plugins/operation_ui/src/widgets/relation`                                     | Provides relation widget exports.                                                                                            |
| Notification widgets    | `frontend/plugins/operation_ui/src/widgets/notifications`                                | Provides notification widget exports.                                                                                        |
| Automation widgets      | `frontend/plugins/operation_ui/src/widgets/automations`                                  | Provides automation remote entry exports.                                                                                    |

## Contracts

### Provides

- `widgets.contactWidgets: [{ name: 'tasks' }, { name: 'projects' }]` with `./contactWidget` (`src/widgets/contact/ContactWidgets.tsx`): the Tasks and Projects sections of a customer's / company's side panel overview (ui-modules `ContactWidgetSection`), found by the contact on the records themselves. Tasks: `getTasks` and `operationGetTriageList` filtered by `customerId` / `companyId` (triages first, `TriageRow` / `TaskItemRow`); titled **Tasks & triages**; `+` only opens a triage draft (whose create mutation saves the contact) and is hidden while no team of the user has triage on. Projects: `getProjects` filtered the same way; `+` opens `AddProjectForm` with `contacts`, passed to `createProject`. Records keep their contacts themselves: never create core relations for record ↔ contact links; the side rail (`TaskSideWidgets` → `RelationWidgetSideTabs`) is given the task's `customerId` / `companyId`; task, triage and project contact fields pick one of each.
- Module Federation exposes: `./config`, `./operation`, `./relationWidget`, `./recordPanel`, `./notificationWidget`, and `./automationsWidget`.
- `widgets.recordPanels: [{ contentType: 'operation:task' }]` with `./recordPanel` (`src/widgets/record-panel/RecordPanel.tsx`, `IRecordPanelProps` from ui-modules): core-ui's side panel asks it for a task's `title`, `actions`, `detail`, `properties` or `activity` view.
- Frontend navigation paths under `operation/*` and `operation/settings/*` registered from `src/config.tsx`.
- Relation widget names `tasks` and `projects`, plus property input `taskStatus`.

### Consumes

- Public UI APIs from `erxes-ui` and `ui-modules`.
- Operation API contracts through the plugin's local GraphQL documents and hooks.
- The host i18next `operation` namespace, loaded from gateway English and Mongolian locale JSON files; acceptance activity uses `accepted-triage`.
- The composed client-facing schema from the `gateway:schema:compose` Nx target, consumed only at codegen time.
- Core property-field queries and the public `FieldsInDetail` renderer from `ui-modules` for `operation:task` and `operation:project`.
- React Router host mounting contracts from core UI Module Federation.

## Data and State

- Apollo Client owns server state where operation feature hooks use GraphQL.
- The triage detail query reads the GitHub issue number, URL, and repository name when the API provides them.
- React Hook Form and local React state own editable form and component-local state.
- Task and triage descriptions remain in their existing API string field; GitHub Markdown is imported into the editor on display and edited content is saved as BlockNote JSON.
- Widget state remains scoped to operation widget modules.
- Task and project custom values are read from and submitted as `propertiesData` through their existing Apollo detail/update flows.

## Local Invariants

- Tasks and projects listed for another record (overview sections, the `tasks` / `projects` relation widgets in `dense` mode) are one-line rows: `widgets/rows/TaskRow` (name and due date; falls back to the triage when the id is one; opens the task stacked in the side panel, a triage in a sheet) and `ProjectRow` (opens `/operation/projects/<id>/overview`). There are no widget cards.
- Task details (the side panel's `TaskPanelDetail` rows and the full-page `TaskFields` chips) show Cycle only when the team has `cycleEnabled`, Estimate only when the team has estimate choices, and Milestone only when the task's project has milestones, all from `useTaskOptionalFields` (it reuses the selects' queries).
- `useTaskDetailSheet()` is the task open in the side panel: `[taskId | null, setTask]`, where `setTask(id, { stack: true })` opens it from inside the panel (relation cards, so the panel's Back returns to the previous record) and a plain `setTask(id)` (lists, boards) starts the panel's history afresh; `setTask(id)` opens it there and `setTask(null)` closes the panel only when it shows a task. Never reintroduce a task popup or `?task_id=` state; `TaskDetailLink` (rendered by the tasks and triage views) only redirects old links.
- "Your teams" collapsibles in `TeamsNavigation` are controlled by
  `openTeamsNavigationState` (localStorage `operation:open-teams-navigation`),
  and the team in the current route (`/operation/team/:teamId/…`) always
  unfolds. Keep them controlled: the app sidebar remounts whenever the user
  switches app tabs, so uncontrolled open state would be lost.
- The plugin owns its whole app sidebar. `src/modules/OperationMain.tsx` (the `./operation`
  expose) wraps its routes in `erxes-ui` `AppLayout` (`id="operation"`) with
  `OperationSidebar`. Core-ui draws only the top `CoreTab` bar; `navigationGroup` in
  `src/config.tsx` supplies just the tab name, icon and `defaultPath` and takes
  no `content`/`subGroup`.
- `OperationSidebarFooter` pins a Settings link to the bottom of the app
  sidebar. The plugin owns its settings at `/operation/settings/*`, served by its
  own entry: the entry's top-level `<Routes>` sends `settings/*` to
  `OperationSettingsLayout` (`src/Sidebar.tsx`, an `AppLayout` titled
  "<Plugin> settings" with a Back link to the app) and `*` to the app
  `AppLayout`. Settings pages render inside `PluginSettingsRoutes`
  (`ui-modules`), which also serves `tags` and `properties/*` scoped to
  this plugin's types; the settings sidebar appends
  `PluginSharedSettingsNavigation`, which lists Tags/Properties only when the
  plugin registers those types. Core organization settings never list
  plugin settings, `config.tsx` has no `settingsNavigation`, and there is
  no `./operationSettings` expose; old `/settings/operation/…` URLs are redirected
  by core. The settings navigation renders no `Sidebar.GroupLabel`.
- Page header breadcrumbs follow the shared pattern: crumbs are default ghost `Button`s (no `font-semibold`), the first crumb carries a 16px icon in the default text color, crumbs are separated by `Separator.Inline` or `Breadcrumb.Separator`, and settings pages carry no favorite toggle.
- Keep user-facing task labels as Due date while retaining `targetDate` in storage and API fields. Date-filtered task lists must refetch inside `useSubscription.onData` before applying create/delete cache changes; updates can move a task into or out of a range.

- Teams are main-menu items in `MainNavigation` that link to `operation/team/:teamId`, which redirects to tasks, so every team sub-route keeps the team row active. `TeamsNavigation` renders only on `/operation/team/:teamId/*`, loads the team with `useGetTeam` so non-member team links still resolve, and returns `null` elsewhere. Its `subGroup` Suspense fallback is `null`, so the host context column stays hidden off team routes instead of flashing open while the chunk loads.
- Keep operation-specific UI inside `frontend/plugins/operation_ui`.
- Use `isGithubTriage` for GitHub triage attribution and source-link visibility: require a `system` creator, numeric triage status, non-empty issue URL, and numeric issue number. Tasks, projects without issue metadata, and other triages retain normal creator attribution.
- GitHub triage attribution consumes `ITriageDetail` from the generated detail query, which selects the triage status and issue metadata. Keep the shared helper and relation card on detail types; `ITriage` is the list-query item and does not select those fields. Render the source link from the guarded triage object so `isGithubTriage` narrows the nullable issue URL.
- `CreatorInfo` uses one `ActivityTimelineItem` for both GitHub and member creation attribution; only the avatar and attribution content vary, with `ActivityActor.Provider` supplying member context and skipping member lookup for `system` creators.
- `ActivityIcon` is rendered inside `ActivityActor.Provider`. Assignee-change and triage-acceptance avatars, their hover labels, and every actor name resolve from `activity.createdBy`; never use `metadata.newValue` for the actor. Other modules retain action-specific icons, and changed field values belong in the entry body.
- Module Federation exposes, route paths, widget names, and named exports must stay aligned.
- Use `erxes-ui` and `ui-modules`; do not import another plugin's source.
- Relation widgets go only through contacts: each lists the records whose
  own `customerId` / `companyId` is the host's customer or company
  (ui-modules `getHostContacts`: the host itself when it is a contact, else
  the first of `customerId(s)` / `companyId(s)` from `IRelationWidgetProps`),
  read with this plugin's own list query, the host left out. "+" creates a
  record with those contacts through its create mutation. No core relation
  is created or read for record ↔ record or record ↔ contact links, and there
  is no "choose existing" picker.
- `TaskSideWidgets` renders the shared `RelationWidgetSideTabs` — Customers and Companies icons that open the side panel's view of the task's contacts in place, then Properties as an `extraTabs` entry; do not re-implement the side tabs.
- Keep custom properties as a local panel in the existing task/project right-side `SideMenu`, separate from cross-record relation widget registration; do not duplicate the form in the main detail body.
- The property side panel uses `SideMenu.Header` with a standard-size secondary Manage action to `/settings/properties/<contentType>` and a `p-4` scroll-content inset like neighboring right-rail widgets, while suppressing the shared form's redundant InfoCard shell; its scroll viewport wrapper must remain block-sized to the rail width so fields do not erase the right inset, and it fills the remaining rail height to center the empty state.
- Task and triage detail editors use generated `ITaskDetail` and `ITriageDetail` types; `useDescriptionEditor` accepts nullable API descriptions and loads Markdown before exposing the editor. Description change state uses the public `IBlockEditor['document']` type.
- Opening a Markdown description must not save or rewrite it until the user edits the description.
- Dev watch ignores must not include plugin source directories required for hot reload.
- `TaskDetails` carries neither padding nor side widgets. Every caller supplies both: `TaskDetailPage` and the My Inbox `NotificationTaskDetail` (the side panel draws its own `TaskPanelDetail` rows). Check both whenever `TaskDetails`' layout contract changes; the inbox caller is easy to miss because it only renders through the `./notificationWidget` remote.
- `TRIAGE_ACCEPTANCE` activities use the activity's `createdBy` for the accepting member and the task's `createdBy` for the original creator; do not nest another timeline row inside the acceptance action.
- My Inbox task and triage details (`NotificationTaskDetail`) keep the task page's dimensions: `p-6` content, `xl:max-w-3xl` centered, and the Open task action in a `max-w-3xl px-6 pt-6` row. Project and team inbox details keep their own `max-w-3xl px-6` layouts; the four stay visually aligned.
- Core-ui's inbox ScrollArea is the only scroll and its viewport content is `min-h-dvh` with no fixed height, so the task side column is `sticky top-0` with its height measured from the enclosing `[data-radix-scroll-area-viewport]`'s `clientHeight`. A `dvh` height leaves sticky no room to move; a nested ScrollArea adds a second, dead outer scroll. If core stops using that ScrollArea, the side column silently does not render while the detail still works.
- Task, triage, activity, project, milestone, team, cycle, activity, template, GitHub integration and progress documents use `gql()` from `~/gql` (codegen's `gqlTagName`); their hooks take and return generated types. `ITask`/`ITriage`/`IProject`/`IMilestone`/`ITeam`/`ITeamMember`/`ITeamStatus`/`IActiveCycle`/`IActivity`/`IOperationTemplate`/`IGithubConnection`/`IGithubConfig`/`IGithubRepository` are the list item types and `ITaskDetail`/`ITriageDetail`/`IProjectDetail`/`ICycle` the detail query types, all derived from `~/gql/graphql`. Progress types (`IProjectProgress*`, `IMilestoneProgress`, `ICycleProgress*`, `IGetCycleProgressChart`), `ICycleInput` aliases the generated `CycleInput`; `ITaskStatus` and `IEstimateChoice` derive from the generated query responses the same way. Do not reintroduce handwritten response interfaces for these documents.
- The member/team/project progress queries return non-null lists of non-null items (`[T!]!`), so their item types index the generated response directly. Only `milestoneProgress` is still `[MilestoneProgress]`, so `IMilestoneProgress` keeps the second `NonNullable` on the element and `ProjectMilestone` runs it through `compactList` before rendering.
- `Cycle.statistics` is typed `CycleStatistics` in the SDL; `endCycle` stores `progress`, `progressByMember`, `progressByProject`, and `chartData`, and the `Cycle.statistics` resolver fills missing totals with 0 for cycles ended before the totals were recorded.
- Entity lookup hooks (`useGetProject`, `useGetMilestone`, `useMilestones`, `useGetTeam`, `useGetCycle`, and the `useGet*Progress*` hooks) take the id as the first plain argument and skip the query internally when it is missing; pass a second `options` object only for other `QueryHookOptions`.
- Activity components take `IActivity['metadata']` (nullable); they destructure `metadata ?? {}` or pass `metadata?.field` into widened `*Inline` props (`string | null | undefined`). Template `defaults` is `unknown`; narrow it with `isRecord` before reading fields.
- Query hooks take nullable ids (`string | null | undefined`) and guard with `skip`; callers never fabricate empty-string ids. Generated field types are honestly nullable, so components accept `T | null` rather than callers writing `?? undefined`/`?? ''`/`?? 0` at call sites. Remaining coalescing is limited to shared-library boundaries (`SelectMember.Provider`, `ISearchProvider` items) and genuine defaults (array index, form schema sentinels, `totalCount` arithmetic).
- `@/operation/utils/cursorList` adapts generated list responses to the `erxes-ui` cursor helpers (`toCursorPageInfo`, `compactList`, `mergeCursorList`).
- Real-time updates use `useSubscription`, not `subscribeToMore` inside `useEffect`. Detail subscriptions (`operationTaskChanged`) use `ignoreResults: true` and rely on the normalized cache (`__typename` + `_id` identity via `addTypename`, core-ui `InMemoryCache`) to merge changed fields — subscription payloads must not replace whole query results. List subscriptions (`operationTaskListChanged`, `operationActivityChanged`) use `onData`: `delete`/`removed` evicts the entity (`cache.evict` + `cache.gc`) and decrements `totalCount`; `create`/`created` prepends or appends through `cache.updateQuery` guarded by an `_id` presence check; `update`/`updated` needs no manual work. Progress hooks subscribe to `operationTaskListChanged` with a `filter` variable (`projectId` or `cycleId`) and `refetch` on each event. `useGetProject`/`useGetProjects` still use `subscribeToMore` because they watch project documents that are not part of the task/triage/activity set.
- Task list subscriptions handle the `delete` event type that `operation_api` publishes.
- GraphQL documents are static strings with no `${...}` interpolation. Codegen drops interpolated text, so an interpolated selection would be sent at runtime but missing from the generated types.
- `src/gql/` is generated and gitignored; `build` and `serve` depend on the `codegen` target. `pnpm dev:uis` starts remotes without `dependsOn`, so `scripts/start-ui-dev.js` runs `codegen` once and then `codegen:watch` beside the dev server.
- `eslint.config.js` bans `graphql-tag`, the `gql` named import from `@apollo/client`, and type arguments on `useQuery`/`useMutation`/`useSubscription`/`useLazyQuery`/`useSuspenseQuery`/`subscribeToMore`. Documents must come from `gql()` in `~/gql` and hooks infer from them.
- `tsconfig.json` maps both `ui-modules` and `ui-modules/*`. Without the wildcard, every `ui-modules` self-import fails to resolve and its component props silently become `any` in this plugin.
- The task board keeps two Jotai atoms only: `fetchedTasksState` (the items dnd-kit needs at `Board.Provider`, each carrying its `task`) and `taskCountByBoardAtom` (per-column totals shared with the toolbar). Each column replaces its own slice of `fetchedTasksState` wholesale so deleted tasks leave, and counts are written whenever `totalCount` is a number so 0 lands. Reset both atoms in an unmount cleanup, never on mount.
- Documents declare non-null variables (`String!`, `CycleInput!`) for arguments the resolvers can't run without. Optional list-filter variables stay nullable.
- `operation/components/OperationChips.tsx` holds the plugin's labelled chips built from ui-modules providers (`SelectMember.Provider`, `TagsSelect.Provider`), as Sales' `DealDetailChips` does. Every labelled chip draws erxes-ui `Combobox.ChipTrigger`; never copy its markup into the plugin or add per-feature member/tag chips.
- `SelectTriggerOperation` draws erxes-ui `Combobox.ChipTrigger` only for the `detail` and `form` variants when a `label` is passed; every other variant and unlabelled caller (project table, triage and filter surfaces) keeps its plain trigger. Task selects' roots and `FormItem`s take `label` and pass it straight through.
- Project chips: `SelectStatus` (root and `FormItem`), `SelectLead.FormItem`/`.Detail` and `DateSelect.FormItem`/`.Detail` draw `Combobox.ChipTrigger` only when given a `label` and keep their plain trigger otherwise; `SelectProjectStatus`, `SelectProjectPriority` and `SelectProjectTeam` pass `label` through. Members and tags use `OperationMembersChip` and `OperationTagsChip` (`operation:project`, saved through `onValueChange`).
- `DateSelectTask` draws its labelled chip only for the `input` variant with a `label` (task detail passes `variant="input"`, as ticket detail does); `detail` and every other variant keep the plain trigger. The form chip is `DateSelectTask.FormItem` with a `label`.
- `DateSelectTask` keeps its own `dateValue` state seeded from the `value` prop and resyncs on `value`/`id` change; `useUpdateTask` already toasts on error, so the date select's `onError` only rolls back. `DateSelectContent` catches Enter in the capture phase because `DatePicker` stops its propagation.
- `Sheet.Header` is a fixed 40px row. A header with a visible second line (subtitle, record number, description) adds `h-auto py-2` so it sizes to its content; detail-page title rows are `h-10`, level with `PageHeader`.
- Task and project list filters render the filter popover trigger as the first child of `Filter.Bar`, so the filter icon stays fixed while selected filter chips appear after it; total counts stay last.

## Validation

- `pnpm nx lint operation_ui`
- `pnpm nx build operation_ui`
- `pnpm nx test operation_ui --passWithNoTests` (the inferred Jest target currently has no test files)
- `pnpm nx run operation_ui:codegen`
- Smoke scenario: create an issue in a connected GitHub repository and confirm the resulting triage shows a linked source issue above its name and short GitHub attribution in the timeline and relation card; create a triage manually and confirm its member attribution remains visible.
- `pnpm exec tsc --noEmit -p frontend/plugins/operation_ui/tsconfig.app.json`
- Smoke scenario: open operation projects, tasks, team, operation settings, relation widgets, and automation widget entry through the remote.
- Inbox smoke: open a task, triage, project and team notification in My Inbox; the task detail is padded, shows side widgets, and its icon column stays put while scrolling.
- Triage smoke: when a second member accepts a triage, the task timeline shows the original creator and a separate acceptance row with the second member's photo, name, and acceptance time.
- Smoke scenario: open a GitHub issue triage with headings, bold text, and a fenced code block; accept it as a task and confirm the same formatting and editable content.
- Chip smoke: open a task detail and the add-task sheet; every field chip shows its label, a set date shows an X that clears it, typing a date and pressing Enter saves and closes the popover, and `Tags | Tag +N` adds and removes tags. In the add-project sheet and the project detail every chip shows its label; the created project keeps the picked lead, members, dates and tags, and detail edits (including clearing a date) persist after reload. Linking a customer in the project detail lists the project in that customer's side panel Projects section.
- Activity smoke: when Alice assigns a task to Bob, the row shows Alice's avatar and name with Bob in the assignment detail; status, priority, date, and note changes retain their action icons.
