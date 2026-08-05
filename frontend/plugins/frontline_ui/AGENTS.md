# `frontline_ui` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/frontline_ui`
- **Last synchronized:** `2026-08-05`

## Scope

### Owns

- The `frontline` navigation group and settings navigation registered through
  `src/config.tsx`.
- Inbox UI: conversation list, conversation detail, channels, response
  templates, and integration configuration screens.
- Ticket UI: pipelines, statuses, ticket boards and detail, plus the legacy
  ticket surface.
- Forms UI: form builder, preview, and submissions.
- Knowledge base UI: topics, categories, and articles.
- Call UI: call index, detail, and statistics pages.
- Automation remote entries for facebook, instagram, inbox, discord,
  knowledgebase, and ticket — trigger forms, action forms, node configuration
  content, bot management, and execution history renderers.
- Notification, relation, activity, and floating widgets exposed to the host.

### Does not own

- Backend schema, resolvers, or Facebook Send API behavior — see `frontline_api`.
- The automation builder canvas, sidebar, and node plumbing — owned by `core-ui`
  and consumed through `ui-modules` remote-entry prop types.
- UI primitives — always composed from `erxes-ui` and `ui-modules`.
- The `frontline` i18n namespace JSON, which lives in
  `backend/gateway/src/locales/{en,mn}/frontline.json` (gateway-owned).

## Current Capabilities

- Runs as a Module Federation remote on port `3004`, bundled with Rspack.
- Registers navigation, settings navigation, relation widgets, property inputs,
  and activity rows with the host via `CONFIG` in `src/config.tsx`.
- Renders plugin-specific automation trigger/action forms selected by node type
  in each module's `*RemoteEntry.tsx`.
- Pipeline management is one nested route: `PipelineLayoutPage` resolves the
  pipeline, renders the `PipelineSidebar` rail, and owns the scroll container
  and content width for the General, Ticket statuses, Configuration, and
  Permissions surfaces nested under it.
- The General surface previews the identifier the next ticket in the pipeline
  would take, recomputed live from the number configuration and fractional part.
- Facebook bot message action supports a drag-orderable message sequence of
  text, card, quick replies, input, image, attachments, audio, and video, with
  postback/link buttons and optional connects.
- Caps the Facebook message sequence at one message when the action is attached
  to a comment trigger, and explains why in the sequence header.
- Composes Facebook page posts from the integrations sidebar: channel and page
  selection, message, optional link, drag-and-drop image upload (max 10), and a
  permalink to the published post.

## Architecture

| Area               | Path                                                                                                                                          | Responsibility                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Host registration  | `src/config.tsx`                                                                                                                              | `CONFIG` — navigation, settings, widgets, property inputs                     |
| Federation         | `module-federation.config.ts`                                                                                                                 | Remote name `frontline_ui` and its exposes                                    |
| Routes             | `src/modules/FrontlineMain.tsx`, `src/pages/`                                                                                                 | Routed pages for inbox, ticket, forms, call, channels                         |
| Settings           | `src/modules/FrontlineSettings.tsx`                                                                                                           | Settings routes                                                               |
| Inbox              | `src/modules/inbox/`                                                                                                                          | Conversations, channels, brands, integrations                                 |
| Ticket             | `src/modules/ticket/`, `src/modules/pipelines/`, `src/modules/status/`                                                                        | Ticket boards, pipelines, statuses                                            |
| Pipeline route     | `src/pages/PipelineLayoutPage.tsx`, `src/modules/pipelines/components/PipelineSidebar.tsx`, `src/modules/pipelines/constants/pipelineTabs.ts` | Pipeline layout shell, sidebar rail, and the surface list both are built from |
| Forms              | `src/modules/forms/`                                                                                                                          | Form builder, preview, submissions                                            |
| Knowledge base     | `src/modules/knowledgebase/`                                                                                                                  | Topics, categories, articles                                                  |
| Automation widgets | `src/widgets/automations/modules/<module>/`                                                                                                   | Per-module trigger/action/bot/history components                              |
| FB message action  | `src/widgets/automations/modules/facebook/components/action/`                                                                                 | Message sequence form, provider, constants, states                            |
| FB post composer   | `src/modules/integrations/facebook/components/FacebookPostSheet.tsx`, `FacebookPostImagesField.tsx`, `hooks/useFacebookPost*.tsx`             | Post sheet, image upload state, channel/page loading                          |
| Notifications      | `src/widgets/notifications/`                                                                                                                  | Notification remote entries                                                   |

## Contracts

### Provides

- Module Federation exposes: `./config`, `./frontline`, `./frontlineSettings`,
  `./knowledgebase`, `./automationsWidget`, `./notificationWidget`,
  `./relationWidget`, `./floatingWidget`, `./selectErxesMessenger`.
- `CONFIG` with `name: 'frontline'`, `path: 'frontline'`, default navigation
  path `frontline/inbox`, relation widgets (`conversation`, `ticket`), the
  `ticketStatus` property input, and the `formSubmission` activity row.
- Automation remote-entry components keyed by `componentType`: `actionForm`,
  `triggerForm`, `triggerConfigContent`, `actionNodeConfiguration`,
  `automationBotsContent`, `historyName`, `historyActionResult`.

### Consumes

- `erxes-ui` — all UI primitives (`Button`, `Badge`, `Label`, `Card`, `toast`, …).
- `ui-modules` — `AutomationRemoteEntryWrapper`, `AutomationRemoteEntryTypes`,
  `AutomationActionFormProps` (which carries `trigger` and `targetType`),
  `splitAutomationNodeType`, `generateAutomationElementId`,
  `useAutomationRemoteFormSubmit`, `useFormValidationErrorHandler`.
- The `frontline` GraphQL subgraph through Apollo Client.
- `react-i18next` with the `frontline` namespace.

## Data and State

- Server state through Apollo Client; GraphQL documents live next to the feature
  they serve and use `frontline`/module-prefixed operation names.
- Automation action forms use React Hook Form with Zod resolvers; the Facebook
  message action schema is in
  `src/widgets/automations/modules/facebook/components/action/states/replyMessageActionForm.tsx`.
- `ReplyMessageProvider` is the single source of message-sequence state for the
  Facebook message action (`messages`, `maxMessages`, `addMessage`, form
  helpers); components read it through `useReplyMessageAction` rather than
  prop drilling.
- `useFacebookPostImages` owns the post composer's attachments (upload state,
  storage keys) and `useFacebookPostTargets` owns its channel and page
  selection; both live inside the sheet body, so closing the sheet unmounts the
  draft — the same reset-on-close behavior as `CreateBrand`.
- Jotai is reserved for plugin-wide client state; component-local state stays in
  `useState`.

## Local Invariants

- `react-hook-form` is not in `coreLibraries` in `module-federation.config.ts`,
  so this remote bundles its own copy and its React context is a different
  object from the one `erxes-ui`'s `Form` (`FormProvider`) renders. Never rely
  on `useFormContext()` here — it returns `null` and the next `.control` read
  throws. Always hand `control` or the whole `form` down as a prop, the way
  `Form.Field` already requires.

- `PIPELINE_TABS` in `src/modules/pipelines/constants/pipelineTabs.ts` is the
  single source for the pipeline surfaces. Adding one means adding an entry
  there plus a nested `<Route>` in `ChannelsSettings`; never hard-code a
  pipeline sub-path anywhere else, and build links with `getPipelinePath`.
- A channel settings list page owns no header of its own. Its primary create
  action is rendered by `ChannelSettingsBreadcrumb`, right-aligned with
  `ml-auto` and gated on the route, the way channels, forms, and response
  templates already do it. Never add a `PageSubHeader` whose only content
  repeats the last breadcrumb crumb.
- `createPipelineSheetState` owns whether the create-pipeline sheet is open.
  Only `CreatePipeline` may render that sheet and register its `c`/`esc`
  hotkeys; any other surface opens it by setting the atom. Mounting a second
  `CreatePipeline` would register the same hotkey twice.
- The `form`, `pipeline`, and `response` plural values already carry
  `{{count}}`, so a call site passes `count` and renders the result as-is —
  never prepend the number itself.
- Pipeline surfaces render content only. The layout owns the scroll container,
  content width, pipeline loading, and the not-found state, so a surface must
  not add its own `ScrollArea` or page padding.
- Pipeline surfaces are flat. Group settings with `PipelineSection` inside a
  `divide-y` parent — no `InfoCard`, `Card`, `RecordTable`, or nested bordered
  boxes, and no raw `<label>`/`<h2>` section headings. Inside a section use
  `Form.*` primitives, `Empty` for nothing-yet, and `Skeleton`/`Spinner` for
  loading. Ticket statuses is the one exception: its stages are a lifecycle, so
  they render as one spine of `StatusGroup` nodes instead of sections. A stage
  heading still uses the `font-mono text-xs uppercase text-accent-foreground`
  treatment `PipelineSection` titles use, so the four surfaces stay one system.
  A status row on that spine carries a hairline border of its own — it is the
  only bordered row on the pipeline surfaces, because it is also a drag handle
  and needs a visible edge to grab.
- The Permissions surface saves on change with no save button and no progress
  indicator: a successful save is silent, and a failed one toasts and resets the
  form to the last saved values so the effect cannot retry it forever.
- On a status row the grip is the only drag handle and the row itself opens the
  edit sheet. Never make the whole row a drag surface again — it swallows the
  click — and keep the grip's `onClick` stopping propagation so grabbing it does
  not also open the sheet.
- `useUpdateTicketStatus` refetches the whole list after every write, so a
  reorder produces one refetch per moved status and they land out of order.
  `StatusGroup` holds its own copy of the list and ignores incoming server data
  while `isReordering` is set; any future reorder must keep that guard or the
  rows jump while the writes are in flight.
- A ticket status is written in `StatusSheet`, never in the list. Both add and
  edit open the same sheet, driven by `addingStatusState` (the stage type) and
  `editingStatusState` (the status id); the stage that owns the edited status is
  the one that renders the sheet, so only one is ever open.
- A setting that is a two-way choice uses a `ToggleGroup` segmented control, not
  a `Select`; a setting that is on or off uses a `Switch` row whose label states
  what turning it on does. Never pair a short title with a description that
  restates it.
- `buildTicketNumberPreview` mirrors `generateTicketNumber` in `frontline_api`
  (no fractional part means no ticket number at all). Keep the two in sync if
  the backend numbering rules change.
- A Facebook message action attached to a comment trigger may hold exactly one
  message. The limit is derived in `getMaxMessagesForTrigger` and enforced in
  both `ReplyMessageProvider.addMessage` and the `MessageSequenceHeader` add
  buttons — keep the two in sync.
- The trigger type reaches the action form through the `trigger` prop already
  present on `AutomationActionFormProps`; do not add a shared-library field to
  obtain it.
- Remote entries must switch on the node type via `splitAutomationNodeType` and
  return `null` for unknown content types.
- A post carries images or a link preview, never both; only files whose storage
  key matches the readable-key pattern may be attached, because any other key
  cannot be read back for publishing.
- File pickers use the shared `Dropzone`/`DropzoneEmptyState`/`DropzoneContent`
  composition with `useErxesUpload`; uploaded files render through
  `Attachments.Root` and its `Preview`/`Files` parts. Do not hand-roll a drop
  area or an attachment tile.
- The message input ignores drops while a dialog is open, so a composer dialog
  keeps its own dropzone (`isDialogOpen` in `MessageInput.tsx`).
- Exposed modules stay lazy-loaded and wrapped in `Suspense`.
- Routed pages use `h-full`, never `h-dvh`/`h-screen`.
- New user-facing strings need a key in the gateway-owned `frontline` locale
  files; that is a repository-level change and must be requested explicitly.

## Validation

- `pnpm nx lint frontline_ui`
- `pnpm nx build frontline_ui`
- No `test` target is defined in `project.json`; do not invent one.
- Smoke: open a channel's pipeline under
  `/settings/frontline/channels/:id/pipelines/:pipelineId`, move through all
  four sidebar items and confirm the rail stays put and each URL still
  deep-links; type a fractional part on General and confirm the preview updates.
- Smoke: in the automation builder attach a Facebook message action to a
  `frontline:facebook.comments` trigger and confirm the sequence header shows
  the single-message notice and every "Add …" button is disabled once one
  message exists; attach the same action to a `frontline:facebook.messages`
  trigger and confirm five messages are still allowed.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-05` — Shared primitives and import paths

- **Summary:** The drag handles and the clickable status and configuration rows
  are `Button`/`DragHandle` from `erxes-ui` instead of raw `<button>` elements,
  `PipelineSidebar` gets its active tab from `NavLink`, the ticket number
  preview formats its date tokens with `date-fns`, and every import this plugin
  adds now resolves through a package root or a `@/` alias.
- **Affected areas:** `src/modules/status/components/StatusGroup.tsx`,
  `src/modules/pipelines/components/{PipelineSidebar,PipelineConfig,PipelineDetail}.tsx`,
  `src/modules/pipelines/components/configs/components/{ConfigList,TicketBasicFields}.tsx`,
  `src/modules/pipelines/components/permissions/components/PipelinePermissionsList.tsx`,
  `src/modules/pipelines/utils/ticketNumberPreview.ts`,
  `src/pages/TicketIndexPage.tsx`
- **Contracts changed:** `None` in this plugin. `DragHandle` was added to
  `erxes-ui` as a shared component at the maintainer's request.

### `2026-08-05` — IconPicker value type compatibility in channel forms

- **Summary:** Passed `field.value ?? undefined` to `IconPicker` in channel forms to satisfy `value?: string` when `icon` schema is nullable (`string | null | undefined`).
- **Affected areas:** `src/modules/channels/components/settings/channel-details/UpdateChannelForm.tsx`, `src/modules/channels/components/settings/channels-list/ChannelForm.tsx`
- **Contracts changed:** `None`

### `2026-08-05` — Status rows: steady reorder and click to edit

- **Summary:** Dragging a status no longer jumps while its writes are in flight,
  the grip became the only drag handle so clicking a row opens the edit sheet,
  and a status description now sits clear of its name.
- **Affected areas:** `src/modules/status/components/StatusGroup.tsx`,
  `backend/gateway/src/locales/{en,mn}/frontline.json` (`reorder`)
- **Contracts changed:** `None`

### `2026-08-05` — Working-area cleanup

- **Summary:** The create-pipeline sheet moved behind `createPipelineSheetState`
  so the header trigger and the empty state drive one sheet and one hotkey
  registration; the unused `PipelineHotkeyScope.PipelineDetail` was dropped; the
  `form`/`pipeline`/`response` plural values now carry `{{count}}` so the
  channel detail rows finally show a number; and ten locale keys orphaned by the
  pipeline redesign plus a duplicate `total-tickets` entry were removed.
- **Affected areas:** `src/modules/pipelines/states/pipelineStates.ts`,
  `src/modules/pipelines/components/CreatePipeline.tsx`,
  `src/modules/pipelines/components/PipelinesList.tsx`,
  `src/modules/pipelines/types/PipelineHotkeyScope.ts`,
  `src/modules/channels/components/settings/ChannelSettingsPageEffect.tsx`,
  `backend/gateway/src/locales/{en,mn}/frontline.json`
- **Contracts changed:** `PipelineHotkeyScope.PipelineDetail` removed (it had no
  hotkey bound to it).

### `2026-08-05` — Pipelines list lost its sub-header

- **Summary:** The pipelines list no longer renders a `PageSubHeader` that only
  repeated the breadcrumb's own "Pipelines" crumb; `Create pipeline` moved into
  `ChannelSettingsBreadcrumb` alongside the create actions for channels, forms,
  and response templates, and is hidden on the pipeline detail tabs.
- **Affected areas:** `src/pages/PipelinesPage.tsx`,
  `src/modules/channels/components/settings/breadcrumbs/ChannelSettingsBreadcrumb.tsx`
- **Contracts changed:** `None`

### `2026-08-05` — General and Configuration surfaces

- **Summary:** General is now grouped into `Pipeline`, `Number`, and `Name`
  sections whose titles replace the field labels, with the attribute picker as
  an icon button that finally translates its token names; Configuration lists
  the fields a ticket form shows instead of when the config was last touched,
  and the config sheet edits every field in one draggable switch list with its
  wording inline, replacing the previous show-then-edit pair of lists and their
  `Card` boxes.
  Every string these surfaces render is now translated: 13 keys were added to
  the gateway-owned `frontline` namespace (both `en` and `mn`) and the last
  hard-coded English labels — the status member permissions, the ticket form
  field names, the config delete confirmation — now go through `t()`.
- **Affected areas:**
  `src/modules/pipelines/components/{PipelineDetail,PipelineConfig,CreatePipelineForm,Attribution}.tsx`,
  `src/modules/pipelines/components/configs/{constant.ts,components/{ConfigList,ConfigsForm,TicketBasicFields}.tsx}`,
  `src/modules/pipelines/components/permissions/components/StatusPermissionControl.tsx`,
  `src/modules/status/components/StatusSheet.tsx`,
  `src/modules/ticket/components/ticket-selects/SelectStatusTicket.tsx`,
  and `backend/gateway/src/locales/{en,mn}/frontline.json` (gateway-owned,
  changed with explicit approval)
- **Contracts changed:** `None`. `SelectStatusTicket.FormItem` became generic
  over the caller's form so it no longer needs an `any` cast; the `label` in
  `TICKET_FORM_FIELDS` is now a translation key rather than display text.

### `2026-08-05` — Ticket statuses spine and one-line permission rules

- **Summary:** Ticket statuses now render as a single lifecycle spine — one node
  and hairline per stage, a persistent outlined add button per stage, empty
  stages collapsed to one row, and adding or editing a status moved from an
  inline row form into `StatusSheet` — while Permissions leads with pipeline
  access, states each visibility rule as one switch row, attaches the exemption
  picker to the rule it belongs to, and swaps the public/private dropdowns for
  segmented controls.
- **Affected areas:**
  `src/modules/status/components/{Statuses,StatusGroup,StatusSheet}.tsx`,
  `src/modules/pipelines/components/permissions/constant.ts`,
  `src/modules/pipelines/components/permissions/components/{PermissionRule,PipelineVisibility,StatusPermissionControl,PipelinePermissionsList}.tsx`
- **Contracts changed:** `None` (`PermissionCheckbox` was renamed to
  `PermissionRule`; it is plugin-internal.)

### `2026-08-05` — Flattened the pipeline surfaces onto `PipelineSection`

- **Summary:** Ticket statuses became one section per status type with an inline
  add row, Configuration dropped a `RecordTable` built for many rows in favor of
  a single-config row, Permissions became three sections that save on change,
  every card/tray/bordered box was replaced by hairline-separated sections, and
  the unused contact-type selector and `allowAllUsers` field were removed.
- **Affected areas:** `src/modules/status/components/{Statuses,StatusGroup}.tsx`,
  `src/modules/pipelines/components/configs/components/{ConfigList,ConfigsForm,CreateConfig,ConfigDetails,TicketBasicFields}.tsx`,
  `src/modules/pipelines/components/permissions/components/{PipelinePermissionsList,PermissionCheckbox,StatusPermissionControl,PipelineVisibility}.tsx`,
  `src/modules/pipelines/components/{PipelineSection,Attribution,CreatePipeline,PipelineDetail}.tsx`,
  `src/modules/pipelines/types/index.ts`,
  `src/modules/settings/schema/pipeline.ts`,
  deleted `src/modules/pipelines/components/configs/components/contact-type/`
- **Contracts changed:** `None`

### `2026-08-05` — Pipeline management became one nested route with a sidebar

- **Summary:** General, Ticket statuses, Configuration, and Permissions are now
  reached from a sidebar rail on a shared pipeline layout instead of four pages
  reached through link buttons, and the General surface previews the identifier
  the next ticket would take.
- **Affected areas:** `src/pages/PipelineLayoutPage.tsx`,
  `src/pages/PipelineConfigsPage.tsx` (renamed from `PipielineConfigListPage`),
  `src/pages/{PipelineDetailPage,TicketStatusesPage,PipelinePermissionsPage}.tsx`,
  `src/modules/pipelines/components/{PipelineSidebar,TicketNumberPreview,PipelineConfig,PipelineDetail}.tsx`,
  `src/modules/pipelines/constants/pipelineTabs.ts`,
  `src/modules/pipelines/utils/ticketNumberPreview.ts`,
  `src/modules/channels/components/settings/{Settings,ChannelSettingsPageEffect}.tsx`,
  `src/modules/channels/components/settings/breadcrumbs/ChannelSettingsBreadcrumb.tsx`,
  `src/modules/types/FrontlinePaths.ts`
- **Contracts changed:** `None` — the four pipeline URLs are unchanged.

### `2026-08-04` — Rebuild the post composer on the standard sheet and dropzone

- **Summary:** The composer now follows the `CreateBrand` sheet shape
  (uncontrolled `Sheet`, `Sheet.Close` cancel, state inside the sheet body) and
  uses the shared `Dropzone`/`DropzoneEmptyState`/`DropzoneContent` for picking
  files and `Attachments.Root`/`Attachments.Preview` for the uploaded ones,
  instead of a hand-rolled drop area, thumbnail grid, and filename list; help
  and rejected filenames render as `Alert`, the empty and loading states use
  `Empty` and `Spinner`, and the channel picker is a searchable
  `Popover` + `Combobox` + `Command` like `SelectChannel.FormItem`.
- **Affected areas:**
  `src/modules/integrations/facebook/components/FacebookPostSheet.tsx`,
  `.../components/FacebookPostImagesField.tsx`,
  `.../hooks/useFacebookPostImages.tsx`,
  `src/modules/integrations/components/ChooseIntegrationType.tsx`,
  `backend/gateway/src/locales/{en,mn}/frontline.json` (gateway-owned)
- **Contracts changed:** `None`
