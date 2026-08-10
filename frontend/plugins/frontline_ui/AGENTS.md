# `frontline_ui` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/frontline_ui`
- **Last synchronized:** `2026-08-10`

## Scope

### Owns

- The `frontline` navigation group and settings navigation registered through
  `src/config.tsx`.
- Inbox surfaces: conversation list, conversation detail, message input, the
  inbox navigation sub-groups, response templates, and integration
  configuration screens.
- Channel settings (list, detail, members, integrations) and channel forms.
- Integration connect/detail UIs for IMAP, Facebook, Instagram, Discord, calls,
  and the erxes messenger.
- Ticket UI: pipelines, statuses, ticket boards and detail, plus the legacy
  ticket surface.
- Forms UI: form builder, preview, and submissions.
- Knowledge base UI: topics, categories, and articles.
- Call UI: call index, detail, and statistics pages.
- Report screens for the frontline plugin.
- Automation remote entries under `src/widgets` for facebook, instagram, inbox,
  discord, knowledgebase, and ticket — trigger forms, action forms, node
  configuration content, bot management, and execution history renderers.
- Notification, relation, activity, and floating widgets exposed to the host.

### Does not own

- Any server contract. GraphQL schema, resolvers, and Facebook Send API
  behavior live in `frontline_api`.
- The automation builder canvas, sidebar, and node plumbing — owned by `core-ui`
  and consumed through `ui-modules` remote-entry prop types.
- Shared primitives — consume `erxes-ui` and `ui-modules`; never fork them or
  import Radix directly.
- The `frontline` i18n namespace JSON, which lives in
  `backend/gateway/src/locales/{en,mn}/frontline.json` (gateway-owned).
- Other plugins' modules or state.

## Current Capabilities

- Runs as a Module Federation remote on port `3004`, bundled with Rspack.
- The messenger ticket form builder lives on a pipeline's configuration sheet
  (`src/modules/pipelines/components/configs/`): a configuration picks a status
  and a tag group, toggles the four built-in ticket fields, and now also selects
  ticket custom properties out of the `frontline:ticket` field groups. Both
  lists are drag-reorderable and each entry carries its own label and
  placeholder; property entries add a required toggle.
- A messenger integration attaches **several** ticket configs. The erxes
  messenger config form binds `ticketConfigIds` to `SelectTicketConfig.FormItem`,
  a multi-select over the selected channel's `ticketConfigs`.
- Registers navigation, settings navigation, relation widgets, property inputs,
  and activity rows with the host via `CONFIG` in `src/config.tsx`.
- Inbox navigation splits into **Me** — the integration types in use by the
  caller's personal channel, listed flat — and **Team inbox**, where every team
  channel is a collapsible row over the integration types in use inside it.
  Discord servers and Brands groups follow.
- `Team inbox` channel rows carry the caller's unread count from
  `Channel.unreadConversationCount` and dim when it is zero; integration-type
  rows in both groups carry their open-conversation count from
  `conversationCounts` and show a warning dot when some are still awaiting a
  reply. The `Me` header carries the group total as "N unread".
- Those unread badges stay live: `useChannelUnreadUpdates` subscribes to
  `conversationClientMessageInserted` for the current user and refetches
  `GetMyChannels`, debounced by a second. Marking a conversation read refetches
  the same query so the badge falls again.
- `Team inbox` lists channels in the name order `getMyChannels` returns; there
  is no sort control. Channels with nothing unread (and that are not the
  selected channel) collapse behind a single "N quiet teams" row, unless every
  channel is quiet.
- Each team channel row shows an avatar stack of its members, rendered from one
  batched `GetChannelMembers` query for the whole group.
- Selecting a nested integration type filters the conversation list by both
  `channelId` and `integrationType`; selecting a channel row filters by
  `channelId` and clears `integrationType`.
- Channel creation from either the settings page or the Team inbox group; the
  form sends no `scope`, so the API creates a `team` channel.
- A `Personal channel` settings route (`/settings/frontline/personal-channel`)
  acting as the profile for the user's private inbox: name, icon, description,
  and its integrations — the same catalogue a team channel offers. Opening it is
  what provisions the channel — there is no create button anywhere for personal
  channels.
- Channel member management, integration attachment, and per-channel forms,
  pipelines, and response templates.
- Renders plugin-specific automation trigger/action forms selected by node type
  in each module's `*RemoteEntry.tsx`.
- Facebook bot message action supports a drag-orderable message sequence of
  text, card, quick replies, input, image, attachments, audio, and video, with
  postback/link buttons and optional connects.
- Caps the Facebook message sequence at one message when the action is attached
  to a comment trigger, and explains why in the sequence header.
- Composes Facebook page posts from the integrations sidebar: channel and page
  selection, message, optional link, drag-and-drop image upload (max 10), and a
  permalink to the published post.

## Architecture

| Area               | Path                                                                                                                              | Responsibility                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Host registration  | `src/config.tsx`                                                                                                                  | `CONFIG` — navigation, settings, widgets, property inputs, routes, and Module Federation exposes |
| Federation         | `module-federation.config.ts`                                                                                                     | Remote name `frontline_ui` and its exposes                                                     |
| Routes             | `src/modules/FrontlineMain.tsx`, `src/pages/`                                                                                     | Routed pages for inbox, ticket, forms, call, channels                                          |
| Navigation groups  | `src/modules/FrontlineSubGroups.tsx`                                                                                              | Route-aware sidebar sub-groups for every frontline page                                        |
| Settings routes    | `src/modules/FrontlineSettings.tsx`                                                                                               | Top-level frontline settings routes and their page chrome                                      |
| Channel picker     | `src/modules/inbox/channel/components/ChooseChannel.tsx`                                                                          | Scope-filtered channel list bound to the `channelId` query param                               |
| Inbox nav trees    | `src/modules/inbox/channel/components/{PersonalInboxNav,TeamChannelsNav}.tsx`                                                     | The `Me` group and the `Team inbox` group, each rendering its own `NavigationMenuGroup` header  |
| Nav header count   | `src/modules/inbox/channel/components/UnreadSummary.tsx`                                                                          | The "N unread" figure in a group header's actions slot                                         |
| Nav group actions  | `src/modules/NavigationGroupActions.tsx`                                                                                          | Click guard for a `NavigationMenuGroup` `actions` slot                                         |
| Sidebar counts     | `src/modules/inbox/conversations/hooks/useConversationCounts.tsx`                                                                 | `conversationCounts` reads per integration type inside one channel                             |
| Live unread        | `src/modules/inbox/channel/hooks/useChannelUnreadUpdates.tsx`                                                                     | Subscribes to incoming customer messages and refreshes channel unread counts                   |
| Channel settings   | `src/modules/channels`                                                                                                            | Channel CRUD, members, GraphQL documents, form schemas                                         |
| Personal channel   | `src/modules/channels/components/settings/personal-channel`, `src/pages/PersonalChannelPage.tsx`                                  | Profile page for the user's private inbox                                                      |
| Inbox              | `src/modules/inbox/`                                                                                                              | Conversations, messages, filters, channels, brands, integrations                               |
| Integrations       | `src/modules/integrations/`                                                                                                       | Per-provider connect forms and detail views                                                    |
| Ticket             | `src/modules/ticket/`, `src/modules/pipelines/`, `src/modules/status/`                                                            | Ticket boards, pipelines, statuses                                                             |
| Forms              | `src/modules/forms/`                                                                                                              | Form builder, preview, submissions                                                             |
| Knowledge base     | `src/modules/knowledgebase/`                                                                                                      | Topics, categories, articles                                                                   |
| Automation widgets | `src/widgets/automations/modules/<module>/`                                                                                       | Per-module trigger/action/bot/history components                                               |
| FB message action  | `src/widgets/automations/modules/facebook/components/action/`                                                                     | Message sequence form, provider, constants, states                                             |
| FB post composer   | `src/modules/integrations/facebook/components/FacebookPostSheet.tsx`, `FacebookPostImagesField.tsx`, `hooks/useFacebookPost*.tsx` | Post sheet, image upload state, channel/page loading                                           |
| Call report tables | `src/modules/report/call/components/{ReportTable,Meter}.tsx`                                                                      | Shared density wrapper over `erxes-ui` `Table`, plus the proportional bar used inside its cells |
| Notifications      | `src/widgets/notifications/`                                                                                                      | Notification remote entries                                                                    |

## Contracts

### Provides

- Module Federation exposes declared in `module-federation.config.ts` /
  `src/config.tsx`: `./config`, `./frontline`, `./frontlineSettings`,
  `./knowledgebase`, `./automationsWidget`, `./notificationWidget`,
  `./relationWidget`, `./floatingWidget`, `./selectErxesMessenger`.
- `CONFIG` with `name: 'frontline'`, `path: 'frontline'`, default navigation
  path `frontline/inbox`, relation widgets (`conversation`, `ticket`), the
  `ticketStatus` property input, and the `formSubmission` activity row.
- Automation remote-entry components keyed by `componentType`: `actionForm`,
  `triggerForm`, `triggerConfigContent`, `actionNodeConfiguration`,
  `automationBotsContent`, `historyName`, `historyActionResult`.
- `ChooseChannel({ scope?, emptyMessage? })` — omitting `scope` lists every
  channel the user belongs to.
- `ChooseIntegrationTypeContent({ allowedIntegrationTypes? })` from
  `src/modules/integrations/components/ChooseIntegrationType.tsx` — the sidebar
  integration-type list, filtered by type `name` when the prop is passed. A
  second, unrelated `ChooseIntegrationTypeContent` in
  `src/modules/integrations/components/IntegrationTypeFilter.tsx` backs the
  `Combobox` filter; import each from its own file.
- `IntegrationTypeItem({ _id, name, channelId?, nested?, count?, awaitingCount? })`
  — one sidebar type row. With `channelId` it toggles `channelId` +
  `integrationType` together; without it, only `integrationType`. `nested`
  indents it under a channel. `count` renders the trailing figure and dims the
  row when zero; `awaitingCount` renders the warning dot. Its icon comes from
  `INTEGRATION_ICONS` keyed by kind, falling back to `IconInbox`.
- `channelScopeOf(channel)` from `src/modules/channels/utils/channelScope.ts` —
  the single place that resolves a missing `scope` to `team`.

### Consumes

- `frontline_api` GraphQL: `GetMyChannels`, `GetChannels`, `GetChannel`,
  `GetPersonalChannel` (get-or-create — reading it provisions the channel),
  `GetChannelMembers`, `ChannelAdd` (accepts an optional `scope` variable this
  UI does not send), `ChannelUpdate`, `IntegrationsCreateExternalIntegration`,
  `IntegrationsGetUsedTypes`, `IntegrationsGetUsedTypesByChannel(channelId?,
  scope?)` — the latter is already restricted server-side to channels the caller
  can see, so the UI never has to filter its result.
- `frontline_api` GraphQL subscription `conversationClientMessageInserted(userId)`
  — published to every member of the channel a customer message landed in, for
  every integration kind, so one subscription covers all of a user's channels.
- `frontline_api` GraphQL `conversationCounts(only, channelId?, brandId?,
  awaitingResponse?)` — a JSON map. `only: "byChannels"` keys by channel id,
  `only: "byIntegrationTypes"` keys by integration kind, `only: "byIntegrations"`
  keys by integration id (Discord). Counts are open + new conversations; passing
  `awaitingResponse: "true"` narrows them to the ones the customer spoke last in.
- `erxes-ui`: all UI primitives — `NavigationMenuGroup`, `Sheet`, `Form`,
  `Dialog`, `Button`, `Badge`, `Label`, `Card`, `toast`, `useQueryState`,
  `useToast`, hotkey hooks.
- `ui-modules`: `SelectBrand`, `MembersInline`, contacts and structure selects,
  `AutomationRemoteEntryWrapper`, `AutomationRemoteEntryTypes`,
  `AutomationActionFormProps` (which carries `trigger` and `targetType`),
  `splitAutomationNodeType`, `generateAutomationElementId`,
  `useAutomationRemoteFormSubmit`, `useFormValidationErrorHandler`.
- `frontline_api` GraphQL `TicketConfigs`, `TicketConfigDetail`, `TicketConfig`,
  `TicketSaveConfig` — the messenger ticket form configuration, including
  `propertyFields` (chosen ticket custom properties, each carrying the source
  property's `type` and `options` so the messenger widget can render it).
- `ui-modules` properties hooks `useFieldGroups` / `useFields` with
  `contentType: 'frontline:ticket'` — the ticket property groups and their
  fields, read straight from core; this UI never defines property metadata.
- `react-i18next` with the `frontline` namespace.

## Data and State

- Apollo Client for all server state; GraphQL documents live next to the feature
  they serve and use `frontline`/module-prefixed operation names.
- `GET_MY_CHANNELS` backs the inbox navigation and is refetched after
  `ChannelAdd`. `useGetMyChannels` pins `sortField: 'name', sortDirection: 1`
  for every caller, so the list arrives ordered and all consumers share one
  cache entry — do not vary those variables per component or the query fans out
  into several network requests on the inbox page.
- `IChannel.scope` is optional — channels created before the field existed
  return no value and must be treated as `team`.
- `GET_MY_CHANNELS` selects `unreadConversationCount` but not
  `conversationCount`; each count costs the API a query per channel, so add one
  to the selection only when a surface actually renders it.
- Jotai atoms for plugin-wide UI state (`channelCreateSheetOpenState`,
  `imapFormSheetAtom`, hotkey scopes); `useQueryState` for URL-backed filters
  such as `channelId`; component-local state stays in `useState`. `Team inbox`
  has no sort control and holds no sort state — the order is whatever
  `getMyChannels` returns.
- `PIPELINE_CONFIG_SCHEMA.propertyFields` is a `useFieldArray` list whose array
  position is the display order — the API renumbers `order` from that position
  on save, so reordering means `move`, never rewriting `order` values. Each
  entry also carries the source property's `type` and `options`, taken from
  `useFields` when the property is toggled on; the API overwrites both from the
  current core definition on save, so never edit them in this UI.
- React Hook Form + Zod for every form (`CHANNEL_SCHEMA`, `imapFormSchema`); the
  Facebook message action schema is in
  `src/widgets/automations/modules/facebook/components/action/states/replyMessageActionForm.tsx`.
- `ReplyMessageProvider` is the single source of message-sequence state for the
  Facebook message action (`messages`, `maxMessages`, `addMessage`, form
  helpers); components read it through `useReplyMessageAction` rather than
  prop drilling.
- `useFacebookPostImages` owns the post composer's attachments (upload state,
  storage keys) and `useFacebookPostTargets` owns its channel and page
  selection; both live inside the sheet body, so closing the sheet unmounts the
  draft — the same reset-on-close behavior as `CreateBrand`.

## Local Invariants

- The theme's semantic colour tokens are `--success`, `--warning`, `--info`, and
  `--destructive` (each also exposed to Tailwind as `bg-success`,
  `text-destructive`, …). `--pos`, `--neg`, and `--warn` are **not defined
  anywhere** — call report code still references them in places, and those rules
  silently resolve to nothing, which is why some badges render untinted. Never
  add a new use; the fix is the real token, not a new variable in `core-ui`
  (out of plugin scope).
- Call report tables compose `ReportTable`, never `erxes-ui`'s `Table`
  directly. `Table` is tuned for the record grids — `table-fixed` columns and
  `p-0` cells against `px-2` heads — which in a seven-column report gives the
  label column the same width as a two-digit count and misaligns every header
  from its values. `ReportTable` re-establishes `table-auto`, symmetric padding,
  and a horizontal scroll container; fix density there, not per table, and never
  by editing `erxes-ui` (out of plugin scope, and the record grids depend on
  those defaults).
- `callKpiScorecard.serviceLevel` and `averageSpeed` are nullable `Float`s.
  Render them with `fmtPctOrDash` / `fmtDurOrDash` so an absent measurement
  shows `—`; `fmtPct` / `fmtDur` coerce null to `0` and report a fabricated
  metric. Both currently arrive as numbers from the CDR pipelines, so the dash
  is a fallback, not the common case.
- `detectCarrier` mirrors `carrierExpression` in `frontline_api`'s call report
  service, which is what actually labels the report data — the UI helper only
  covers phone numbers the plugin classifies itself. Change both together.
- Channel scope is presentation-only here; the server is the authority. Never
  infer privacy from the UI, and never offer a members/invite affordance on a
  channel whose `scope` is `personal`.
- A missing `scope` means `team`. Use `channelScopeOf` rather than reading
  `channel.scope` directly.
- The per-channel integration-type and per-channel count queries are fetched
  lazily (`skip` while the channel row is collapsed) so a long channel list
  costs one request, not one per channel. Keep it that way when adding rows to
  the tree — each `only: "byIntegrationTypes"` read fans out to one Elasticsearch
  count per integration kind on the server.
- Channel-level unread counts ride along on `GetMyChannels` itself, and member
  avatars come from a single batched `GetChannelMembers`. Never move either into
  the per-channel row.
- `NavigationMenuGroup` renders its `actions` slot inside the group's own
  collapsible trigger, so every interactive control there must go through
  `NavigationGroupActions` — without it, clicking the control also folds the
  group.
- That same slot stays hidden until the header is hovered. Anything that must
  remain on screen there (the unread summary) needs its own `visible` class,
  because `visibility` inherits.
- Anything that creates, removes, or archives an integration must refetch
  `IntegrationsGetUsedTypes` and `IntegrationsGetUsedTypesByChannel`, or the
  sidebar keeps listing a type that no longer exists.
- Never expose a scope picker or a "create personal channel" action. Personal
  channels are provisioned lazily by the API when `GetPersonalChannel` is read
  or an integration is created without a channel; the UI only ever reads one.
- `IntegrationList` renders the whole `INTEGRATIONS` catalogue on every channel.
  Personal and team channels accept the same kinds, so do not add a per-scope
  filter to it.
- Any mutation that changes channel membership or channel lists must refetch or
  update `GetMyChannels`, otherwise the sidebar goes stale.
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
- New user-visible strings go through `useTranslation('frontline')` with keys
  added to both `en` and `mn` gateway-owned locale files; that is a
  repository-level change and must be requested explicitly.

## Validation

- `pnpm nx build frontline_ui`
- `npx eslint src/...` on touched files — the project carries pre-existing lint
  errors and TypeScript errors elsewhere, so lint and typecheck the files you
  changed rather than the whole project.
- `project.json` defines only `build`, `serve`, and `serve-static` — there is no
  `test` target for this project; do not invent one.
- Smoke: open `/frontline/inbox` and confirm the sidebar shows `Me` then
  `Team inbox`; that `Me` lists the personal channel's integration types with
  their counts and a header total (empty state when there is no personal inbox);
  that expanding a team channel loads its types and clicking one filters the
  conversation list by that channel and type; that clicking the channel row
  itself clears the type filter; that team channels list in name order;
  that quiet channels fold behind the "N quiet teams" row
  and expand when it is clicked; and that creating a channel from `Team inbox`
  adds it to that group without a reload.
- Smoke: in the automation builder attach a Facebook message action to a
  `frontline:facebook.comments` trigger and confirm the sequence header shows
  the single-message notice and every "Add …" button is disabled once one
  message exists; attach the same action to a `frontline:facebook.messages`
  trigger and confirm five messages are still allowed.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-10` — Ticket property fields carry their type and options

- **Summary:** Toggling a ticket property into a messenger ticket form now
  stores the source property's `type` and `options` alongside its label,
  placeholder, required flag, and order, and the four ticket-config documents
  select both back. The messenger widget uses them to render the matching input
  instead of a text box; the API rewrites both from the current core field
  definition on every save, so nothing here edits them.
- **Affected areas:**
  `src/modules/pipelines/components/configs/components/TicketPropertyFields.tsx`,
  `.../configs/schema.ts`, `.../configs/graphql/**`.
- **Contracts changed:** `None` on the UI side; the ticket-config documents now
  select the new optional `type` and `options` fields from `frontline_api`.

### `2026-08-10` — Ticket config picker is multi-select

- **Summary:** `SelectTicketConfig` now selects many ticket configs instead of
  one: its context is `value: string[]` / `onValueChange: (configIds: string[])`,
  items toggle in and out of the array, the popover stays open across toggles,
  the trigger shows the single config's name or `n-selected`, and the list gained
  loading and error states. Also repointed the messenger preview's two ticket
  gates from the removed `ticketConfigId` to `ticketConfigIds`.
- **Affected areas:**
  `src/modules/pipelines/components/configs/components/SelectTicketConfig.tsx`,
  `.../configs/hooks/useGetTicketConfigs.ts`,
  `src/modules/integrations/erxes-messenger/components/EMPreviewIntro.tsx`.
- **Contracts changed:** `SelectTicketConfig`, its `Provider`, and its `FormItem`
  take `value?: string[] | null` and emit `string[]`; `useGetTicketConfigs` also
  returns `error`.

### `2026-08-10` — Current Mongolian carrier prefixes

- **Summary:** `detectCarrier` now uses the current allocation — Skytel `90`,
  `91`, `92`, `96` and `696XXXXX`; Mobicom `85`, `94`, `95`, `99`; Unitel `80`,
  `86`, `88`, `89`; G-Mobile `83`, `93`, `97`, `98`; Ondo `60`, `66` — with the
  unallocated ranges falling through to `Unknown`. The country-code strip is now
  length-aware so a legitimate 8-digit `976XXXXX` G-Mobile number keeps its
  prefix.
- **Affected areas:** `src/modules/report/call/utils.ts`.
- **Contracts changed:** `None`

### `2026-08-10` — Ticket property fields in the messenger config builder

- **Summary:** The pipeline configuration sheet gained a "Select ticket property
  fields" section: ticket custom properties are listed per `frontline:ticket`
  field group, toggling one adds it to the form, and selected properties get
  drag-ordered cards with label, placeholder, and required controls, saved as
  `propertyFields` on the ticket config.
- **Affected areas:**
  `src/modules/pipelines/components/configs/components/TicketPropertyFields.tsx`
  (new), `.../components/ConfigsForm.tsx`, `.../schema.ts`, `.../constant.ts`,
  `.../hooks/usePipelineConfigForm.ts`, `.../graphql/**`.
- **Contracts changed:** `None` on the UI side; the four ticket-config documents
  now select the new optional `propertyFields` field from `frontline_api`.

### `2026-08-10` — Denser, scannable call report tables

- **Summary:** The Agents, Callbacks, and Top Numbers tables now compose a
  shared `ReportTable` wrapper that replaces `erxes-ui`'s `table-fixed` /
  `p-0` defaults with content-sized columns, real cell padding, aligned heads,
  and horizontal scrolling. Added proportional `Meter` bars for call volume,
  answer rate, and callback recovery; an agent row now shows name over
  extension with its leaderboard rank; the expander is a real button with
  `aria-expanded`; and the drilldown became a labelled grid. Fixed a missing
  React `key` on the agent row fragment, and repointed these three tables'
  colours from the undefined `--pos` / `--neg` / `--warn` variables to the
  theme's real `--success` / `--destructive` / `--warning`, so the count pills
  are actually tinted.
- **Affected areas:** `src/modules/report/call/components/ReportTable.tsx`
  (new), `.../components/Meter.tsx` (new),
  `.../components/AgentsSection/{AgentTable,AgentDrilldown}.tsx`,
  `.../components/CallbacksSection/CallbacksSection.tsx`,
  `.../components/TopNumbersSection/TopNumbersSection.tsx`.
- **Contracts changed:** `None`

### `2026-08-10` — Unmeasured call KPIs render as `—`

- **Summary:** Service Level and Avg Speed of Answer now show `—` instead of
  `0.0%` / `00:00:00` when the backend has no ring time to measure them from,
  via new `fmtPctOrDash` / `fmtDurOrDash` helpers. Answer Rate was also gated on
  `serviceLevel != null`, so it disappeared whenever service level was
  unmeasured; it now derives from `abandonment` alone.
- **Affected areas:** `src/modules/report/call/utils.ts`,
  `src/modules/report/call/types.ts`,
  `src/modules/report/call/components/KpiSection/KpiSection.tsx`.
- **Contracts changed:** `KpiScorecard.serviceLevel` and
  `KpiScorecard.averageSpeed` are typed `number | null` (the GraphQL fields were
  already nullable `Float`).

### `2026-08-06` — Live unread counts on team channel rows

- **Summary:** `Team inbox` rows now show `Channel.unreadConversationCount`
  instead of the channel's open-conversation count, kept current by a
  `conversationClientMessageInserted` subscription that refetches
  `GetMyChannels`, and by a refetch when a conversation is marked read. The
  quiet/busy split follows the same number, and the now-unused
  `useConversationCountsByChannel` hook was removed.
- **Affected areas:**
  `src/modules/inbox/channel/{components/TeamChannelsNav.tsx,hooks/useChannelUnreadUpdates.tsx}`,
  `src/modules/inbox/conversations/{hooks/useConversationCounts.tsx,conversation-detail/hooks/useConversationMarkAsRead.tsx}`,
  `src/modules/channels/{graphql/queries.ts,types/index.ts,hooks/useGetMyChannels.tsx}`.
- **Contracts changed:** `useGetMyChannels` also returns `refetch`;
  `useConversationCountsByChannel` removed; `IChannel` gained optional
  `conversationCount` and `unreadConversationCount`.

### `2026-08-06` — Personal channel offers the full integration catalogue

- **Summary:** Dropped `PERSONAL_INTEGRATION_TYPES` and the `integrationTypes`
  filter on `IntegrationList`, so the personal channel page lists the same
  integration cards as a team channel.
- **Affected areas:**
  `src/modules/integrations/{components/IntegrationList.tsx,constants/integrations.ts}`,
  `src/modules/channels/components/settings/personal-channel/PersonalChannelDetails.tsx`.
- **Contracts changed:** `IntegrationList` lost its optional `integrationTypes`
  prop; `channelId` and `heading` are unchanged.

### `2026-08-06` — Team inbox sort control removed

- **Summary:** Dropped the `Team inbox` sort toggle, the unread re-order behind
  it, and the `teamInboxSortState` atom. The group now renders channels in the
  order the API returns them; the quiet-channel folding and per-row counts are
  unaffected.
- **Affected areas:**
  `src/modules/inbox/channel/components/TeamChannelsNav.tsx`,
  `src/modules/inbox/channel/states/teamInboxSortState.ts` (deleted),
  `frontline` locale files (`sort-team-inbox`, `sort-by-unread` removed).
- **Contracts changed:** None.

### `2026-08-05` — Channel name ordering moved to the API

- **Summary:** `GET_MY_CHANNELS` now sends `sortField` / `sortDirection` and
  `useGetMyChannels` pins name-ascending for every caller, so the sidebar drops
  its `localeCompare` pass. The persisted `teamInboxSortState` now only decides
  whether the unread re-order runs on top of that order.
- **Affected areas:** `src/modules/channels/graphql/queries.ts`,
  `src/modules/channels/hooks/useGetMyChannels.tsx`,
  `src/modules/inbox/channel/{components/TeamChannelsNav.tsx,states/teamInboxSortState.ts}`.
- **Contracts changed:** None on this side; consumes the new `getMyChannels`
  sort arguments from `frontline_api`.
