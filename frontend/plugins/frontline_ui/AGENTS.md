# `frontline_ui` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/frontline_ui`
- **Last synchronized:** `2026-08-06`

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

### `2026-08-05` — Sidebar group actions no longer fold their own group

- **Summary:** Create-channel, create-brand, and the team-inbox sort toggle sit
  in a `NavigationMenuGroup` `actions` slot, which renders inside the group's
  collapsible trigger, so every click on them also collapsed the group. A new
  `NavigationGroupActions` wrapper stops the click at the slot.
- **Affected areas:** `src/modules/NavigationGroupActions.tsx`,
  `src/modules/FrontlineSubGroups.tsx` (Channels and Brands groups),
  `src/modules/inbox/channel/components/TeamChannelsNav.tsx`.
- **Contracts changed:** None — `NavigationGroupActions` is new and internal;
  the sort toggle dropped its own now-redundant `stopPropagation`.

### `2026-08-04` — Counts, members, and triage order in the inbox sidebar

- **Summary:** `Me` and `Team inbox` now read like a triage list: every row
  carries its open count and dims when it has none, sources still awaiting a
  reply get a warning dot, team rows show a member avatar stack, the group
  orders by count or name from a header toggle, and channels with nothing open
  fold behind a "N quiet teams" row.
- **Affected areas:**
  `src/modules/inbox/channel/components/{PersonalInboxNav,TeamChannelsNav,UnreadSummary}.tsx`,
  `src/modules/inbox/channel/states/teamInboxSortState.ts`,
  `src/modules/inbox/conversations/{hooks/useConversationCounts.tsx,graphql/queries/getConversationCounts.ts}`,
  `src/modules/integrations/{components/ChooseIntegrationType.tsx,constants/integrationImages.ts}`,
  `src/modules/FrontlineSubGroups.tsx`, `frontline` locale files.
- **Contracts changed:** `IntegrationTypeItem` gained optional `count` and
  `awaitingCount` props and now renders a kind icon; `PersonalInboxNav` and
  `TeamChannelsNav` render their own `NavigationMenuGroup` instead of expecting
  a caller to wrap them; `ConversationCounts` gained an `$awaitingResponse`
  variable.

### `2026-08-04` — Integration-type tree in the inbox sidebar

- **Summary:** Restructured the inbox navigation so `Me` lists the personal
  channel's integration types and `Team inbox` renders each team channel as a
  collapsible row over the types used inside it, fetched lazily on expand.
- **Affected areas:** `src/modules/FrontlineSubGroups.tsx`,
  `src/modules/inbox/channel/components/{PersonalInboxNav,TeamChannelsNav,ChooseChannel}.tsx`,
  `src/modules/channels/utils/channelScope.ts`,
  `src/modules/integrations/{components/ChooseIntegrationType.tsx,hooks/useUsedIntegrationTypes.tsx,graphql/queries/getIntegrations.ts}`,
  integration add/remove/archive refetch lists.
- **Contracts changed:** `IntegrationTypeItem` gained optional `channelId` and
  `nested` props; new `useUsedIntegrationTypesByChannel` hook and
  `IntegrationsGetUsedTypesByChannel` document.

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

### `2026-08-04` — Split the Facebook post composer into hooks and fields

- **Summary:** `FacebookPostSheet` no longer drills nine props into its form:
  attachment state moved to `useFacebookPostImages`, channel/page loading to
  `useFacebookPostTargets`, and the uploader UI to `FacebookPostImagesField`;
  the message input's dialog-drop guard is now one shared helper.
- **Affected areas:**
  `src/modules/integrations/facebook/components/FacebookPostSheet.tsx`,
  `.../components/FacebookPostImagesField.tsx` (new),
  `.../hooks/useFacebookPostImages.tsx` (new),
  `.../hooks/useFacebookPostTargets.tsx` (new),
  `.../constants/FbPostSchema.ts`,
  `src/modules/inbox/conversations/conversation-detail/components/MessageInput.tsx`
- **Contracts changed:** `None`

### `2026-08-04` — Cap comment-triggered Facebook message actions at one message

- **Summary:** A Facebook message action attached to a comment trigger now
  accepts a single message and explains that the rest of the flow must continue
  behind a button, matching Facebook's one-private-reply-per-comment rule.
- **Affected areas:**
  `src/widgets/automations/modules/facebook/components/action/constants/ReplyMessage.ts`,
  `.../action/context/ReplyMessageProvider.tsx`,
  `.../action/components/replyMessage/MessageSequenceHeader.tsx`,
  `.../action/components/replyMessage/MessageActionForm.tsx`
- **Contracts changed:** `None`
