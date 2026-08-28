# `frontline_ui` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/frontline_ui`
- **Last synchronized:** `2026-08-27`

## Scope

### Owns

- The `frontline` navigation group and settings navigation registered through
  `src/config.tsx`.
- Inbox surfaces: conversation list, conversation detail, message input, the
  inbox navigation sub-groups, response templates, and integration
  configuration screens.
- Channel settings (list, detail, members, integrations) and channel forms.
- Integration connect/detail UIs for IMAP, Mail, Facebook, Instagram, Discord,
  calls, Call Pro, and the erxes messenger.
- The mail conversation surface: the threaded reader, its compose box, the
  quoted-content toggle, the sandboxed email body renderer, and delivery state
  and resend.
- The mail channel's **Bring your own Cloudflare Email Routing & Sending** section
  in Integrations config: paste an API token,
  pick one of that account's domains, watch the fourteen provisioning steps, and
  repair, update or disconnect afterwards. The connected card also reports whether
  replies leave through that account and, when they do, its sending quota.
- The mail inbox's four-step add wizard — basics, receiving, sending, done — and
  the matching edit dialog. The sending step names the domain replies will leave
  from and takes the sender display name, or blocks with the reason when neither
  the workspace's Cloudflare account nor the deployment's can sign. A preview
  renders the exact `Name <address>` recipients will see.
- The mail inbox's delivery check: a button in the integration dialog that runs
  `mailCheckConnection` and reports whether inbound mail reaches this workspace,
  naming the tenant and the endpoint the worker delivers to.
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

- Ticket pipeline settings include a Properties route that lists only Core
  `frontline:ticket` properties, grouped by their Core field group. Checked
  fields are stored on the pipeline, and ticket detail renders only that
  pipeline's selected fields. Legacy pipelines continue rendering all fields
  until their Properties selection is saved for the first time.
- Runs as a Module Federation remote on port `3004`, bundled with Rspack.
- The messenger ticket form builder lives on a pipeline's configuration sheet
  (`src/modules/pipelines/components/configs/`): a pipeline owns **one**
  configuration, which picks a status and a tag group, toggles the four built-in
  ticket fields, and also selects ticket custom properties out of the
  `frontline:ticket` field groups. The four built-in fields are
  drag-reorderable and each carries its own label and placeholder. Ticket
  properties are an `Accordion` with two drag levels: the field groups reorder
  among themselves, and inside an open group its selected properties reorder
  among themselves. Switching a property on reveals its label, placeholder, and
  required inputs inline under that row and moves it into the group's selected
  block; switching it off removes it. There is no second editor section — the
  saved order is the order the list shows.
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
- The conversation filter popover carries an `Automation status` sub-view over
  the `automationStatus` query param: `responded` (automation touched the
  conversation at all), `standby` (handoff requested), `handoff` (an operator
  took over). It is single-select, each row shows its count from
  `conversationCounts`, and `responded` is a superset of the other two, so the
  three counts overlap by design.
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
- Caps the Facebook message sequence at one message under a comment trigger only
  until the customer clicks a button: an action reached through an optional
  connect gets the full five, one reached through `nextActionId` stays at one.
  The sequence header explains the cap whenever it applies.
- Composes Facebook page posts from the integrations sidebar: channel and page
  selection, message, optional link, drag-and-drop image upload (max 10), and a
  permalink to the published post.
- Ticket tag selection (board card, detail sheet, create form) shows a single
  count trigger — a tag icon plus placeholder, or "Tag +N" once tags are
  selected — instead of listing every selected tag inline; the board card also
  renders up to 5 tag pills with a "+N" overflow badge below the card body.
- The ticket index favorite breadcrumb waits only while selected channel or
  pipeline metadata is loading. A terminally missing selection falls back to
  the tickets-only breadcrumb, while query failures render an explicit error
  state.
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
| Channel nav row    | `src/modules/inbox/channel/components/ChannelNavItem.tsx`                                                                                    | The shared selectable, collapsible channel row both inbox nav groups render                      |
| Nav group actions  | `src/modules/NavigationGroupActions.tsx`                                                                                                     | Click guard for a `NavigationMenuGroup` `actions` slot                                           |
| Sidebar counts     | `src/modules/inbox/conversations/hooks/useConversationCounts.tsx`                                                                            | Filter counts, plus the awaiting-reply figure per integration type inside one channel            |
| Live unread        | `src/modules/inbox/channel/hooks/useChannelUnreadUpdates.tsx`                                                                                | Subscribes to incoming customer messages and refreshes channel unread counts                     |
| Channel settings   | `src/modules/channels`                                                                                                                       | Channel CRUD, members, GraphQL documents, form schemas                                           |
| Personal channel   | `src/modules/channels/components/settings/personal-channel`, `src/pages/PersonalChannelPage.tsx`                                             | Profile page for the user's private inbox                                                        |
| Inbox              | `src/modules/inbox/`                                                                                                                         | Conversations, messages, filters, channels, brands, integrations                                 |
| Integrations       | `src/modules/integrations/`                                                                                                                  | Per-provider connect forms and detail views                                                      |
| Call Pro           | `src/modules/integrations/callpro/`                                                                                                          | Add/edit sheets over one shared `CallProIntegrationForm`, webhook URL hint, recording player, and the caller-to-customer picker                  |
| Ticket             | `src/modules/ticket/`, `src/modules/pipelines/`, `src/modules/status/`                                                                       | Ticket boards, pipelines, statuses                                                               |
| Forms              | `src/modules/forms/`                                                                                                                         | Form builder, preview, submissions                                                               |
| Knowledge base     | `src/modules/knowledgebase/`                                                                                                                 | Topics, categories, articles                                                                     |
| Automation widgets | `src/widgets/automations/modules/<module>/`                                                                                                  | Per-module trigger/action/bot/history components                                                 |
| FB message action  | `src/widgets/automations/modules/facebook/components/action/`                                                                                | Message sequence form, provider, constants, states                                               |
| FB post composer   | `src/modules/integrations/facebook/components/FacebookPostSheet.tsx`, `FacebookPostImagesField.tsx`, `hooks/useFacebookPost*.tsx`            | Post sheet, image upload state, channel/page loading                                             |
| Call report filters | `src/modules/report/call/components/{SubHeader,DateTimeRangeDialog}.tsx`, `src/modules/report/utils/dateFilters.ts`                            | Integration/queue/direction chips, date presets, and the date+time custom range                                                                  |
| Call report export | `src/modules/report/call/heatmapExcel.ts`, `src/modules/report/call/hooks/useHeatmapExport.ts`                                            | Date × hour spreadsheet of the heatmap, built with `ExcelJS` and handed to `downloadExcel`                                                        |
| Call report tables | `src/modules/report/call/components/{ReportTable,Meter}.tsx`                                                                                 | Shared density wrapper over `erxes-ui` `Table`, plus the proportional bar used inside its cells  |
| Reports board      | `src/modules/report/components/TicketReportsList.tsx`, `src/modules/report/types/component-registry.ts`                                      | Card layout, drag-and-drop, and the default-chart + saved-chart registry                         |
| Saved charts       | `src/modules/report/components/report-chart/`, `src/modules/report/hooks/{useReportCharts,useTicketChartFilterConfig,useTicketChartCard}.ts` | Save/delete actions, `reportCharts` reads and writes, capturing and restoring a filter selection |
| Mail conversation  | `src/modules/integrations/mail/components/MailConversationDetail.tsx`                                                                        | Thread reader, compose box, delivery badges and resend, quoted-content toggle                    |
| Mail body          | `src/modules/integrations/mail/components/EmailBody.tsx`                                                                                     | Sanitised, CSP-locked `srcDoc` iframe with the remote-image gate                                 |
| Mail data          | `src/modules/integrations/mail/{graphql,hooks,states}/`                                                                                      | `mailConversationDetail` window, send and retry mutations, form sheet atom                       |
| Mail provider setup | `src/modules/integrations/mail/components/MailConfigUpdate.tsx`, `src/modules/integrations/mail/hooks/useMailCloudflare*.tsx`                        | Cloudflare connect form, provisioning step list, outbound state and quota, repair and disconnect  |
| Mail add wizard    | `src/modules/integrations/mail/components/MailIntegrationForm.tsx`                                                                           | Four-step `Sheet` wizard over the shared `IntegrationSteps` chrome                               |
| Mail sending readiness | `src/modules/integrations/mail/components/MailSendingRequired.tsx`, `src/modules/integrations/mail/hooks/useMailSendingReadiness.tsx` | Names the Cloudflare domain replies leave from, or blocks the wizard's sending step with the reason and a link to Integrations config |
| Mail delivery check | `src/modules/integrations/mail/components/MailConnectionCheck.tsx`, `src/modules/integrations/mail/hooks/useMailConnectionCheck.tsx`         | Runs `mailCheckConnection` from the integration dialog and renders its verdict                   |
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
- `FACEBOOK_CHART_TYPES` and `facebookReportComponents` from
  `src/modules/report/types/component-registry.ts` — the Facebook card registry.
  `FACEBOOK_DEFAULT_CARD_CONFIGS` is the board's default catalogue, and the same
  strings are persisted as a saved chart's `chartType`.
- `useFacebookChartCard({ title, cardId, savedChart })` from
  `src/modules/report/hooks/useFacebookChartCard.ts` — the Facebook equivalent
  of `useTicketChartCard`, carrying `date` plus `pageIds`.
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
- `ui-modules`: `TagsSelect` (tags-new) for the `frontline:ticket` tag type —
  `Provider`/`Value`/`Content` drive `SelectTagsTicket`; `useGetTags` reads the
  full `frontline:ticket` tag catalogue for the board card's overflow pill
  list.
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
- `frontline_api` GraphQL `mailConversationDetail(conversationId!, limit)` —
  returns `{ messages, hasMore }`, the newest `limit` messages oldest-first, not
  a bare list. `mailSendMail` and `mailMessageRetry` return the delivery outcome
  (`_id`, `deliveryStatus`, `deliveryError`, `bouncedRecipients`), so the caller
  reads `deliveryStatus` instead of assuming the send worked.
  New mail arrives through `conversationMessageInserted`. An
  attachment the server could not store still carries a `url` — the mail worker's
  own signed link, kept as a fallback — plus an `error` saying why it was not
  re-hosted. The chip therefore stays clickable and puts the reason in its
  tooltip; only an attachment with no link at all falls back to the dimmed state.
  `readImage` returns absolute URLs untouched, so no special handling is needed.
- `frontline_api` GraphQL `mailCloudflareConnection`, `mailCloudflareZones`,
  `mailCloudflareConnect`, `mailCloudflareProvision` and `mailCloudflareDisconnect` —
  the Cloudflare section. The token is sent to fetch the domain list and again to
  connect; it is never read back, so the form always starts empty and a connected
  workspace shows the zone and worker origin instead.
- `frontline_api` GraphQL `mailCloudflareSendingQuota` — the connected account's
  sending allowance, read live from Cloudflare. It is skipped while
  `sendingEnabled` is false, so a workspace that only receives mail never pays for
  the round trip, and it is refetched with `mailCloudflareProvision` and
  `mailCloudflareConnect` so enabling sending fills the row in without a reload.
- `frontline_api` GraphQL `mailSendingReadiness` — whether this workspace can reply
  and from which domain. `cloudflare.domain` wins over `platform.domain` when both
  are ready, because a connected account addresses its inboxes on its own zone. The
  wizard gates Create on `ready` and the edit dialog reads the same query, so the
  button and the banner can never disagree with the server.
- `frontline_api` GraphQL `mailCheckConnection` — run on demand from the
  integration dialog, never cached (`fetchPolicy: 'no-cache'`), and rendered as a
  verdict rather than a toast, because its `{ ok, tenant, endpoint, error }` is
  the diagnostic itself. It is a deployment-wide check shown on an integration,
  so it is not refetched with integration data.
- `dompurify` — already a repository dependency, used to sanitise mail bodies
  before they reach the reader's iframe.
- `frontline_api` GraphQL `reportFacebookSyncPostStats` — the Sync button on
  the posts card. It is the only place this UI causes a Meta API call, it is
  always user-initiated, and it refetches `reportFacebookPosts` and
  `reportFacebookSummary` on completion so the table shows the new numbers
  without a reload.
- `frontline_api` GraphQL `reportFacebookPages`, `reportFacebookSummary`,
  `reportFacebookActivity`, `reportFacebookPosts`, and `reportFacebookBots` —
  the Facebook board's data. `reportFacebookPosts` pages on the server
  (`limit` + `page` in the filter), every other card pages client-side through
  `useChartPagination`.
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
  position is the display order — the API renumbers both `order` and
  `groupOrder` from that position on save, so nothing in this UI writes either
  value. Every reorder instead rewrites positions through `replace`, and
  switching a property on `insert`s it at the end of its own group's block
  rather than appending to the array. Group order is not stored per group
  anywhere: it is the order the groups' blocks appear in, which
  `TicketPropertyFields` seeds its local `groupIds` state from on first load.
  Each
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
- The mail thread keeps its page size in local state and passes it as the
  `limit` variable: "Show earlier messages" widens the window rather than
  merging pages, so the subscription's `refetch` keeps every loaded message and
  still picks up the new one. `previousData` backs the render while a wider
  window is in flight, so the thread never blanks. Whether the quoted part of a
  message and whether its remote images are shown are per-message component
  state and deliberately not persisted.

## Local Invariants

- The inbox navigation is a single-selection tree over three query params that
  intersect on the server: `channelId`, `integrationId`, and `integrationType`.
  Every selector writes all three through `INBOX_TARGET_KEYS`, clearing the ones
  it does not own — a channel row clears `integrationId` and `integrationType`, a
  Discord row clears `channelId` and `integrationType`. Setting one without
  clearing the others strands a filter and empties the list. `ConversationFilterBar`
  carries a chip for all three, so whatever is selected stays visible and
  removable.
- The per-kind figure beside an integration row comes from
  `integrationsGetUsedTypesByChannel`, which already returns
  `unreadConversationCount` scoped to the channel and to the caller. Read it from
  that query rather than recomputing it through `conversationCounts`, so a row
  and its channel row count the same thing and the sidebar does not pay for a
  second request per expanded channel. `useAwaitingCountsByIntegrationType`
  exists only for the awaiting-reply dot, which that query does not carry.
- `useConversations` is mounted more than once (the inbox list, the navigation
  count badge, the relation widget). Only the instance that passes no options
  owns the shared inbox state: it alone registers `refetchConversationsAtom`,
  consumes `refetchNewMessagesState`, raises `newMessagesCountState`, and plays
  the notification sound. A secondary consumer that took these over would
  refetch the wrong query after a mutation and multiply the badge and the sound
  by the number of mounted consumers.
- The live subscription in `useConversations` must not be keyed on Apollo's
  `subscribeToMore` identity — it is a new function each render, so the effect
  would tear the websocket subscription down and back up continuously and drop
  the events landing in the gap. Key it on the viewer and the serialized query
  variables, and reach `subscribeToMore` through a ref.
- Passing `options` to `useConversations` overrides the query variables
  wholesale; it no longer discards the rest of the Apollo options. Callers that
  want the sidebar filters applied must not pass `variables` at all.
- Both inbox nav groups render channels through `ChannelNavItem`, so `Me` and
  `Team inbox` stay structurally identical: the row itself selects the whole
  channel (`channelId` set, `integrationType` cleared) and the caret expands the
  integration types inside it, each of which narrows the same channel by source.
  A `NavigationMenuGroup` header is itself a collapse control, so a group that
  holds exactly one channel renders that channel with `collapsible={false}`:
  the personal row therefore has no caret of its own, since a second caret there
  would collapse the very rows the group header already collapses. Do not turn a
  group header into a selection control to work around this.
- The personal channel row is labelled `personal-channel` ("Personal channel"),
  the same word the settings breadcrumb uses. `inbox` and `my-inbox` are already
  taken in the same sidebar — by the frontline `Inbox` entry and by core's
  notification inbox in Favorites — so neither may label this row.
- A subscription payload the gateway could not resolve arrives as a null field, so
  `useConversations` treats a null `conversationClientMessageInserted` as "a message
  landed, ask the server" — it refetches the list and never reads the message. Any
  new `subscribeToMore` over a gateway-merged subscription reads its field the same
  optional way.
- A mail body is never rendered into the page. It goes through `DOMPurify`, then
  into an iframe `srcDoc` whose CSP is `default-src 'none'; style-src
  'unsafe-inline'` with `img-src` narrowed to `data:` plus the origins of that
  message's own stored attachments. Remote images are stripped of their `src`
  until the reader presses "Show images", which widens `img-src` to `https:`.
  The sandbox stays script-free — `allow-same-origin allow-popups
  allow-popups-to-escape-sandbox` only — and every link is rewritten to
  `target="_blank" rel="noopener noreferrer"`, so adding `allow-scripts` or
  rendering the body with `dangerouslySetInnerHTML` would undo the whole guard.
- The mail UI reports the delivery outcome the server returned. `mailSendMail`
  resolving is not success: the toast and the per-message badge read
  `deliveryStatus`, and a `failed` message shows its error plus a resend action
  wired to `mailMessageRetry`. Never restore an unconditional "email sent"
  message.
- An inbound message whose `senderMismatch` is set renders an unverified-sender
  warning above its body. The server decides that flag from the SMTP envelope;
  the UI never re-derives it from the visible addresses.
- Every Call Pro surface is gated on `useCallProConfig().enabled`, which reads
  the backend's `CALLPRO_ENABLED`. The frontend has no env var of its own for
  this — never add a `REACT_APP_*` flag, since injecting one means editing
  `core-ui`'s rspack config, outside this plugin.
- A Call Pro conversation with several candidate customers must never be
  auto-attributed in the UI. `CallProCustomerSelect` is the only path to
  `customerId`, and the unattached picker renders exactly when
  `!customerId && callProPotentialCustomerIds.length > 1`; once a customer is
  attached the same component reappears as the confirm/switch list built from
  `callProCustomersByPhone`, and only when that returns more than one match.
- Call Pro follows the `call` module's integration-form shape: `callProAddSheetAtom`
  (boolean) and `callProEditSheetAtom` (integration id) drive two `Sheet`s over a
  single `CallProIntegrationForm`, and `CallProIntegrationDetail` is the one place
  both sheets are mounted. Do not fork a second form for edit.
- Messenger `onlineHours` is persisted per concrete `Weekday` only. The
  `everyday` / `weekday` / `weekend` keys of `ScheduleDay` live in the same form
  record but are UI quick-selectors derived from the individual days, so they
  must never reach the save payload and are dropped when loading an existing
  integration. Build the payload by iterating `Object.values(Weekday)` in
  `EMStateValues.ts`, not by iterating the record's own keys.
- `TicketBasicFields` and `TicketPropertyFields` are one visual list on the
  configuration sheet: a `Label` section heading over `flex flex-col divide-y`
  rows of `py-2.5 first:pt-0 last:pb-0`, each row ending in a `flex-none`
  `Switch`, with the row's inputs below it carrying `sr-only` labels and
  placeholder text. Keep both in that shape; do not reintroduce `InfoCard`/`Card`
  wrappers around one of them.
- A ticket property is edited in place, under the row that toggles it —
  `SelectedPropertyFieldRow` renders the `propertyFields.<index>` inputs, and an
  unselected property renders as the plain `PropertyFieldRow`. The sheet is
  narrow, so never add a second section that repeats the selected properties,
  and never give a property both a switch and a separate delete control.
- The property accordion runs one `DndContext` over two `SortableContext`
  levels, so drag ids are prefixed `group:` and `field:` to say which level they
  belong to. Only **selected** properties are sortable — an unselected one has
  no array position to persist — and a drop outside the dragged row's own group
  is ignored, because a property belongs to the group its core field defines.
  Never move a row between groups or write `groupId` from a drag.
- `flatten` in `TicketPropertyFields` rebuilds the whole field array from the
  group and field order. It must append every value whose group or field
  definition is not loaded, otherwise a property from a group the picker cannot
  currently show is silently dropped from the configuration on the next drag.
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
- The call report is scoped by **integration**, not by queue. `CallReportsPage`
  gates every tab on `integrationId`, defaults `queueId` to the synthetic
  `ALL_QUEUES` (`'all'`) option it prepends to `queueOptions`, and each report
  hook skips on `!integrationId` while sending `queueId` only when it is a real
  queue. Never restore the "select the first queue and gate on it" behaviour: a
  deployment that moves its traffic off queues (to an IVR, say) then renders an
  entirely empty report even though every other tab has data.
- The call report's date chip has exactly one custom entry, and it is the
  plugin's own `DateTimeRangeDialog` — the shared `Filter.DialogDateView` is
  deliberately not mounted here, because its Day tab duplicated the same
  from–to calendar while silently rounding away the time. Its month, quarter,
  half-year, and year tabs are covered by the presets (`this-quarter` and
  `last-quarter` included); values already stored in those formats still parse.
- The call report's date filter can carry a time window, written as
  `custom-time:<fromISO>,<toISO>` by `DateTimeRangeDialog` and read by
  `parseCustomTimeRange` in `report/utils/dateFilters.ts` **before** the value
  reaches `erxes-ui`'s `parseDateRangeFromString`. That shared parser forces
  `startOfDay`/`endOfDay` on any `<from>,<to>` value, so a time written into
  the plain comma format the shared date dialog owns is silently rounded to
  whole days. Keep the two formats separate; the backend needs no change
  because `startDate`/`endDate` already travel as full ISO timestamps.
- `callGetQueueStats` can return the sentinel queue `__no_queue__` for calls
  that never entered a queue. `NO_QUEUE` in `report/call/utils.ts` mirrors that
  string in `frontline_api`; `QueuesSection` renders it as a labelled card
  instead of a raw id. The queue cards are meant to add up to the KPI Total
  Calls for the same filters — never filter them down to `queueOptions`, which
  lists only the queues configured on the integration.
- `callKpiScorecard.serviceLevel` and `averageSpeed` are nullable `Float`s.
  Render them with `fmtPctOrDash` / `fmtDurOrDash` so an absent measurement
  shows `—`; `fmtPct` / `fmtDur` coerce null to `0` and report a fabricated
  metric. Both currently arrive as numbers from the CDR pipelines, so the dash
  is a fallback, not the common case.
- The overview charts read `noAnswer` from `callVolumeSeries` and `callHeatmap`
  — every call in the bucket no human answered, both directions. It is not
  `abandoned` (inbound only) and not `total - answered` computed in the UI; ask
  the API for it so the chart and the Call history outcome counts agree.
- The heatmap's Excel export reads `callHeatmapDaily` lazily on click (never
  with the chart), because that query re-reads the range's CDRs. `heatmapExcel`
  lays the sheet out as date rows × hour columns with row/column totals and the
  peak hour of each row filled green, and keys the API's PBX-midnight `day`
  through `pbxDayKey` — the `+08:00` offset mirrors `PBX_OFFSET_MS` in
  `frontline_api`'s call report service, so an operator in another timezone
  still sees each call on its PBX date. Change both together.
- `HeatmapChart` colours a cell from the selected metric's own maximum, with the
  hue per metric in `METRIC_HUE` — `var(--heatmap-hue)` for total calls, and
  literal green / red hues for answered and no answer. `core-ui` defines only
  the one hue variable, so a new metric hue stays a constant in this component
  (adding a variable to `core-ui` is out of plugin scope).
- `detectCarrier` mirrors `carrierExpression` in `frontline_api`'s call report
  service, which is what actually labels the report data — the UI helper only
  covers phone numbers the plugin classifies itself. Change both together.
- "Can move" applies at **both ends** of a status change, matching
  `frontline_api`: the status the ticket leaves and the one it lands in must
  each accept the user. `canMoveTicketToStatus` in `useTicketPermissions` is the
  single implementation and is called once per end — the board checks the card's
  own column and then the column being dropped on, `useTicketPermissions({
  status })` returns the leaving side as `canMoveTicket` (what disables the
  status field in ticket detail), and `SelectStatusTicket` disables the options a
  user may not move into when the surface passes `restrictToMovable` (moves only
  — never on filter or create surfaces, where no ticket is being moved). An empty
  `canMoveMemberIds` means "everyone". `useTicketPermissions({ pipeline })`
  without a `status` returns permissive defaults, so its `canMoveTicket` must
  never stand in for a real per-status check.
- `useUpdateTicketStatus` hands Apollo its own `onError`, so its promise
  **resolves** on a refused write instead of rejecting — a `try`/`catch` around
  it never fires. Every caller decides success from `result?.data`
  (`StatusPermissionControl` commits the member selection only then,
  `StatusGroup` checks `result.value?.data` per reorder write). Committing local
  state unconditionally is what once made "Can move" look configured while the
  server stored nothing.
- The board keeps its own optimistic copy of the cards
  (`fetchedTicketsState` + `ticketCountByBoardAtom`), and nothing else restores
  it. Every optimistic move must pass an `onError` that puts the card and both
  counts back, otherwise a rejected move stays on screen until a reload.
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
- Under a comment trigger, only a message action that is **not** behind an
  optional connect may hold exactly one message; a private reply does not open
  the messaging window. A button click does, so every action downstream of an
  optional connect gets the normal five. `getMaxMessagesForAction` decides this
  from `trigger`, `currentAction.id` and `previousActions`, and the result is
  enforced in both `ReplyMessageProvider.addMessage` and the
  `MessageSequenceHeader` add buttons — keep the two in sync.
- `nextActionId` is not a customer response, so chaining message actions with it
  under a comment trigger keeps the one-message limit. Only
  `config.optionalConnects` lifts it.
- The trigger and the connected ancestor actions reach the action form through
  the `trigger` and `previousActions` props on `AutomationActionFormProps`; do
  not re-derive the automation graph inside the plugin.
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
- The Facebook board is reached through `/frontline/reports/facebook` and the
  page header's `ToggleGroup` in `ReportIndexPage`, which is the only report
  navigation a user can actually click. `ReportsView` also still renders it for
  `?reportModule=facebook`; keep both, because the query-param path is what the
  `REPORT_MODULES` entry uses. The KPI row reads the header's
  `OVERVIEW_KPI_DATE_FILTER_ID` date atom, exactly like the conversation board,
  so the header filter keeps driving it.
- **`REPORT_MODULES` is not a visible menu.** `ChooseReportModule` renders it,
  but its only consumer `ReportNavigations` is imported nowhere and
  `FrontlineSubGroups` computes `isReport` and then returns `null` for
  `/frontline/reports`. Adding an entry to `REPORT_MODULES` therefore ships no
  clickable surface — a new report board needs a `ReportIndexPage` route and
  toggle item as well.
- The posts card's "On Meta" column shows `—` until a sync has run, and the
  signed difference next to Meta's count is `meta − (comments + replies)` — a
  positive number means Meta has comments erxes never received, which is the
  gap the card exists to surface. Never hide it behind a zero default.
- The posts card pages on the **server**, so its query re-runs on every page
  step. `useFacebookPosts` falls back to Apollo's `previousData` and the card
  only shows its skeleton when nothing has loaded yet — gating the skeleton on
  `loading` alone unmounts the header, filters, and Sync button on every Next
  click, which reads as the whole card reloading. The other Facebook cards page
  client-side through `useChartPagination` and never refetch.
- `FacebookReportFilter` takes `showSearch`, and only the posts card passes it:
  search matches post text, so offering it on the activity or bot cards would
  show a control that silently does nothing. It follows the shared filter's
  string pattern: an `inDialog` `Filter.Item` opening a `Dialog.Content` with a
  title, `Input`, and Cancel/Apply footer, mirroring `Filter.DialogStringView`
  but controlled by the card's atom instead of query state. Applying is
  explicit, never debounced live, because the posts query pages on the server.
- A `Filter` may mount only **one** `Filter.Dialog`: it binds to the shared
  `openDialogState(id)`, so two siblings both open at once. The Facebook filter
  therefore renders its own single dialog holding the date and search views
  instead of reusing `ReportDateFilterView`, which brings its own.
- Facebook cards filter on page and date only. Their page list comes from
  `reportFacebookPages` (pages the plugin already stores), never from a Graph
  API call — this board reads no Facebook Insights and no automation-execution
  data, and a card must not start doing so on its own.
- Exposed modules stay lazy-loaded and wrapped in `Suspense`.
- Routed pages use `h-full`, never `h-dvh`/`h-screen`.
- New user-visible strings go through `useTranslation('frontline')` with keys
  added to both `en` and `mn` gateway-owned locale files; that is a
  repository-level change and must be requested explicitly.
- Ticket tag selectors must go through `SelectTagsTicket`
  (`src/modules/ticket/components/ticket-selects/SelectTagsTicket.tsx`), never
  `TagsSelect.SelectedList` directly — the shared component chains every
  selected tag as a badge with no cap, which is the long-list look the ticket
  UI intentionally avoids in favor of a "Tag +N" count trigger, matching how
  Sales' `DealTagsChip` calls `TagsSelect.Trigger` with `showSelectedTagsOutside={false}`.
- The ticket index favorite control uses selected channel and pipeline query
  loading states for its skeleton. Missing records after those queries settle
  are not loading states; they must leave a valid tickets-only breadcrumb.

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
- Smoke (mail): open a mail conversation and confirm the thread loads the newest
  20 messages with "Show earlier messages" above them when more exist; that a
  message with quoted history shows the `•••` toggle and expands it; that an
  external image is hidden until "Show images" is pressed while an inline image
  from the message's own attachments renders straight away; that a link opens in
  a new tab; and that a reply which the server could not deliver shows the
  failure with a working resend instead of a success toast.
- Smoke (mail sending): with a Cloudflare account connected, open Integrations
  config and confirm the card names the domain replies leave through and shows the
  quota underneath. Break it by revoking the token's Email Sending permission and
  running *Update worker*: the card must say sending is inactive, name the step
  that failed, and keep reporting the inbound connection as healthy.
- Smoke (mail add wizard): add a mail inbox and confirm each step gates the next —
  step 1 will not advance without a name and a brand, and Create is only enabled
  once `mailSendingReadiness` reports `ready`. Step 3 must name the domain replies
  leave from. Unset the deployment's `MAIL_SENDING_ACCOUNT_ID` on a workspace with
  no Cloudflare connection: step 3 must block with the reason and a link to
  Integrations config instead of offering a credentials form. The done step names
  both the forwarding address and where replies will leave from.
- Smoke (mail delivery check): open a mail integration's edit dialog, press
  "Check connection", and confirm a healthy deployment reports success with the
  tenant and endpoint, while an unset `MAIL_WORKER_URL` or a wrong
  `MAIL_WEBHOOK_SECRET` reports the failure inline instead of a success state.
- Smoke: in the automation builder attach a Facebook message action to a
  `frontline:facebook.comments` trigger and confirm the sequence header shows
  the single-message notice and every "Add …" button is disabled once one
  message exists; attach the same action to a `frontline:facebook.messages`
  trigger and confirm five messages are still allowed.
- Smoke: with `CALLPRO_ENABLED` off, the channel integrations list must not show
  the Call Pro card. With it on, add a Call Pro line (name, phone number, record
  URL, brand), confirm the dialog shows the webhook URL to point the PBX at, and
  open a Call Pro conversation — the recording plays, and a conversation with
  several candidates shows the picker until a customer is chosen, after which
  the picker is replaced by the confirm/switch control without a reload.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-28` — The domain picker is searchable and says which domains are usable

- **Summary:** The Cloudflare domain field was a plain `Select` listing every zone
  a token reached, which on an account with hundreds of domains is unusable — and
  a domain already carrying another provider's MX only failed after Connect. It is
  now a `Combobox` + `Command` with search, matching how the rest of the plugin
  picks from many. Ineligible zones stay listed but disabled, with the server's
  short reason under the name: shown rather than hidden, so nobody wonders why
  their domain is missing. The server returns usable domains first.
- **Affected areas:**
  `src/modules/integrations/mail/components/MailConfigUpdate.tsx`,
  `src/modules/integrations/mail/graphql/queries/mailCloudflareQueries.ts`,
  `src/modules/integrations/mail/hooks/useMailCloudflareSetup.tsx`,
  `backend/gateway/src/locales/{en,mn}/frontline.json`.
- **Contracts changed:** reads `eligible` and `reason` from `mailCloudflareZones`.

### `2026-08-28` — A sent message shows who sent it, not who received it

- **Summary:** `MailConversationDetail` took the first recipient as the "sender"
  of an outbound message, so a reply was titled with the customer's address while
  the `to:` line underneath repeated it and the agent-side sender never appeared —
  including the `senderName` an inbox now sets. The avatar colour and initial came
  from the same recipient, so every bubble in a thread looked alike. The header now
  always reads `mailData.from`, which makes outbound and inbound symmetric and
  gives agent messages their own avatar.
- **Affected areas:**
  `src/modules/integrations/mail/components/MailConversationDetail.tsx`.
- **Contracts changed:** None.

### `2026-08-27` — The mail config section says what connecting actually does

- **Summary:** The Integrations config panel was titled `Email`, taken from the
  shared `INTEGRATIONS[MAIL].name` that also labels the integration list and the
  channel chips, so it read as the channel rather than as what the panel does. It
  now carries its own title, **Bring your own Cloudflare Email Routing & Sending**,
  while the logo still comes from the shared constant. The trigger wraps instead
  of clipping the longer title.
- **Affected areas:**
  `src/modules/integrations/mail/components/MailConfigUpdate.tsx`,
  `backend/gateway/src/locales/{en,mn}/frontline.json`.
- **Contracts changed:** None.

### `2026-08-27` — The basics step takes a sender name and previews it

- **Summary:** The add wizard's **first** step and the edit dialog now carry a
  `senderName` field, and both render a `Name <address>` preview of what a
  recipient sees. It sits next to the inbox name it defaults from, and on step 1
  rather than the sending step because that step falls back to
  `MailSendingRequired` when nothing can sign yet — which put the field out of
  reach exactly when an inbox was being created. Left empty the inbox name is
  used, which is the previous behaviour. The `sender-name*` labels were missing
  from the locale files, so the field had been rendering its raw key.
- **Affected areas:**
  `src/modules/integrations/mail/components/{MailIntegrationForm,MailIntegrationDetail}.tsx`,
  `backend/gateway/src/locales/{en,mn}/frontline.json`.
- **Contracts changed:** sends `data.senderName` on integration create and
  `details.senderName` on edit; reads `senderName` from integration details.

### `2026-08-27` — The Sending domains panel is gone; replies are Cloudflare-only

- **Summary:** Settings → Integrations config no longer carries a Sending domains
  section, and the add-inbox wizard and edit dialog no longer offer a per-inbox
  sender. Replies always leave from the inbox's own address, signed by the
  workspace's connected Cloudflare account or, failing that, the deployment's.
  Step 3 of the wizard became a confirmation naming that domain, and blocks with
  `mailSendingReadiness.cloudflare.reason` plus a link to Integrations config when
  neither account can sign. The SES/SendGrid form, its DNS-record and verification
  UI and the account mutations are deleted.
- **Affected areas:**
  `src/modules/integrations/mail/components/{MailSendingChoice,MailSendingAccountForm,MailSendingAccounts}.tsx`
  and `src/modules/integrations/mail/graphql/mutations/mailSendingMutations.ts`
  deleted; `MailSendingRequired.tsx` reduced to the Cloudflare route;
  `useMailSendingAccounts.tsx` replaced by `hooks/useMailSendingReadiness.tsx`;
  `graphql/queries/mailSendingQueries.ts`, `MailIntegrationForm.tsx`,
  `MailIntegrationDetail.tsx`, `src/pages/IntegrationConfigPage.tsx`.
- **Contracts changed:** stops sending `data.sendingAccountId` /
  `data.sendingAddress` on integration create and edit; stops using
  `mailSendingAccounts`, `mailSendingAccountAdd`, `mailSendingAccountVerify`,
  `mailSendingAccountRemove` and `MailSendingReadiness.accounts`, all of which
  `frontline_api` removed.

### `2026-08-26` — Sidebar selections no longer strand each other

- **Summary:** Selecting a Discord channel and then a team or personal channel
  left `integrationId` set alongside `channelId`, and the two intersect to
  nothing, so the list emptied with no chip explaining why. Every inbox
  navigation selector now writes the whole target through `INBOX_TARGET_KEYS`
  and clears the params it does not own, and a Discord selection finally shows as
  its own removable chip in the filter bar.
- **Affected areas:**
  `src/modules/inbox/conversations/constants/inboxTarget.ts` (new),
  `src/modules/integrations/discord/components/DiscordChannelFilterBar.tsx` (new),
  `src/modules/inbox/channel/components/{PersonalInboxNav,TeamChannelsNav}.tsx`,
  `src/modules/integrations/components/ChooseIntegrationType.tsx`,
  `src/modules/integrations/discord/components/DiscordChannelsNav.tsx`,
  `src/modules/inbox/conversations/components/ConversationsFilter.tsx`.
- **Contracts changed:** None.

### `2026-08-26` — Mail automation surface and the draft card removed

- **Summary:** The mail channel's automation widgets (trigger form and both
  action forms) are gone along with their `AutomationRemoteEntry` registration,
  and so is the reply-draft card in the thread — the backend action that was the
  only thing able to create a draft was removed with them.
- **Affected areas:** `src/widgets/automations/modules/mail/` (deleted),
  `src/widgets/automations/components/AutomationRemoteEntry.tsx`,
  `src/modules/integrations/mail/components/{MailDraftCard.tsx (deleted),MailConversationDetail.tsx}`,
  `src/modules/integrations/mail/hooks/useMailDraft.tsx` (deleted),
  `src/modules/integrations/mail/graphql/{queries/mailQueries,mutations/mailMutations}.ts`,
  `backend/gateway/src/locales/{en,mn}/frontline.json`.
- **Contracts changed:** Stops consuming `mailConversationDraft`,
  `mailDraftSave`, `mailDraftApprove`, `mailDraftRemove` and the
  `mailDraftChanged` subscription; drops the `mail` automation remote entry.
  Removed the five now-unused `draft` translation keys.

### `2026-08-25` — Integration rows show their unread count again

- **Summary:** The inbox navigation now reads `unreadConversationCount` from the
  `integrationsGetUsedTypesByChannel` query it already makes, instead of
  recomputing the figure through a second `conversationCounts` request per
  expanded channel that was rendering blank; a row and its channel row now count
  the same thing.
- **Affected areas:**
  `src/modules/integrations/graphql/queries/getIntegrations.ts`,
  `src/modules/integrations/types/Integration.ts`,
  `src/modules/inbox/conversations/hooks/useConversationCounts.tsx`
  (`useConversationCountsByIntegrationType` narrowed to
  `useAwaitingCountsByIntegrationType`),
  `src/modules/inbox/channel/components/{PersonalInboxNav,TeamChannelsNav}.tsx`.
- **Contracts changed:** None on the API; the by-channel used-types document now
  selects `unreadConversationCount`.

### `2026-08-25` — New conversations reach the open inbox list live

- **Summary:** A conversation created by an incoming message now appears in the
  filtered list without a manual refresh: the client-message subscription is no
  longer rebuilt on every render, its refetch fallback is deduped, and the
  previously unrendered `ConversationRefetch` control now sits in the list
  header so the unread-arrival count is visible and recoverable in one click.
- **Affected areas:**
  `src/modules/inbox/conversations/hooks/useConversations.tsx`,
  `src/modules/inbox/conversations/components/ConversationActions.tsx`.
- **Contracts changed:** None; `useConversations` keeps its signature, and
  passing `options` still overrides the query variables.

### `2026-08-25` — The `Me` inbox group selects like a team channel

- **Summary:** The `Me` group now lists the personal channel as one selectable,
  collapsible channel row carrying its unread badge, so selecting it shows every
  source at once and the integration types underneath still filter down to one,
  matching how a team channel behaves. The row reuses the `personal-channel`
  label so it collides with neither the frontline `Inbox` entry nor Favorites'
  `My inbox`.
- **Affected areas:**
  `src/modules/inbox/channel/components/ChannelNavItem.tsx` (new, shared by both
  nav groups), `src/modules/inbox/channel/components/PersonalInboxNav.tsx`,
  `src/modules/inbox/channel/components/TeamChannelsNav.tsx`,
  `src/modules/inbox/channel/components/UnreadSummary.tsx` (removed; the row
  badge replaces the group-header figure).
- **Contracts changed:** None.
