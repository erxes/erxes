# `frontline_ui` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/frontline_ui`
- **Last synchronized:** `2026-08-12`

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
- Report screens for the frontline plugin, including the default chart catalogue
  and the saved charts board built on top of it.
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
- The ticket reports board renders the default charts from
  `TICKET_DEFAULT_CARD_CONFIGS` plus every saved chart returned by
  `reportCharts`. **Every** ticket card — status summary, date, source, tags,
  custom properties, and list — carries Save in its header: it names the current
  filter selection into a new saved chart, which appears on the board
  immediately and reopens with those filters restored. The default charts are a
  frontend constant and are never modified by saving; a saved card additionally
  carries a delete action.

## Architecture

| Area               | Path                                                                                                                                         | Responsibility                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Host registration  | `src/config.tsx`                                                                                                                             | `CONFIG` — navigation, settings, widgets, property inputs, routes, and Module Federation exposes |
| Federation         | `module-federation.config.ts`                                                                                                                | Remote name `frontline_ui` and its exposes                                                       |
| Routes             | `src/modules/FrontlineMain.tsx`, `src/pages/`                                                                                                | Routed pages for inbox, ticket, forms, call, channels                                            |
| Navigation groups  | `src/modules/FrontlineSubGroups.tsx`                                                                                                         | Route-aware sidebar sub-groups for every frontline page                                          |
| Settings routes    | `src/modules/FrontlineSettings.tsx`                                                                                                          | Top-level frontline settings routes and their page chrome                                        |
| Channel picker     | `src/modules/inbox/channel/components/ChooseChannel.tsx`                                                                                     | Scope-filtered channel list bound to the `channelId` query param                                 |
| Inbox nav trees    | `src/modules/inbox/channel/components/{PersonalInboxNav,TeamChannelsNav}.tsx`                                                                | The `Me` group and the `Team inbox` group, each rendering its own `NavigationMenuGroup` header   |
| Nav header count   | `src/modules/inbox/channel/components/UnreadSummary.tsx`                                                                                     | The "N unread" figure in a group header's actions slot                                           |
| Nav group actions  | `src/modules/NavigationGroupActions.tsx`                                                                                                     | Click guard for a `NavigationMenuGroup` `actions` slot                                           |
| Sidebar counts     | `src/modules/inbox/conversations/hooks/useConversationCounts.tsx`                                                                            | `conversationCounts` reads per integration type inside one channel                               |
| Live unread        | `src/modules/inbox/channel/hooks/useChannelUnreadUpdates.tsx`                                                                                | Subscribes to incoming customer messages and refreshes channel unread counts                     |
| Channel settings   | `src/modules/channels`                                                                                                                       | Channel CRUD, members, GraphQL documents, form schemas                                           |
| Personal channel   | `src/modules/channels/components/settings/personal-channel`, `src/pages/PersonalChannelPage.tsx`                                             | Profile page for the user's private inbox                                                        |
| Inbox              | `src/modules/inbox/`                                                                                                                         | Conversations, messages, filters, channels, brands, integrations                                 |
| Integrations       | `src/modules/integrations/`                                                                                                                  | Per-provider connect forms and detail views                                                      |
| Ticket             | `src/modules/ticket/`, `src/modules/pipelines/`, `src/modules/status/`                                                                       | Ticket boards, pipelines, statuses                                                               |
| Forms              | `src/modules/forms/`                                                                                                                         | Form builder, preview, submissions                                                               |
| Knowledge base     | `src/modules/knowledgebase/`                                                                                                                 | Topics, categories, articles                                                                     |
| Automation widgets | `src/widgets/automations/modules/<module>/`                                                                                                  | Per-module trigger/action/bot/history components                                                 |
| FB message action  | `src/widgets/automations/modules/facebook/components/action/`                                                                                | Message sequence form, provider, constants, states                                               |
| FB post composer   | `src/modules/integrations/facebook/components/FacebookPostSheet.tsx`, `FacebookPostImagesField.tsx`, `hooks/useFacebookPost*.tsx`            | Post sheet, image upload state, channel/page loading                                             |
| Call report tables | `src/modules/report/call/components/{ReportTable,Meter}.tsx`                                                                                 | Shared density wrapper over `erxes-ui` `Table`, plus the proportional bar used inside its cells  |
| Reports board      | `src/modules/report/components/TicketReportsList.tsx`, `src/modules/report/types/component-registry.ts`                                      | Card layout, drag-and-drop, and the default-chart + saved-chart registry                         |
| Saved charts       | `src/modules/report/components/report-chart/`, `src/modules/report/hooks/{useReportCharts,useTicketChartFilterConfig,useTicketChartCard}.ts` | Save/delete actions, `reportCharts` reads and writes, capturing and restoring a filter selection |
| Notifications      | `src/widgets/notifications/`                                                                                                                 | Notification remote entries                                                                      |

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
- `ReportComponentProps` — every report card component receives `title`,
  `colSpan`, `onColSpanChange`, plus `cardId` (the registry id for a default
  chart, the chart `_id` for a saved one) and `savedChart` when it renders a
  saved configuration. A component that ignores the last two still works; one
  that supports saving reads `cardId` for its filter atoms.
- `TICKET_CHART_TYPES` from
  `src/modules/report/types/component-registry.ts` — the registry keys shared by
  the default cards, `ticketReportComponents`, and each card's save action.
  These strings are persisted as a saved chart's `chartType`, so they must not
  be renamed.
- `useTicketChartCard({ title, cardId, savedChart })` from
  `src/modules/report/hooks/useTicketChartCard.ts` — the plumbing every ticket
  card shares: `id`, `filterConfig` (what gets saved), `queryFilters` (what gets
  queried, with the relative `date` resolved to a range), and `filtersRestored`.
  A new ticket card uses this rather than reading the filter atoms itself.

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
- `frontline_api` GraphQL `reportCharts`, `reportChartAdd`, and
  `reportChartRemove` — saved report charts. The board reads **all** saved
  charts in one query and filters them to the chart types it can render, and
  both mutations update that same cache entry, so a chart saved from any card
  appears without a refetch or a reload. Do not reintroduce a per-chart-type
  query: the mutation would then write to a different cache entry than the
  board reads.
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
- Report card filters live in per-card Jotai atoms in
  `src/modules/report/states.ts`, keyed by `cardId`. Two cards never share a
  key, which is what lets a saved chart hold its own selection next to the
  default chart it was saved from. `useTicketChartFilterConfig` reads those
  atoms into the shape that is both saved and sent as query variables, and
  `useRestoreTicketChartFilters` writes a saved chart back into them once per
  mount.
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
- The ticket KPI row derives its total by summing **every** row
  `reportTicketPriority` returns, including the `priority: 0` one, so it shows
  the real ticket count. Only rows with `priority > 0` become cards — the
  untriaged figure goes in the total card's subtitle, which keeps the row at
  five cards and inside `xl:grid-cols-5`. Never sum only the rendered cards; that
  is what made "Total Tickets" disagree with its own percentages.
- Ticket Status Summary rows are pipeline statuses, not the six built-in
  categories: `name` is the status as the settings screen shows it, `group` is
  the category it sits under, and `color` is the category's, so the colour
  coding survives. A row with no `group` is a fallback for tickets whose status
  was deleted. Never assume six rows, and never assume a non-empty list.
- The report state filter defaults to `active`, matching the API. `all` is a
  real value meaning "include archived and deleted", not the absence of a
  filter — so `hasFilters` ignores `active` rather than treating any value as a
  filter, and Clear resets to `active`, not to an empty string.
- `state` (menu label "State") and `statusIds` (menu label "Status") are two
  unrelated ticket filters that sit next to each other in the same menu:
  `state` (`getReportStateFilterAtom`) is the active/archived/deleted
  lifecycle flag; `statusIds` (`getReportTicketStatusFilterAtom`, multi-select)
  is a set of real pipeline `Status._id` values from Settings → Channels →
  Pipelines → Ticket statuses, fetched per-pipeline via
  `useGetAccessibleTicketStatuses`. Never conflate the two atoms or their
  query variables — the backend also keeps a separate, frontend-unused
  single-value `status: String` field on `TicketReportFilter`, so never wire
  `statusIds` through that field either. Ticket statuses are pipeline-scoped
  (`getAccessibleTicketStatuses(pipelineId: String!)` takes exactly one), so
  — matching `PipelineFilterView`'s existing `channelIds[0]` convention —
  `TicketStatusFilterView` reads only the first selected pipeline and shows
  "Pipeline not selected" until at least one is picked; it does not attempt
  to merge statuses across multiple selected pipelines.
- A report card must take its identity from the `cardId` prop, never from its
  translated `title`. Deriving the id from the title made filter atoms, the
  filter popover's session key, and the drag-and-drop id change with the
  interface language; `cardId` is stable and is also the saved chart's `_id`.
- A card that renders a saved chart must not query before
  `useRestoreTicketChartFilters` reports back — it holds the query with `skip`
  and shows its skeleton, otherwise the card flashes unfiltered data before the
  saved filters land.
- Exposed modules stay lazy-loaded and wrapped in `Suspense`.
- Routed pages use `h-full`, never `h-dvh`/`h-screen`.
- New user-visible strings go through `useTranslation('frontline')` with keys
  added to both `en` and `mn` gateway-owned locale files; that is a
  repository-level change and must be requested explicitly.
- `MessageInput.tsx`'s scrollable region (the discord reply banner, the
  `BlockEditor`, and `MessageInputAttachments`) must stay `flex-1 min-h-0
  overflow-y-auto`, never a plain `h-full`. The input `Resizable.Panel` clips
  overflow, so a `h-full` editor with no `min-h-0` grows past the panel and
  silently hides the toolbar (Internal Note toggle, Send button) below the
  clipped edge instead of scrolling — that was the "input view is out of
  screen" bug. The toolbar row itself stays `shrink-0` so it is never the
  thing that gets compressed.
- `ConversationDetailLayout`'s two `Resizable.Panel`s must keep both a
  `minSize` (percentage, messages `30` / input `20`, guards manual dragging)
  and a `min-h-*` className (`min-h-0` messages / `min-h-56` input, a hard
  pixel floor). The percentage alone is not enough: `minSize={20}` is 20% of
  whatever height the panel group actually has, and a real windowed browser
  (title bar + tabs + address bar + bookmarks bar, not just the CSS
  `innerHeight` a headless test assumes) can leave that group short enough
  that 20% is still fewer pixels than the toolbar needs. The `min-h-56`
  (224px) on the input panel is a real CSS `min-height`, which flexbox always
  honors over the computed flex-basis — confirmed by testing real windowed
  heights (not just viewport size) down to 480px and still seeing the full
  toolbar. Don't drop either guard; they cover different failure modes (drag
  vs. genuinely short window).
- "Internal" content — the composer, sent-message bubbles, call notes, and
  Facebook/Instagram message bot preview blocks — is tinted `bg-info`
  (a blue "private note" read), not `bg-warning` (amber/"caution"). Keep
  compose-time and rendered colors identical across every `internal &&` /
  `isInternalNote &&` conditional in the plugin; don't reintroduce
  `bg-warning` for this concept even in one spot, or typing a note and seeing
  it land will show two different colors.
- `ResponseTemplateSelector.tsx`'s infinite scroll is `useInView`
  (`react-intersection-observer`, no explicit `root`) on a sentinel div
  rendered only while `pageInfo?.hasNextPage`, guarded by a synchronous
  `isFetchingRef` so an in-flight `fetchMore` can't be re-triggered before
  `pageInfo`/`responses` update. If you touch this again: the sentinel must
  actually render (a ref alone does nothing), and any new bottom-of-list
  element must carry `col-span-2` or it becomes a stray 1-column cell in grid
  view, since `Command.List`'s `[cmdk-list-sizer]` puts every child — items
  and sentinel alike — in the same CSS grid.
- `MessageInputAttachments.tsx` renders both the in-flight upload preview and
  finished `attachments` as chips, reusing `getFileIcon` / `formatBytes` /
  `readImage` from `erxes-ui` for icons, sizes, and image thumbnails. It is a
  presentational component only — `MessageInput.tsx` still owns the upload
  (`useUpload`) and removal state; do not move that state into the
  presentational component or hand-roll a new attachment tile style here.

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

### `2026-08-12` — Response template popover: clearer view toggle, tighter channel filter, real infinite scroll

- **Summary:** Restyled `ResponseTemplateSelector.tsx` (the popover opened from
  the composer's template icon). The grid/list switch was a single button that
  swapped its own icon depending on the current mode — you could never see
  both options at once, so the active state was invisible. Replaced it with a
  `ToggleGroup` (`variant="outline"`), the same segmented-control component
  `EmailDeliveryViewToggle`/`DealsViewControl` use elsewhere, so both icons are
  always visible and the active one gets the standard highlighted treatment.
  Stripped the "Select channels" row's redundant `bg-muted/30 p-1 rounded`
  wrapper and stray filter icon — it's now a bare `SelectChannel.CommandBar`
  (already a bordered, self-contained `h-8` combobox), cutting its footprint
  without touching the underlying single-select filter logic. Replaced the
  "Load more" button with real infinite scroll: an inert `sentinelRef` +
  hand-rolled `IntersectionObserver` already existed but the sentinel div was
  never rendered, so it was dead code silently backstopped by the button. Swapped
  it for `useInView` (`react-intersection-observer`, already a dependency via
  `Combobox.FetchMore`) with an `isFetchingRef` guard against duplicate
  `fetchMore` calls and a `skip` once `pageInfo.hasNextPage` is false. Verified
  live against 30 seeded templates (since seeded and removed): scrolling near
  the bottom fires exactly one `fetchMore`, five more scroll events while it
  resolves fire zero additional ones, all appended items stay unique, and the
  list never jumps since new items are appended below the fold. No change to
  `useGetResponses`, the cursor-pagination hook, or the client-side
  search/channel filtering.
- **Affected areas:**
  `src/modules/inbox/conversations/conversation-detail/components/ResponseTemplateSelector.tsx`.
- **Contracts changed:** None.

### `2026-08-12` — Message composer visual consistency and overflow fix

- **Summary:** Restyled the inbox message composer (`MessageInput.tsx`),
  including Internal Note mode: consolidated the mixed margin utilities into a
  single flex `gap`, moved the editor to `flex-1 min-h-0 overflow-y-auto`
  (was a plain `h-full`) so long content scrolls internally instead of
  pushing the toolbar past the input `Resizable.Panel`'s clipped bounds —
  fixing a bug where the Internal Note toggle and Send button could render
  entirely below the visible viewport. Extracted the ad hoc attachment
  list/preview markup (emoji file icon, raw `<button>`s, no hover affordance)
  into `MessageInputAttachments.tsx`, a chip list reusing `getFileIcon` /
  `formatBytes` / `readImage` from `erxes-ui` with a hover-and-focus-reveal
  remove button matching `DiscordMessageActions`' destructive-hover pattern,
  and capped it at `max-h-40` with its own internal scroll so a long
  attachment list can't reproduce the same overflow bug. Also swapped the
  hidden file `<input>` from an `id` + `document.getElementById` lookup to a
  `useRef`, avoiding a cross-instance id collision if more than one
  `MessageInput` is mounted at once. Lightly restyled
  `ResponseTemplateDropdown.tsx` (the typing-triggered template autosuggest)
  to use `cn()`, the shared `Kbd` component for its "press Enter" hint, and
  the standard `bg-accent` hover/selected treatment instead of a one-off
  `bg-info` tint, so it reads consistently with `ResponseTemplateSelector`'s
  popover. Follow-up 1: the input `Resizable.Panel` in `ConversationDetailLayout`
  had no `minSize`, so dragging the handle (or a short window) could still
  squeeze the toolbar out of view even with the flex fix above — both panels
  now carry a `minSize` (messages `30`, input `20`) so the input can't be
  collapsed smaller than the toolbar needs. Follow-up 2: `minSize` alone still
  wasn't enough on a real windowed browser — a percentage of a short group is
  still short, and a headless test's `viewport` height overstates what a
  titlebar-plus-tabs-plus-toolbars browser actually leaves for content. Added
  a real CSS floor, `min-h-56` (224px) on the input panel and `min-h-0` on the
  messages panel, which flexbox enforces regardless of the percentage split;
  confirmed the toolbar renders in full down to a 480px-tall window. Also
  recolored every "internal
  note" tint in the plugin from the warning/amber token to `bg-info` (the
  composer, `ConversationMessage`/`MessageItem` bubbles, call `InternalNotes`,
  `FbMessengerMessages`/`IgMessengerMessages`, and the three
  `FbMessengerBotMessageBlocks` preview blocks) so compose-time color matches
  the sent/rendered color everywhere internal notes appear — a blue "private
  note" tint rather than an amber "caution" one. No functional/behavioral
  change to sending, uploading, templates, or Internal Note toggling.
- **Affected areas:**
  `src/modules/inbox/conversations/conversation-detail/components/{MessageInput.tsx,MessageInputAttachments.tsx (new),ResponseTemplateDropdown.tsx,ConversationDetailLayout.tsx}`,
  `src/modules/inbox/conversation-messages/components/{ConversationMessage.tsx,MessageItem.tsx}`,
  `src/modules/integrations/call/components/InternalNotes.tsx`,
  `src/modules/integrations/facebook/components/{FbMessengerMessages.tsx,FbMessengerBotMessageBlocks/*.tsx}`,
  `src/modules/integrations/instagram/components/IgMessengerMessages.tsx`.
- **Contracts changed:** None.

### `2026-08-10` — Ticket reports can filter by real pipeline status (multi-select)

- **Summary:** The ticket report filter gained a "Status" filter, separate
  from the existing active/archived/deleted filter (relabelled "State" so the
  two are no longer both called "Status"), that multi-selects the actual
  configurable statuses (New/Open/In Progress/... plus any custom
  sub-statuses) from the first selected pipeline via
  `getAccessibleTicketStatuses`, matching what Settings → Channels →
  Pipelines → Ticket statuses shows. The backend `TicketReportFilter`/
  `ReportChartFilters` gained a new `statusIds: [String]` field alongside the
  existing single-value `status: String` (left untouched — unused by the
  frontend, so no reason to repurpose it), and `buildTicketMatch` matches
  `statusId: { $in: filters.statusIds }`.
- **Affected areas:** frontend —
  `src/modules/report/components/filter-popover/ticket-report-filter.tsx`,
  `src/modules/report/hooks/useTicketChartFilterConfig.ts`,
  `src/modules/report/states.ts`, `src/modules/report/types.ts`,
  `src/modules/report/graphql/queries/getReportCharts.ts`; backend (see
  `frontline_api`'s guide) — `src/modules/reports/{@types/reportFilters.ts,
utils.ts,graphql/schema/{ticket.ts,chart.ts},db/definitions/chart.ts}`;
  `backend/gateway/src/locales/{en,mn}/frontline.json` (gateway-owned).
- **Contracts changed:** `TicketReportFilter` and `ReportChartFilters`
  (backend GraphQL) gained `statusIds: [String]`; `ReportChartFilters`
  (frontend TS type) gained matching optional `statusIds?: string[]`. A saved
  chart's `filters.statusIds` now round-trips through save/restore like every
  other ticket filter. The `state` filter's menu item switched from the
  shared `status` label to the existing `state-label` key; no atom, value, or
  query variable changed for `state`.

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

### `2026-08-10` — Form preview number fields drop the thousands separator

- **Summary:** `Input.Number` from `erxes-ui` formats with a `,` thousands
  separator by default, so a phone number typed into a `number` form field
  previewed as `00,000,000`. The form preview now passes
  `thousandsSeparator=""` for these fields.
- **Affected areas:** `src/modules/forms/components/FormPreview.tsx`.
- **Contracts changed:** None.


