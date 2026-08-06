# `frontline_ui` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/frontline_ui`
- **Last synchronized:** `2026-08-06`

## Scope

### Owns

- Inbox surfaces: conversation list, conversation detail, message input, and
  the inbox navigation sub-groups.
- Channel settings (list, detail, members, integrations) and channel forms.
- Integration connect/detail UIs for IMAP, Facebook, Instagram, Discord, calls,
  and the erxes messenger.
- Tickets, forms, knowledgebase, and report screens for the frontline plugin.
- Automation widgets exposed under `src/widgets`.

### Does not own

- Any server contract. GraphQL schema, resolvers, and data rules live in
  `frontline_api`.
- Shared primitives — consume `erxes-ui` and `ui-modules`; never fork them or
  import Radix directly.
- Other plugins' modules or state.

## Current Capabilities

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

## Architecture

| Area              | Path                                            | Responsibility                                        |
| ----------------- | ----------------------------------------------- | ----------------------------------------------------- |
| Navigation groups | `src/modules/FrontlineSubGroups.tsx`            | Route-aware sidebar sub-groups for every frontline page |
| Settings routes   | `src/modules/FrontlineSettings.tsx`             | Top-level frontline settings routes and their page chrome |
| Channel picker    | `src/modules/inbox/channel/components/ChooseChannel.tsx` | Scope-filtered channel list bound to the `channelId` query param |
| Inbox nav trees   | `src/modules/inbox/channel/components/{PersonalInboxNav,TeamChannelsNav}.tsx` | The `Me` group and the `Team inbox` group, each rendering its own `NavigationMenuGroup` header |
| Nav header count  | `src/modules/inbox/channel/components/UnreadSummary.tsx` | The "N unread" figure in a group header's actions slot |
| Nav group actions | `src/modules/NavigationGroupActions.tsx`         | Click guard for a `NavigationMenuGroup` `actions` slot |
| Sidebar counts    | `src/modules/inbox/conversations/hooks/useConversationCounts.tsx` | `conversationCounts` reads per integration type inside one channel |
| Live unread       | `src/modules/inbox/channel/hooks/useChannelUnreadUpdates.tsx` | Subscribes to incoming customer messages and refreshes channel unread counts |
| Channel settings  | `src/modules/channels`                          | Channel CRUD, members, GraphQL documents, form schemas |
| Personal channel  | `src/modules/channels/components/settings/personal-channel`, `src/pages/PersonalChannelPage.tsx` | Profile page for the user's private inbox |
| Inbox             | `src/modules/inbox`                             | Conversations, messages, filters, brand picker         |
| Integrations      | `src/modules/integrations`                      | Per-provider connect forms and detail views            |
| Entry config      | `src/config.tsx`                                | Routes and Module Federation exposes                   |

## Contracts

### Provides

- Module Federation exposes declared in `module-federation.config.ts` /
  `src/config.tsx`.
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
- `erxes-ui`: `NavigationMenuGroup`, `Sheet`, `Form`, `Dialog`, `Button`,
  `useQueryState`, `useToast`, hotkey hooks.
- `ui-modules`: `SelectBrand`, `MembersInline`, contacts and structure selects.
- Translations from the `frontline` i18n namespace.

## Data and State

- Apollo Client for all server state; `GET_MY_CHANNELS` backs the inbox
  navigation and is refetched after `ChannelAdd`. `useGetMyChannels` pins
  `sortField: 'name', sortDirection: 1` for every caller, so the list arrives
  ordered and all consumers share one cache entry — do not vary those variables
  per component or the query fans out into several network requests on the
  inbox page.
- `IChannel.scope` is optional — channels created before the field existed
  return no value and must be treated as `team`.
- `GET_MY_CHANNELS` selects `unreadConversationCount` but not
  `conversationCount`; each count costs the API a query per channel, so add one
  to the selection only when a surface actually renders it.
- Jotai atoms for plugin-wide UI state (`channelCreateSheetOpenState`,
  `imapFormSheetAtom`, hotkey scopes); `useQueryState` for URL-backed filters
  such as `channelId`. `Team inbox` has no sort control and holds no sort
  state — the order is whatever `getMyChannels` returns.
- React Hook Form + Zod for every form (`CHANNEL_SCHEMA`, `imapFormSchema`).

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
- New user-visible strings go through `useTranslation('frontline')` with keys
  added to both `en` and `mn` locale files.

## Validation

- `pnpm nx build frontline_ui`
- `npx eslint src/...` on touched files — the project carries pre-existing lint
  errors and TypeScript errors elsewhere, so lint and typecheck the files you
  changed rather than the whole project.
- Smoke: open `/frontline/inbox` and confirm the sidebar shows `Me` then
  `Team inbox`; that `Me` lists the personal channel's integration types with
  their counts and a header total (empty state when there is no personal inbox);
  that expanding a team channel loads its types and clicking one filters the
  conversation list by that channel and type; that clicking the channel row
  itself clears the type filter; that team channels list in name order;
  that quiet channels fold behind the "N quiet teams" row
  and expand when it is clicked; and that creating a channel from `Team inbox`
  adds it to that group without a reload.
- `project.json` defines only `build`, `serve`, and `serve-static` — there is no
  `lint` or `test` target for this project.

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

### `2026-08-04` — Inbox workspace toggle clears its sibling filter

- **Summary:** Switching the inbox workspace tabs now writes both `mine` and
  `unassigned` in one update, so selecting a tab clears the other tab's query
  param and `All` clears both — previously the params only ever accumulated and
  the active tab stuck on the first one selected.
- **Affected areas:**
  `src/modules/inbox/components/InboxWorkspaceToggleGroup.tsx`.
- **Contracts changed:** None — same `mine` / `unassigned` query keys and tab
  values; the component moved from two `useQueryState` calls to one
  `useMultiQueryState`, and the unused route-map `TABS` constant became the tab
  list the group renders from.

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

### `2026-08-04` — Sidebar integration-type list correctness

- **Summary:** Rewrote `ChooseIntegrationTypeContent` to derive its filtered
  list with `useMemo` instead of `useState` + `useEffect`, fixing a hooks-order
  crash (early `loading` return sat before the effect), a render loop caused by
  the effect depending on the hook's `|| []` array identity, and filtering that
  was both overwritten and never rendered; added an empty state.
- **Affected areas:**
  `src/modules/integrations/components/ChooseIntegrationType.tsx`.
- **Contracts changed:** None — the `allowedIntegrationTypes` prop now actually
  filters the rendered list.

### `2026-08-03` — Personal channel settings route

- **Summary:** Added `/settings/frontline/personal-channel` as the profile page
  for the user's private inbox, provisioned lazily by reading
  `GetPersonalChannel`, and removed the scope choice from channel creation.
- **Affected areas:** `src/modules/FrontlineSettings.tsx`,
  `src/modules/FrontlineSettingsNavigation.tsx`, `src/modules/types/FrontlinePaths.ts`,
  `src/modules/channels/components/settings/personal-channel/**`,
  `src/modules/channels/hooks/useGetPersonalChannel.tsx`,
  `src/pages/PersonalChannelPage.tsx`,
  `src/modules/integrations/{components/IntegrationList.tsx,constants/integrations.ts}`.
- **Contracts changed:** `IntegrationList` gained optional `channelId`,
  `integrationTypes`, and `heading` props (all previously derived from the
  `:id` route param, which still acts as the `channelId` fallback).
