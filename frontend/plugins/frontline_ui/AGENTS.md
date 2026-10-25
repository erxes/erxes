# `frontline_ui` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/frontline_ui`
- **Last synchronized:** `2026-10-23`

## Scope

### Owns

- The `frontline` navigation group and settings navigation registered through
  `src/config.tsx`.
- Inbox surfaces: conversation list, conversation detail, message input, the
  inbox navigation sub-groups, response templates, and integration
  configuration screens.
- Channel settings (list, detail, members, integrations) and channel forms.
- The `Move to channel` action on every channel-owned resource: integrations,
  ticket pipelines, forms, surveys and response templates.
- Integration connect/detail UIs for Mail, Facebook, Instagram, Discord, Telegram,
  calls, Call Pro, and the erxes messenger.
- The mail conversation surface: the threaded reader, its compose box, the
  quoted-content toggle, the sandboxed email body renderer, and delivery state
  and resend.
- The mail conversation's AI draft cards: every pending draft an automation left
  for the conversation, each with Send, Edit and Delete.
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
- Surveys UI: per-channel survey management inside channel settings (list, the
  step-based create/edit wizard, archive, remove), the results board and the
  create wizard on the main `frontline/surveys` route, and the composer dialog
  that posts a saved survey into a messenger conversation.
- Knowledge base UI: a topic tree sidebar beside every knowledge base page —
  each topic collapses open to its categories (nested by parent, with article
  counts, actions behind a `...` menu) — and, per topic, the `articles`, `categories` and `kbsettings`
  routes: record tables with inline editing, filters, command bar bulk delete,
  and the topic, category and article drawers. A topic's embed script opens as
  a dialog from its `kbsettings` page.
- Help Center UI: the `/frontline/helpcenter` record table over client portal
  configs, its filter bar and command bar, its inline-editable name cell and its
  website / knowledge base topic / ticket channel / pipeline / status selects,
  and the
  help center drawer (General, Appearance, and — when editing — Embed and
  Domain), which is
  the only place a help center is edited. Its **Forms** card, shown only while the ticket
  switch is on, has its own channel select and a multi-select of that
  channel's forms (`formChannelId` / `formIds`); its **CMS** card multi-selects
  the content CMSes whose posts the site lists as announcements
  (`cmsConfigs`). Both
  tabs read `helpCenterConfig` and write `helpCenterConfigUpdate` — never a
  knowledge base operation.
- Call UI: call index, detail, and statistics pages.
- Report screens for the frontline plugin, including the default chart catalogue
  and the saved charts board built on top of it.
- Automation remote entries under `src/widgets` for facebook, instagram, inbox,
  discord, mail, form, knowledgebase, and ticket — trigger forms, action forms, node
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

- Pipeline → Properties has a **Create form** card: a preview of the rows and
  "Edit layout", which opens the shared `LayoutEditor` drawn like the
  new-ticket sheet (`TicketCreateFormHeader`/`Footer`, chips via
  `TicketLayoutChip`) with a **Fields** side panel
  (`TicketLayoutFieldsPanel`). In the panel the checkbox puts a field on this
  pipeline's form; "Turn on" and the Required switch edit the Settings →
  Properties rules in place (`frontlineTicketSystemFieldEdit` /
  `frontlineTicketFieldEdit`), so nothing needs a page switch; "New property"
  opens `PropertyAddSheet` and places the new field turned on. Fields saved
  with a type the form cannot render are flagged "Unsupported type" and never
  shown. A placed field that Settings → Properties hides on detail
  (`isVisible: false`) gets a "Hidden in detail" badge; the editor never
  changes that rule. Reset clears the layout back to
  `DEFAULT_TICKET_CREATE_LAYOUT`. It is the only card on the page; there is no
  detail selection.
- Tickets sidebar channel and pipeline rows show a hover ⚙ link to their
  settings (channel detail / pipeline General tab), and the new-ticket footer
  shows "Edit form" to the selected pipeline's Properties tab. Both appear
  only when `useCanManageChannels` allows the channel: owner, or the
  channel's `admin` member — the rule `channelUpdate`, `updatePipeline` and
  `removePipeline` enforce.
- The new-ticket sheet renders name, channel/pipeline/status and description
  fixed, and the selected pipeline's `createLayout` rows between them
  (`useTicketCreateLayout`): system chips via `TicketCreateSystemField`,
  properties via `PropertyFormField`. Property logic hides cells; required
  system fields, properties and description block Save with a toast and a red
  ring. Only shown properties are sent as `propertiesData`.
- The conversation header shows a warning badge "+N same email" when other
  customers hold exactly the conversation customer's email (primary or listed).
  Its popover lists them (links to `/contacts/customers?contactId=`) and
  "Review and merge" opens `/contacts/customers?searchValue=<email>`, where
  core's existing merge runs. Nothing is merged automatically.
- AI knowledge source selector (`widgets/automations/modules/knowledgebase`):
  a topic/category tree above the article list. Checking a topic or category
  sends `config.topicIds` / `config.categoryIds` (hand-picked articles move to
  `config.articleIds`) so the source is indexed whole and filtered, including
  articles filed there later; with no rule, articles stay plain source ids.
- Ticket automation forms: **Create ticket** has an attachments (conversation
  media ids) field.
- Ticket and note attachments group by type prefix, so bare conversation types
  (`image`, `audio`, `file`) render like MIME types; audio plays inline. Media
  at an external URL (not `read-file`) — what a customer sent — stays covered
  as "Sent by customer · not reviewed" until someone chooses to show it.

- Telegram setup derives its public address from `REACT_APP_API_URL` and the
  existing `/pl:frontline` gateway route. Local/non-public API addresses require
  an explicit HTTPS tunnel; custom deployments can override the address.
  Existing connections retain their registered callback. Connection names are
  optional and default to the verified bot's name. Create/edit preview the
  generated callback URL. Bot
  health/webhook actions, chat/topic labels, quotes, polls, media, edits,
  observed reactions and safe link cards integrate with the existing inbox.
- Telegram Disconnect remains available after a webhook status failure. It
  reports local deactivation separately from unconfirmed provider cleanup and
  refetches active setup/integration queries; status errors remain inline.
- Integrations config includes a Telegram section with setup instructions and
  links to personal and team inbox settings. Each bot is configured through
  the existing inbox integration sheet; no workspace-wide bot credentials are
  duplicated on the config page.

- The Erxes Messenger Message trigger form has an optional messenger picker
  (`SelectErxesMessenger`, saved as `config.integrationId`); empty means every
  messenger. The trigger node shows the chosen messenger or "All erxes
  messengers".
- Every colour field in the help center drawer and the knowledge base topic
  drawer carries a **Default** reset beside its label, showing the colour it
  would return to and hidden while the field already holds it. The help center
  reads each default from `DEFAULT_HELP_CENTER_STYLES`, so a colour changed by
  hand is always one click from what a new help center ships with.

- The automations widget answers built-in template prerequisites: the
  `templateRequirement` component type resolves `frontline:tickets.status` by
  reusing `TicketStatusPropertyInput`, which asks for the channel, pipeline and
  status together and already clears the ones below when a choice above them
  changes. It reports `{ channelId, pipelineId, status }` upward only once a
  status is picked — there is no separate readiness call, and a half-made
  choice leaves the install closed.

- Polls are split across two routes, mirroring how forms are laid out.
  `frontline/settings/channels/:id/polls` manages the channel's polls: the
  settings breadcrumb resolves to `Channels / <channel> / Polls` and carries the
  `Create poll` button on the right, the sub-header holds only the status/search
- A form can be created from the plugin's own forms page, not only from a
  channel's settings. `frontline/forms` carries a `Create form` button on the
  right of its `PageHeader` (and in the empty state) that opens the same four
  step wizard on `frontline/forms/create`. There is no channel in the URL there,
  so the wizard's General step decides it: `channelId` is required by
  `FORM_GENERAL_CREATE_SCHEMA` when no `formId` param is present, and
  `useFormMutate` reads the picked channel out of the setup state. Cancelling or
  finishing returns to `frontline/forms`; the settings flow
  (`frontline/settings/channels/:id/forms/create`) still returns to the
  channel's forms page.
- The `frontline/forms` sidebar Channels group (`ChooseChannel`), the
  sub-header's channel filter (`FormChannelFilterView`, in place of the shared
  `SelectChannel.FilterView`) and the sidebar Tags group (`ChooseFormTag`,
  under Channels) show a form count next to each entry. Channel names come from
  the `frontlineFormsChannelList` query (`getMyChannels`) through
  `useFormsChannelList` (its rows are `IFormsChannel`), not `GET_MY_CHANNELS`;
  every count comes from `useFormsFilterCounts`, which calls `formsTotalCount`
  with the URL's `channelId`, `tagId`, `status` and `searchValue` and reads its
  `byChannel` and `byTag`. A count never reacts to a pick in its own group, so
  choosing a channel or tag never zeroes the others: channel counts ignore the
  channel and tag picks and follow only status and search; tag counts ignore
  the tag pick and follow channel, status and search. Channel and tag filters
  combine (AND) on the list.
- Tags filter `frontline/forms` only from the sidebar's Tags group; the
  sub-header filter has no tag entry. The group lists non-group
  `frontline:form` tags from `useTags` and toggles the `tagId` query param.
- Form create (`useFormMutate`), remove (`useRemoveForm`), archive/unarchive
  (row action and command bar), the Channel and Tags column edits and channel
  moves (`CHANNEL_RESOURCE_LIST_QUERIES[FORM]`) all refetch `FormsTotalCount`,
  so the counts never need a manual refresh.
- The call widget's dialpad header carries a clear-cache icon button next to
  Pause and Turn off. After a confirm it closes the widget, resets the call
  atoms persisted in `localStorage` (`config:call_integrations`,
  `config:call_enabled_integrations`, `callInfo`,
  `callHistoryId`, `callWidgetPosition`) and reopens the call config picker,
  which unmounts `SipProvider` and stops the SIP user agent.
- The incoming-call popup reads `Incoming call to <integration name>`, naming
  the inbox integration `callAddCustomer` matched for the call's queue, not the
  integration's channel.
- Each call integration row's switch is independent: any number can be on at
  once and turning one on never turns another off. `Call from` in the dialpad
  lists exactly the integrations switched on, labelled by integration name
  (the formatted phone only when the name is empty), and
  picking one makes it `callConfigAtom`. Turning off the selected integration
  moves `Call from` to another switched-on one, or disconnects when none is left.
- Every channel-owned resource row carries a **Move to channel** action:
  integrations, ticket pipelines, forms, surveys and response templates, in the
  `⋮` menu of their list inside `frontline/settings/channels/:id/…` (and on the
  global `/frontline/forms` page). It opens one shared `MoveToChannelDialog`
  showing the current channel, a destination picker that excludes the current
  channel, a confirmation line once a destination is picked, and
  `Cancel` / `Move`. The dialog is always rendered as a sibling of the menu
  content, never inside it, so closing the menu does not unmount it. Forms and
  surveys also move in bulk from their command bar; that button stays disabled
  when the selection spans more than one channel, because one move carries one
  source channel. A successful move toasts, refetches the resource's list
  queries and the channel counters, and clears the selection.
- Surveys are split across two routes, mirroring how forms are laid out.
  `frontline/settings/channels/:id/surveys` manages the channel's surveys: the
  settings breadcrumb resolves to `Channels / <channel> / Surveys` and carries the
  `Create survey` button on the right, the sub-header holds only the status/search
  filters and the record count, and the page renders a `RecordTable` list, the
  per-row results dialog, and a command bar that archives or removes a
  selection. The channel detail page reaches it through the
  `Manage channel surveys` row.
- A survey requested by a client portal user arrives as `pending` and is
  approved from this list. The status filter offers `pending` alongside
  `active` and `archived`, `FormStatus.Badge` renders `pending` as a warning
  clock badge, a `Created by` column names the requester next to a
  `Client portal` badge (falling back to the team member's full name for an
  agent-created survey), and the channel sub-header carries a
  `<n> pending approval` shortcut that filters the list — it reads its own
  `surveyTotalCount` with `status: 'pending'`, so it stays visible under any
  other filter, and is skipped without a `channelId` so the
  `frontline/surveys` page never shows that shortcut. A
  pending row's row menu swaps Archive/Unarchive for `Approve` and `Reject`,
  and the command bar shows an `Approve` button whenever the selection holds a
  pending or rejected survey and a `Reject` button whenever it holds a pending
  one, acting only on those ids. Approving is a `surveyToggleStatus` to
  `active`; rejecting opens `SurveyRejectDialog`, which requires a typed reason
  (capped at `MAX_REJECTION_REASON_LENGTH`, with a live counter) before it
  sends `surveyToggleStatus` to `rejected` with that `reason`. Both refetch the
  list and the counts.
- A rejected request keeps the requester's work instead of deleting it. The
  status filter offers `rejected`, `FormStatus.Badge` renders it as a
  destructive circle-x badge, and a rejected row's menu still offers `Approve`
  (never `Reject`, which the API accepts only from `pending`) so an agent can
  reverse the call, plus `Delete` to clear it. The reason lives on
  `Survey.rejectionReason`; the status cell wraps the badge in a tooltip
  carrying it, and the server drops the field on any later status change, so a
  badge without a tooltip means there is no standing rejection. `Archive`/`Unarchive` stays
  reserved for surveys that have been live.
- Creating and editing a survey is a full-page step wizard on
  `frontline/settings/channels/:id/surveys/create`,
  `frontline/settings/channels/:id/surveys/:surveyId` and
  `frontline/surveys/create`, laid out exactly like the
  form builder: a left panel carrying `IntegrationSteps` (STEP badge, progress
  bar, description) over the current step's fields, a live preview on the right,
  and a `Cancel` / `Previous step` / `Next step` footer whose last step reads
  `Create survey` or `Update survey`. The three steps are **General** (title,
  brand, and a required channel select only on `frontline/surveys/create`),
  **Content** (the survey's steps) and **Confirmation** (duration plus a
  read-only review of every step). Cancelling or finishing returns to the page
  the wizard was opened from: the channel's surveys page or `frontline/surveys`.
- The Content step is where a survey gains questions. Each survey step is an
  `InfoCard.Content` card holding its name, question, attachments, description,
  2–10 unique options and its own multi-answer switch; `Add Step` appends
  another (up to ten), the grip handle reorders them with `@dnd-kit`, and the
  trash button removes one. The name, description, grip and trash appear only once a survey
  has more than one step, so a single-question survey looks unchanged.
- Directly under the question, an `Attachments.Root` / `Uploader` / `Files` /
  `Preview` block from `erxes-ui` uploads files for that question, bound to the
  step's `attachments` field. The uploader hands back a `__typename`-free list,
  the step's Zod schema caps it at `MAX_SURVEY_ATTACHMENTS` (5, matching the
  API), and `surveySetupValuesAtom` maps each file down to `url`, `name`,
  `type` and `size` before it reaches `surveyAdd` / `surveyEdit`, so no Apollo
  metadata leaks into the mutation input.
- Every option row carries a ticket-automation popover
  (`SurveyOptionTicketConfig`): a switch, a vote threshold, and the pipeline and
  status a triggered ticket lands in. The ticket's name is derived by the API
  from the survey title and the option text — there is no field for it. The trigger
  button badges the threshold once armed and turns green once the API reports
  the ticket was already created; that state is read-only in the UI.
- The preview panel renders the wizard's live state through the real
  `MessageSurvey` component, so it shows exactly what a respondent will see, with
  Desktop/Tablet/Mobile width toggles. `MessageSurvey` renders a step's
  attachments under its question — an `image/*` file inline, anything else as a
  paperclip link — so the inbox message and the wizard preview stay identical.
  `frontline/surveys` renders inside the `SurveyView` layout: `SurveyPageHeader`
  (the `Surveys` breadcrumb, its favorite toggle and a `Create survey` button on
  the right), the status/search filters and a card board of aggregated
  `Survey.results` per survey; its empty state links only to the survey
  settings. The header button opens the wizard on `frontline/surveys/create`,
  where the header breadcrumb reads `Surveys / Create survey`. Its sidebar
  carries the same `Channels` group as `frontline/forms` (`ChooseChannel` in
  `FrontlineSubGroups`), which toggles the `channelId` query param; the
  sub-header filter also offers `By Channel` (`SelectChannel.FilterItem`,
  `FilterView` and `FilterBar`, only without a `channelId` prop) on the same
  param. The board and `SurveySubHeader`'s record count filter by it, while the pending-approval
  shortcut still only follows a channel settings page's own channel. A `View`
  control (`SurveysViewControl`, only where `SurveySubHeader` has no
  `channelId` prop) switches between the card board and the `SurveyPageList`
  record table, with its row actions and command bar; the choice persists in
  `surveyViewAtom` (`localStorage` key `surveyView`, default `grid`). Each
  board card is a link to the survey's edit wizard under its channel settings
  (`frontline/settings/channels/:channelId/surveys/:surveyId`).
- Deleting surveys always asks first, like forms: the row menu's red `Delete`
  confirms with `confirm-delete-survey-title` and the command bar's `Delete`
  with `confirm-delete-surveys` (pluralised) through `useConfirm` before
  `surveyRemove` runs.
- In a messenger conversation the composer's survey button opens
  `SendSurveyDialog`, scoped to the conversation integration's `channelId`, which
  posts a saved survey through `surveySendToConversation`.
  `MessageSurvey` then renders the tallies read-only, refreshed by the message
  subscription.
- An expanded team channel lists a `Surveys` row **above** its integration types
  when the channel has open survey conversations; selecting it filters the inbox
  with `withSurvey=true` scoped to that channel. The row and the integration-type
  rows are disjoint — the API keeps survey conversations out of an
  `integrationType`-scoped list.

- Ticket detail actions — Archive/Unarchive, Subscribe/Unsubscribe and Delete —
  live in one `Actions` menu (`ticket-detail/TicketDetailActions.tsx`) in the
  ticket sheet header; the fields row carries no actions. The notification
  ticket view has none of its own — its `Open ticket` button opens that sheet.
  The header's close button sits in a `w-16` strip aligned with the relation
  side tabs, and drops the strip when `hideRelationWidgetSideTabs` is set.
  Those side tabs (ui-modules `RelationWidgetSideTabs`) hold only Customers and
  Companies icons, each opening the side panel's view of the ticket's contacts
  inside the sheet; no relation widgets are listed beside a ticket.
  While one action is in flight the menu and its items stay disabled.
- Ticket detail chips render as labelled field groups, as Sales' deal detail
  chips do: a muted label segment, then the value and a chevron, e.g.
  `Priority | High ⌄`. A ticket select's root and `FormItem` take `label`,
  and `SelectTriggerTicket` and `SelectDateTicket` draw the chip (erxes-ui
  `Combobox.ChipTrigger`, shared with Sales) only for the `detail` and `form`
  variants with a label — every other variant and unlabelled caller keeps its
  plain trigger. Every ticket detail chip, status included, and every add
  ticket form chip is labelled; other `FormItem` callers stay unlabelled.
  Branch and department show `None` rather than repeating their label.
- Ticket start/target dates follow Sales' `DateSelectDeal`: every variant's
  popover holds erxes-ui `DatePicker` in `inline` mode (typed input above the
  calendar). The detail chip swaps its chevron for an X that clears the date
  while one is set and the field is editable. Unlike Sales, a past target
  date gets no red styling or `Ended` badge. The picked date shows at once;
  a failed save shows an error toast and, only when it is the latest save,
  rolls back to the last server-confirmed value (the `value` prop, which the
  mutation's cache write keeps current) — an older failed save never undoes
  a newer edit. Clearing sends `null`. Every variant, the add-ticket
  `FormItem` included, closes its popover on any date change and on Enter
  in the typed input (`DateSelectContent` catches Enter in the capture phase,
  since `DatePicker` stops its propagation).
- The ticket channel, pipeline and status selects create inline without leaving
  the page. `useSelectCreate` (`ticket-selects/SelectCreate.tsx`) holds the
  search and the pending name; a `Create new …: "<search>"` item appears
  whenever the search matches no name exactly, and swaps the popover to
  a small form that reuses `ChannelForm` / `CreatePipelineForm` (status reuses
  the settings status sheet's `StatusNameColorField`, which takes the
  caller's `form`, and adds a type field) and selects the new record once its list
  has refetched. Create is on only where `allowCreate` is passed: every
  `FormItem` variant (add ticket, conversation convert, help center drawer,
  pipeline config, automation create-ticket action) and the status select's
  root (ticket detail, card, table). Pipeline needs a channel, status a
  pipeline, and the status option also `ticketStatusesManage`. No create
  option shows while the select's list query is loading or has failed.
  `SelectStatusTicket.Content` takes both `allowCreate` and the report filter's
  `onClear` ("All Statuses"); filters pass `onClear` only, never `allowCreate`.
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
- The erxes messenger setup wizard's Settings step (`EMSettings.tsx`) carries
  an **In-app view** switch bound to `isSupportInAppView` in
  `EM_SETTINGS_SCHEMA`. `EMStateValues.ts` emits it on
  `messengerData.isSupportInAppView` through `integrationsSaveMessengerConfigs`
  and `EMSetupSetAtom.ts` reads it back for the edit flow; the API input field
  must exist for the save to succeed. There is no "notify customer" switch:
  messenger replies are never emailed, so `notifyCustomer` was removed from
  the UI and the `IntegrationMessengerData` input.
- The messenger save mutations (`SAVE_EM_CONFIGS_MUTATION`,
  `SAVE_EM_APPEARANCE_MUTATION`) send only `_id`, `brandId` and their payload.
  The channel goes through `integrationsCreateMessengerIntegration` /
  `integrationsEditMessengerIntegration`, which `useCreateMessenger` and
  `useEditMessenger` run first.
- The erxes messenger Appearance step (`EMAppearance.tsx`) edits `uiOptions`:
  colours, logos, hero style, navigation bar, and an `isSupportInAppView`
  switch (default off).
- Registers navigation, settings navigation, relation widgets, property inputs,
  and activity rows with the host via `CONFIG` in `src/config.tsx`.
- The conversation header carries a **Convert** menu. Each entry opens
  `ConvertDialog`, a centred dialog laid out like the 1.x convert modal: the
  target fields (ticket: channel → pipeline → status; deal: board → pipeline →
  stage), then name, assigned to, branch and department (single for a ticket,
  multiple for a deal), attachments, description and the Settings → Properties
  fields. A conversation converts to a ticket or a deal only; there is no task
  target, because operation's own `tasks` relation widget in the conversation
  sidebar creates and lists related tasks. Saving calls
  `conversationConvertToCard`; once a kind exists the entry becomes
  `Go to a …` and navigates to the item's URL.
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
- A `Personal channel` settings route (`/frontline/settings/personal-channel`)
  acting as the profile for the user's private inbox: name, icon, description,
  and its integrations — the same catalogue a team channel offers. Opening it is
  what provisions the channel — there is no create button anywhere for personal
  channels.
- Channel member management, integration attachment, and per-channel forms,
  pipelines, and response templates.
- Renders plugin-specific automation trigger/action forms selected by node type
  in each module's `*RemoteEntry.tsx`.
- The **Form submitted** trigger form (`widgets/automations/modules/form`)
  picks a channel, then a form from that channel, then optional field
  condition rows (field · operator · value) joined by Match all / Match any.
  Operators come from `ui-modules` `AUTOMATION_CONDITION_OPERATORS`; a field
  with options offers them as the value, and unary operators hide the value.
  Changing the channel or form clears the rows, because field ids belong to
  one form.
  The form's answers appear in the builder's Variables panel as **Form
  answers**, which `frontline_api` lists from the saved trigger config; no UI
  code here builds them.
  In execution history the run's name links to the form's submissions
  (`/frontline/forms/submissions/:formId`), the customer and the
  conversation (`FormHistoryName`).
- The Create ticket action's Priority, Assignee and placement can be made
  conditional: rows of conditions each with their own value, plus an Otherwise.
  Placement (channel, pipeline, status) is one conditional over all three keys,
  rendered by `TicketPlacementFields` for the plain value and every rule, so a
  rule never pairs a status with another pipeline. The field
  then stores a `<< cond:<id> >>` token; the rules live in the config's
  `_conditionals`, are kept by the automations host and are decided by the
  engine before `frontline_api` receives the config.
- The mail module's `Email Received` trigger form filters by inbox (a checklist
  of `mailInboxes`, which lists only inboxes in channels the user can see;
  hidden inboxes already selected by someone else stay selected), sender addresses, subject keywords and body keywords, and
  can opt in to unverified senders. `Send Email` and `Draft Email Reply` share
  one reply form: an optional subject, the message as a `PlaceholderInput`
  expression (typically an AI Agent output), and whether to resolve the
  conversation once sent.
- A mail conversation lists each AI draft under the thread, labelled with the
  sender and time of the mail it answers. Send delivers it and reports the real
  delivery outcome; Edit swaps the card for a subject field and an editable body
  validated as non-empty; Delete asks for confirmation. Drafts appear and vanish
  live through `mailDraftChanged`, and a skeleton stands in while the first
  load is in flight. Draft mutations update the Apollo cache instead of
  refetching the list (Save writes the returned subject, body and status;
  Send and Delete evict the draft), so the subscription's refetch is the only
  one.
- The Facebook message trigger reads without opening anything: each condition
  card shows what it currently listens for, and the bot picker shows each bot's
  page and health, refusing a broken one.
- The Facebook comment trigger names the other automations answering the same
  post scope on that bot, since two of them post two public replies under one
  post. A new one starts on first-level comments only; a saved one keeps
  whatever it had.
- Names, on the Facebook message trigger form, which other automations already
  listen for the same Get Started, persistent menu item, ice breaker, keyword or
  keyword-less direct message on that bot. Any claim — draft included, since a
  draft becomes active later and nobody watches for that moment — stops the
  condition from being selected, unless this automation already selected it,
  which stays editable. A condition that owns a configuration also cannot be
  turned on while that configuration is empty. Only Get Started is unopenable,
  because it is the one condition with nothing to configure.
- Configures a Facebook bot's ice breakers — the questions Messenger shows under
  “Tap to send” before the first message — and the Get Started button's label,
  both previewed and both usable as automation trigger conditions.
- Previews a Facebook bot beside its form: a Messenger frame showing the
  welcome screen (greeting plus Get Started) and the persistent menu exactly as
  `connectBotPageMessenger` composes it, on a phone or the desktop chat window,
  including the Get Started action the backend prepends, and flagging menu items
  that never reach Facebook. Tapping a menu action in the preview names what it
  actually does — opens a webview, hands off to a person, resumes a paused step,
  starts a listed automation, or reaches nothing. Only a plain button menu item
  can be listened for; a link, a human handoff and a back action are each
  consumed before the trigger. Typing in the preview's composer resolves the
  same way for direct messages, mirroring `checkContentConditions`. When nothing
  listens, the preview links to a new automation already carrying the trigger
  condition that would catch that exact tap or message, plus an empty Send
  Facebook Message action wired to it. A menu item or ice breaker added since
  the last save is marked unsaved and offers no link, because a trigger
  condition addresses it by an id that does not exist yet.
- Lists the automations already listening to a bot on the bot form itself,
  matched by `botId` inside a `frontline:facebook.messages` trigger config.
- Starts an automation from a saved bot: the bot sheet links to the automation
  builder with a `frontline:facebook.messages` trigger already carrying that
  `botId`, built through `buildAutomationSeedLink` from `ui-modules`.
- Attaches a Facebook Messenger bot to an integration from the integration list
  itself: a `Bot` column on the facebook-messenger table and a bot section in the
  integration edit dialog, both showing the bot's name and health, and both
  opening the bot form with that integration's account and page already bound.
  The bots settings sheet shows that same form for a saved bot, and keeps the
  account/page steps only for creating one.
- The Facebook comment reply action holds a set of reply variants and one is
  picked at random per comment; a single variant is warned about, because Meta's
  Spam policy restricts pages "posting repetitive content" regardless of rate.
  Public replies are paced through an outbox so a page sends at most a set
  number a minute, and paused on the bot for hours after Facebook refuses one;
  a paused reply waits the window out and is only dropped once it is a day old.
  History reports the queue, the wait, the expiry and which variant went out. Private replies are never paced. The bot form reports its
  Public replies are also capped per post, paced through an outbox so a page
  sends at most a set number a minute, and paused on the bot for hours after
  Facebook refuses one. History reports the queue, the skip, the pause and which
  variant went out. Private replies are never paced. The bot form reports its
  own health: the breaker's pause, the last error, and how many replies are
  queued, sent and failed for that page.
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
- The Facebook and Instagram connect dialogs show a `Reconnect` badge, with
  the Graph error in its tooltip, on an account whose pages cannot be read,
  instead of a page count. The Instagram dialog shows this only on the selected
  account row.
- The page step of the Facebook connect dialog names, at the end of each page
  row in use, its channel and integration; the trigger opens a popover with
  the channel, integration, bot (with health) and the automations listening to
  that bot (`FacebookPageUsage`), and a `Manage integration` link to the
  holder's channel integrations page. These links open in a new tab so the
  wizard keeps its progress. Used pages stay enabled `Command.Item`s (so search
  filters them and the trigger is clickable) and refuse selection in
  `onSelect`. The Instagram page step names
  the channel and integration of a page in use.
- The channel list's integrations cell opens a popover
  (`ChannelIntegrationsPeek`, query `ChannelIntegrationsPeek`) listing every
  integration of that channel with kind, Facebook page names and health —
  broken first, archived last — plus a Repair button on broken rows and the
  full row action menu, without leaving the list.
- The erxes Messenger setup keeps its six steps; their labelled progress
  segments jump to any step (`IntegrationSteps` `onStepClick`), and an edit can
  be saved from every step (`useEMEditSave`). The Config step puts name and
  brand on top and Bot / Ticket / Knowledge base in tabs: Bot lists the
  automations whose `frontline:inbox.messages` trigger names this integration
  and opens a seeded builder in a new tab; Ticket and Knowledge base create a
  ticket config or topic in place when none exists, then select it.
- The messenger setup preview walks the widget's ticket flow over the picked
  configs (`EMPreviewTicketFlow`): start, choose a config when there are
  several, then its form with the config's labels, placeholders and required
  marks. Submit stays disabled; the preview sends nothing.
- Facebook pages show as `FacebookPageLink` (avatar from the public Graph
  picture URL, name, opens `facebook.com/<pageId>` in a new tab): the `Page`
  first column of the Facebook messenger/post integration tables, the channel peek,
  and the bot preview's Messenger header (`MessengerFrame` `pageUrl`). Page
  names come from the integration's `facebookPage` (page token, not the shared
  app quota); a page whose token is dead shows no name.
- The inbox composer is note-only (Reply tab disabled, Internal Note selected)
  for `lead`, `calls`, `callpro` and `mail` conversations — the first three
  cannot carry an outbound reply, and mail replies go through the mail compose
  box. The list lives in `NOTE_ONLY_INTEGRATION_KINDS` in
  `conversation-detail/constants/composer.ts`.
- The ticket list/board filter offers Branch and Department multi-selects
  (`SelectBranches` / `SelectDepartments` from `ui-modules`) bound to the
  `branchIds` / `departmentIds` query params, which `useTicketsVariables` sends
  as `ITicketFilter.branchIds` / `departmentIds`.
- Ticket detail and the ticket table edit the single `branchId` /
  `departmentId` through `SelectBranchTicket` / `SelectDepartmentTicket` with
  an `id`; detail gates them by `canEditTicket` like its other fields.
- The same filter carries the shared `PropertiesFilter` from `ui-modules`
  scoped to `frontline:ticket`; its `propertiesData` query param is sent
  unchanged as `ITicketFilter.propertiesData`.
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
- The ticket note composer (`NoteInput`) opens with the inbox's own **Reply |
  Internal Note** segment tabs (`ComposerModeTabs`) and starts on Internal Note.
  A hint line under the tabs says who will read the message: internal notes are
  "Only visible to your team"; a reply names the customer address and the
  pipeline address it will be emailed from (`mailTicketReplyTarget`), warns when
  the ticket has no customer email, and otherwise says the customer sees it in
  the client portal. Internal mode tints the composer and its **Add note**
  button with the warning colour; reply mode sends with **Send**. Each note in
  the ticket timeline carries a badge from `getNoteKind`: Internal Note (warning
  tint), Received by email, Sent from the client portal, Emailed to
  `<recipient>`, or Visible to the customer. A mailed note shows its delivery
  state beside that badge — Sending…, Not delivered with the transport error,
  or Bounced with the rejected recipients — and a failed or bounced card gets
  a destructive border; the composer also raises a destructive toast when the
  reply it just saved was not delivered. When `mailDelivery.canRetry` is true —
  a failed send, or one stuck sending for over ten minutes — the card offers
  **Try again** (`useRetryTicketNoteMail` → `mailTicketNoteRetry`) with a hint
  chosen from `retryable`; the mutation returns the note, so the card updates
  from the Apollo cache. Bounced mail gets no retry, since the same address
  would bounce again. A note with no text renders no text block, and the
  composer sends an attachment-only note with empty `content` (never `"[]"`,
  which the read-only editor printed literally); `hasNoteText` also hides the
  `"[]"` of notes saved before. An inbound attachment the server could not
  store is listed under the note from `unsavedAttachments` as a warning row:
  it opens the mail worker's temporary link while `expiresAt` is in the future
  ("Not saved · the link works for N more days") and otherwise shows the
  translated `attachment-unavailable` text without a link. A note that came in
  by email (`getNoteKind` → `emailReceived`) renders through the inbox's
  sandboxed `EmailBody` iframe instead of `BlockEditorReadOnly`, so mail CSS
  stays inside the frame, remote images and tracking pixels wait for "Show
  images", links open in a new tab, and storage-key images resolve through
  `readImage`; `storageImageSources` marks those keys, plus the note's
  attachments, as trusted so a signature logo is not blocked.
- The Ticket List report card's trailing settings icon is the
  `RecordTable.ColumnSelector`: it toggles, reorders and pins columns for
  name, number, created, status, state, priority, assigned, created by,
  channel, pipeline, tags, branch, department, start date, due date, and one
  read-only column per `frontline:ticket` property field. The choice persists
  per browser under the `frontline_ticket_report_record_table` table id.
- The Ticket List card's Excel download exports exactly the columns currently
  visible in its table, in their on-screen order and with the same headers,
  including property columns. It is disabled until the table has rendered.
- GraphQL codegen (`client-preset`) validates every GraphQL document against
  the composed gateway schema and generates result and variable types
  into `src/gql/`.
- Mail documents, including provider setup and pipeline mail settings, use
  `gql()` from `~/gql`. Thread, draft, sender, connection, zone, quota and
  readiness response types derive from generated operation selections.
- The report module is typed from the schema: its documents, and the call
  report documents it reads from `integrations/call/graphql/queries/`
  (`callStatistics.ts`, `callHistoryList.ts`), are `gql()` documents, and its
  hooks and response types come from the generated query types.

## Architecture

Telegram setup and provider-specific presentation live in
`src/modules/integrations/telegram/`. It reuses `ComposerShell`, `ComposerEditor`,
`ComposerToolbar`, `useComposerSend`, `messageReplyState` and `MessageAttachments`.
Composer components live in `conversation-detail/components/composer/` and
their hooks in `conversation-detail/hooks/composer/`. `MessageInput` composes
the shared draft, attachment, gallery and send hooks; Telegram keeps its
provider flags at those existing entry points.
`TelegramMessageAttachments.tsx` only adds the Cloudflare Stream player and
media open links; native audio/video/image/file rendering remains shared within
Frontline. No separate Telegram editor or reply atom is needed.
`TelegramConfig.tsx` provides the Integrations config entry and links to the
existing personal/team inbox routes, where `TelegramIntegrationDetail.tsx`
owns the setup form and connection actions.

| Area                      | Path                                                                                                                                              | Responsibility                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| App sidebar               | `frontend/plugins/frontline_ui/src/Sidebar.tsx`                                                                                                   | `FrontlineSidebar` (app sidebar) and `FrontlineSidebarFooter` (Settings link), rendered by the `./frontline` entry through `AppLayout`          |
| Host registration         | `src/config.tsx`                                                                                                                                  | `CONFIG` — navigation, settings, widgets, property inputs, routes, and Module Federation exposes                                                |
| Federation                | `module-federation.config.ts`                                                                                                                     | Remote name `frontline_ui` and its exposes                                                                                                      |
| GraphQL codegen           | `codegen.ts`                                                                                                                                      | Generates `src/gql/` (gitignored) from the composed gateway schema                                                                              |
| Routes                    | `src/modules/FrontlineMain.tsx`, `src/pages/`                                                                                                     | Routed pages for inbox, ticket, forms, call, channels                                                                                           |
| Navigation groups         | `src/modules/FrontlineSubGroups.tsx`                                                                                                              | Route-aware sidebar sub-groups for every frontline page                                                                                         |
| Report navigation         | `src/modules/report/constants/reportSections.ts`                                                                                                  | Report board paths, labels, icons and path matching shared by `ReportIndexPage`, which renders the boards as header tabs                        |
| Settings routes           | `src/modules/FrontlineSettings.tsx`                                                                                                               | Top-level frontline settings routes and their page chrome                                                                                       |
| Channel picker            | `src/modules/inbox/channel/components/ChooseChannel.tsx`                                                                                          | Scope-filtered channel list bound to the `channelId` query param                                                                                |
| Move to channel           | `src/modules/channels/components/move-resources/{MoveToChannelDialog,MoveToChannelCommandBarButton}.tsx`                                          | The shared move dialog and its command-bar trigger, used by every channel-owned resource list                                                   |
| Move to channel mutation  | `src/modules/channels/hooks/useChannelMoveResources.tsx`                                                                                          | `channelMoveResources` plus the per-resource list of queries a move refetches                                                                   |
| Inbox nav trees           | `src/modules/inbox/channel/components/{PersonalInboxNav,TeamChannelsNav}.tsx`                                                                     | The `Me` group and the `Team inbox` group, each rendering its own `NavigationMenuGroup` header                                                  |
| Channel nav row           | `src/modules/inbox/channel/components/ChannelNavItem.tsx`                                                                                         | The shared selectable, collapsible channel row both inbox nav groups render                                                                     |
| Nav group actions         | `src/modules/NavigationGroupActions.tsx`                                                                                                          | Click guard for a `NavigationMenuGroup` `actions` slot                                                                                          |
| Sidebar counts            | `src/modules/inbox/conversations/hooks/useConversationCounts.tsx`                                                                                 | Filter counts, plus the awaiting-reply figure per integration type inside one channel                                                           |
| Live unread               | `src/modules/inbox/channel/hooks/useChannelUnreadUpdates.tsx`                                                                                     | Subscribes to incoming customer messages and refreshes channel unread counts                                                                    |
| Channel settings          | `src/modules/channels`                                                                                                                            | Channel CRUD, members, GraphQL documents, form schemas                                                                                          |
| Personal channel          | `src/modules/channels/components/settings/personal-channel`, `src/pages/PersonalChannelPage.tsx`                                                  | Profile page for the user's private inbox                                                                                                       |
| Inbox                     | `src/modules/inbox/`                                                                                                                              | Conversations, messages, filters, channels, brands, integrations                                                                                |
| Conversation convert      | `src/modules/inbox/conversations/conversation-detail/components/convert/`                                                                         | Convert menu, convert dialog, convert-time properties                                                                                           |
| Integrations              | `src/modules/integrations/`                                                                                                                       | Per-provider connect forms and detail views                                                                                                     |
| Call Pro                  | `src/modules/integrations/callpro/`                                                                                                               | Add/edit sheets over one shared `CallProIntegrationForm`, webhook URL hint, recording player, and the caller-to-customer picker                 |
| Ticket                    | `src/modules/ticket/`, `src/modules/pipelines/`, `src/modules/status/`                                                                            | Ticket boards, pipelines, statuses                                                                                                              |
| Ticket notes              | `src/modules/activity/components/{NoteInput,NoteInputToolbar,NoteAudienceHint,NoteInputReadOnly}.tsx`, `src/modules/activity/utils/noteKind.ts`   | Ticket composer with reply/internal tabs and audience hint, and the timeline note card with its kind badge                                      |
| Composer mode tabs        | `src/modules/inbox/conversations/conversation-detail/components/ComposerModeTabs.tsx`                                                             | The Reply / Internal Note segment tabs shared by the inbox `ComposerShell` and the ticket `NoteInput`                                           |
| Forms                     | `src/modules/forms/`                                                                                                                              | Form builder, preview, submissions                                                                                                              |
| Help Center               | `src/modules/helpcenter/`, `src/pages/HelpCenterIndexPage.tsx`                                                                                    | `/frontline/helpcenter` — the help center record table (columns, more column, filter, total count, command bar) and the `editId` drawer over it |
| Surveys management        | `src/modules/survey/components/survey-page/`, `src/pages/ChannelSurveysPage.tsx`                                                                  | Channel-scoped list, results dialog, command bar, create button, detail breadcrumb                                                              |
| Survey wizard             | `src/modules/survey/components/{SurveyCreate,SurveyEdit}.tsx`, `src/modules/survey/components/mutate/`, `src/pages/Survey{Create,Detail}Page.tsx` | Three-step create/edit flow, `Add Step` builder, live preview                                                                                   |
| Survey ticket automation  | `src/modules/survey/components/mutate/SurveyOptionTicketConfig.tsx`                                                                               | Per-option threshold, pipeline and status picker for automatic ticket creation                                                                  |
| Survey wizard state       | `src/modules/survey/states/surveySetupStates.tsx`, `src/modules/survey/constants/surveySetup*.ts`, `src/modules/survey/hooks/useSurveyMutate.ts`  | Per-step Jotai atoms, wizard Zod schemas and defaults, add/edit submit                                                                          |
| Surveys channel row       | `src/modules/channels/components/settings/channel-details/SurveysSection.tsx`                                                                     | `Manage channel surveys` row on the channel detail page                                                                                         |
| Surveys results           | `src/modules/survey/components/survey-results/`, `src/pages/SurveysIndexPage.tsx`                                                                 | Read-only aggregated results board on `frontline/surveys`                                                                                       |
| Surveys data              | `src/modules/survey/{graphql,hooks,types}/`                                                                                                       | Survey GraphQL documents, list/detail/mutation hooks, survey types                                                                              |
| Send survey               | `src/modules/inbox/conversations/conversation-detail/components/SendSurveyDialog.tsx`                                                             | Picks an active survey and posts it into the open messenger conversation                                                                        |
| Message copy actions      | `src/modules/inbox/conversation-messages/components/{MessageCopyActions,MessageCopyAction,CopyTextAction}.tsx`                                    | Copy text/attachment actions; Instagram images fall back to `frontlineInstagramCopyImage` via `useCopyMessageImage`                             |
| Instagram error feedback  | `src/modules/integrations/instagram/utils/`                                                                                                       | `instagramErrorFeedback` rule matcher shared by send and reaction toasts                                                                        |
| Cursor list adapter       | `src/modules/shared/utils/cursorList.ts`                                                                                                          | `toCursorPageInfo`, `compactList`, `mergeCursorList` for cursor lists typed from the schema                                                     |
| JSON narrowing            | `src/modules/shared/utils/isRecord.ts`                                                                                                            | `isRecord` type guard for `JSON` outputs that stay untyped                                                                                      |
| Survey inbox row          | `src/modules/survey/components/ChannelSurveyNavItem.tsx`                                                                                          | `Surveys` row inside an expanded team channel, filtering the inbox by `withSurvey`                                                              |
| Knowledge base routes     | `src/modules/knowledgebase/Main.tsx`, `src/pages/knowledgebase/`                                                                                  | `/frontline/knowledgebase` (redirects to the first topic, or an empty state) plus `:topicId/{articles,categories,kbsettings}`                   |
| Knowledge base shell      | `src/modules/knowledgebase/shared/`                                                                                                               | Layout, record table, form sheet, row actions, bulk delete, filters, columns, feedback hooks, states, appearance fields, embed panel            |
| Knowledge base sidebar    | `src/modules/knowledgebase/sidebar/`                                                                                                              | Topic tree with collapsible categories, hover row actions, route/open-state/prefetch hooks, open-topic atom, topic/category drawers             |
| Knowledge base topics     | `src/modules/knowledgebase/topics/`                                                                                                               | Index redirect/empty state, topic drawer and form fields, list/options/mutation hooks                                                           |
| Knowledge base categories | `src/modules/knowledgebase/categories/`                                                                                                           | Topic-scoped category tree table, drawer, command bar, mutation hooks                                                                           |
| Knowledge base articles   | `src/modules/knowledgebase/articles/`                                                                                                             | Topic-scoped article table, filters, drawer (scheduling, move topic), duplicate, bulk status/category, hooks                                    |
| Knowledge base data       | `src/modules/knowledgebase/{graphql,types,constants,utils}/`                                                                                      | `frontlineKb*` operations, local KB types, icons/reactions/languages, table ids, embed builder                                                  |
| Automation widgets        | `src/widgets/automations/modules/<module>/`                                                                                                       | Per-module trigger/action/bot/history components                                                                                                |
| Mail automation           | `src/widgets/automations/modules/mail/`                                                                                                           | Email Received trigger form with inbox checklist, shared Send Email / Draft Email Reply form                                                    |
| FB message action         | `src/widgets/automations/modules/facebook/components/action/`                                                                                     | Message sequence form, provider, constants, states                                                                                              |
| FB post composer          | `src/modules/integrations/facebook/components/FacebookPostSheet.tsx`, `FacebookPostImagesField.tsx`, `hooks/useFacebookPost*.tsx`                 | Post sheet, image upload state, channel/page loading                                                                                            |
| Call report filters       | `src/modules/report/call/components/{SubHeader,DateTimeRangeDialog}.tsx`, `src/modules/report/utils/dateFilters.ts`                               | Integration/queue/direction chips, date presets, and the date+time custom range                                                                 |
| Call report export        | `src/modules/report/call/heatmapExcel.ts`, `src/modules/report/call/hooks/useHeatmapExport.ts`                                                    | Date × hour spreadsheet of the heatmap, built with `ExcelJS` and handed to `downloadExcel`                                                      |
| Call report tables        | `src/modules/report/call/components/{ReportTable,Meter}.tsx`                                                                                      | Shared density wrapper over `erxes-ui` `Table`, plus the proportional bar used inside its cells                                                 |
| Call SLA tab              | `src/modules/report/call/components/SlaSection/`, `hooks/useSlaReport.ts`, `slaExcel.ts`                                                          | Agent and callback-window selectors, SLA KPIs, missed reasons, trend, per-queue table, breach list, Excel export                                |
| Reports board             | `src/modules/report/components/TicketReportsList.tsx`, `src/modules/report/types/component-registry.ts`                                           | Card layout, drag-and-drop, and the default-chart + saved-chart registry                                                                        |
| Saved charts              | `src/modules/report/components/report-chart/`, `src/modules/report/hooks/{useReportCharts,useTicketChartFilterConfig,useTicketChartCard}.ts`      | Save/delete actions, `reportCharts` reads and writes, capturing and restoring a filter selection                                                |
| Mail conversation         | `src/modules/integrations/mail/components/MailConversationDetail.tsx`                                                                             | Thread reader, compose box, delivery badges and resend, quoted-content toggle                                                                   |
| Mail AI drafts            | `src/modules/integrations/mail/components/MailDraft{s,Card,EditForm}.tsx`, `src/modules/integrations/mail/hooks/useMailDrafts.tsx`                | Pending draft list under the thread, per-draft send/edit/delete, `mailDraftChanged` refetch                                                     |
| Mail body                 | `src/modules/integrations/mail/components/EmailBody.tsx`                                                                                          | Sanitised, CSP-locked `srcDoc` iframe with the remote-image gate                                                                                |
| Mail data                 | `src/modules/integrations/mail/{graphql,hooks,states}/`                                                                                           | `mailConversationDetail` window, send and retry mutations, form sheet atom                                                                      |
| Mail provider setup       | `src/modules/integrations/mail/components/MailConfigUpdate.tsx`, `src/modules/integrations/mail/hooks/useMailCloudflare*.tsx`                     | Cloudflare connect form, provisioning step list, outbound state and quota, repair and disconnect                                                |
| Mail add wizard           | `src/modules/integrations/mail/components/MailIntegrationForm.tsx`                                                                                | Four-step `Sheet` wizard over the shared `IntegrationSteps` chrome                                                                              |
| Mail sending readiness    | `src/modules/integrations/mail/components/MailSendingRequired.tsx`, `src/modules/integrations/mail/hooks/useMailSendingReadiness.tsx`             | Names the Cloudflare domain replies leave from, or blocks the wizard's sending step with the reason and a link to Integrations config           |
| Mail delivery check       | `src/modules/integrations/mail/components/MailConnectionCheck.tsx`, `src/modules/integrations/mail/hooks/useMailConnectionCheck.tsx`              | Runs `mailCheckConnection` from the integration dialog and renders its verdict                                                                  |
| Notifications             | `src/widgets/notifications/`                                                                                                                      | Notification remote entries                                                                                                                     |

## Contracts

### Provides

- `widgets.contactWidgets: [{ name: 'ticket' }, { name: 'conversation' }]` with `./contactWidget` (`src/widgets/contact/ContactWidgets.tsx`): Tickets (the contact's tickets from `getTickets` filtered by `customerId` / `companyId`, rows opening `TicketDetailSheet`, `+` opening `AddTicketSheet` with `hideTrigger` and `contacts`, saved on the ticket by `createTicket`; `AddTicketForm` evicts cached `getTickets` lists) and Conversations (a customer's own, from `useConversations({ customerId })`; none for companies) sections of a contact's side panel overview. Tickets keep one customer and one company themselves (`customerId` / `companyId` in `FrontlineTicketFields`); the ticket sheet's rail is given them. The create-ticket automation action configures one `companyId`.
- Routes `frontline/forms` (list), `frontline/forms/create` (builder wizard),
  `frontline/forms/:formId` (builder wizard on an existing form),
  `frontline/forms/submissions/:formId` and `frontline/forms/preview`, all
  registered in `FrontlineMain`; every one but `preview` renders inside the
  `FormView` layout and its `FormPageHeader`.
- Routes `frontline/surveys` (registered in `config.tsx`, `FrontlineNavigation`,
  and `FrontlineMain`) — the survey results board — and
  `frontline/surveys/create` (`FrontlinePaths.SurveyCreate`) — the create
  wizard; both render inside the `SurveyView` layout and its `SurveyPageHeader`.
- Settings route `frontline/settings/channels/:id/surveys` (registered in the
  channels `Settings.tsx` as `FrontlinePaths.ChannelSurveys`) — the channel's
  survey management page — plus `FrontlinePaths.SurveysCreate`
  (`/:id/surveys/create`) and `FrontlinePaths.SurveyDetail` (`/:id/surveys/:surveyId`)
  for the wizard.

- Module Federation exposes declared in `module-federation.config.ts` /
  `src/config.tsx`: `./config`, `./frontline`,
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

- `ui-modules` `AutomationConditionalField` for conditional action values; it
  is a drop-in for `Form.Field` taking the action form, the field names, a label
  and the same `render`. It needs the automations host's
  `AutomationConditionalsProvider`; without it the field stays plain.
- `frontline_api` GraphQL: `GetMyChannels`, `frontlineChannelList`,
  `GetChannel`, `GetPersonalChannel` (get-or-create — reading it provisions
  the channel),
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
- `ui-modules`: `useSidePanel().openRecord` in `ConversationSideWidget`. The
  conversation's right rail (`SideMenu`) holds a customer button, which closes
  any open rail tab and opens the conversation's customer in the app side panel
  (`core:customer`, where its linked records, Tracked data included, are
  shown), and the conversation Properties tab. No relation widgets are rendered
  beside a conversation.
- `ui-modules`: `SelectBrand`, `MembersInline`, `CustomersInline`, contacts and
  structure selects,
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
- `frontline_api` GraphQL `helpCenterConfigs(page, perPage, searchValue,
brandId)` and `helpCenterConfigsTotalCount(searchValue, brandId)`, read
  together as the help center's own `frontlineHelpCenterList` document;
  `helpCenterConfig(_id)` as `frontlineHelpCenterDetail`; and
  `helpCenterConfigUpdate(config)` / `helpCenterConfigRemove(_id)` for every
  write. The help center reads `knowledgeBaseTopics` for one thing only — the
  `Knowledge base topic` picker's options.
- `frontline_api` GraphQL `forms(channelId, status: "active", limit: 100)` as
  `frontlineHelpCenterFormOptions` — the Forms picker's options (`_id`, `name`,
  `title`), read-only, skipped until the Forms card's channel is chosen, and
  `cache-and-network` so a form created elsewhere shows up the next time the
  drawer opens. The API matches `status` literally — a form document written
  without `status` is not listed.
- `core-api` GraphQL `getClientPortals` as `frontlineHelpCenterWebsiteOptions` —
  the `Client portal` picker's options (`_id`, `name`, `domain`, `token`),
  read-only.
  The resolver ignores paging arguments and returns the newest 20 portals.
- `frontline_api` GraphQL `reportCharts`, `reportChartAdd`, and
  `reportChartRemove` — saved report charts. The board reads **all** saved
  charts in one query and filters them to the chart types it can render, and
  both mutations update that same cache entry, so a chart saved from any card
  appears without a refetch or a reload. Do not reintroduce a per-chart-type
  query: the mutation would then write to a different cache entry than the
  board reads. `ReportChartFields` selects every filter key the backend
  persists, including the Facebook card's `pageIds` and `searchValue`; a key
  left out of the fragment is saved but never restored.
- `frontline_api` GraphQL `mailConversationDetail(conversationId!, limit)` —
  returns `{ messages, hasMore }`, the newest `limit` messages oldest-first, not
  a bare list. Each message selects the fields of `MailThreadMessageData`,
  including nested addresses and attachments. `mailSendMail`,
  `mailSendReaction`, `mailMessageRetry` and `mailDraftApprove` select the
  `MailDeliveryOutcome` fields (`_id`, `deliveryStatus`, `deliveryError`,
  `bouncedRecipients`), so the caller
  reads `deliveryStatus` instead of assuming the send worked.
  New mail arrives through `conversationMessageInserted`. An
  attachment the server could not store still carries a `url` — the mail worker's
  own signed link, kept as a fallback — plus an `error` saying why it was not
  re-hosted. The chip therefore stays clickable and puts the reason in its
  tooltip; only an attachment with no link at all falls back to the dimmed state.
  `readImage` returns absolute URLs untouched, so no special handling is needed.
- `frontline_api` GraphQL `mailTicketReplyTarget(ticketId!)` — `{ from, to }`
  for a ticket whose pipeline owns a mail address, `null` otherwise. `to` is
  `null` when the ticket has no customer email. `useTicketReplyTarget` reads it
  `cache-and-network` for the composer's hint line. `ticketGetNote` and
  `ticketCreateNote` also select `mailMessageId`, which `getNoteKind` needs to
  tell a mailed note from a portal-only one, and `mailDelivery { status, error,
to, bouncedRecipients, retryable, canRetry }` for its delivery state;
  `mailTicketNoteRetry(noteId!)` resends a failed or stuck one and returns the
  note. `ticketGetNote` also selects `unsavedAttachments { name, url, type,
  size, error, expiresAt }` for inbound files that never reached storage. `ticketCreateNote` errors
  when a reply cannot be mailed (no customer email, or the workspace cannot
  send); `NoteInput` shows that message in a toast and keeps the draft.
- `frontline_api` GraphQL `mailConversationDrafts(conversationId!)`,
  `mailDraftSave`, `mailDraftApprove` (returns the delivery outcome plus
  `draftId`), `mailDraftRemove`, the subscription `mailDraftChanged`, and
  `mailInboxes` for the trigger's inbox checklist.
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
- `frontline_api` GraphQL `conversationConvertToCard` and
  `conversationConvertedItems` — the conversation Convert menu.
- `ui-modules` `SelectBoard`, `SelectPipeline`, `SelectStage`, `SelectMember`,
  `pluginsConfigState` and `usePermissionCheck` — the deal convert fields and
  the Convert menu's visibility; `useFields`, `PropertyFormField` and
  `isFieldVisibleByLogic` — convert-time properties.
- `react-i18next` with the `frontline` namespace. The ticket note surfaces use
  keys the gateway locales do not carry yet, so they render their inline
  English fallback: `write-a-message`, `add-note`, `ticket-reply-portal-only`,
  `ticket-reply-no-recipient`, `ticket-reply-emailed`, `note-email-received`,
  `note-portal-received`, `note-email-sent`, `note-customer-visible`,
  `note-email-sent-to`, `ticket-reply-not-delivered`,
  `email-delivery-stuck-hint`, `email-delivery-resent` and
  `attachment-not-saved-days`.
- The composed gateway schema from `gateway:schema:compose`, consumed only at codegen time. Runtime requests continue through the published GraphQL contracts.

## Data and State

- Telegram reply selection uses the inbox `messageReplyState`; provider IDs
  come from `extraData.telegram.messageId` or the first outbound `messageIds`
  receipt. The existing conversation-change cleanup and user/conversation
  scoped session drafts apply to Telegram too.

- Apollo Client for all server state; GraphQL documents live next to the feature
  they serve and use `frontline`/module-prefixed operation names.
- `GET_MY_CHANNELS` backs the inbox navigation and is refetched after
  `ChannelAdd`. `useGetMyChannels` pins `sortField: 'name', sortDirection: 1`
  for every caller, so the list arrives ordered and all consumers share one
  cache entry — do not vary those variables per component or the query fans out
  into several network requests on the inbox page.
- `IChannel.scope` is nullable — channels created before the field existed
  return no value and must be treated as `team` (`channelScopeOf`).
- Channel types derive from the generated queries: `IChannel` is the
  `frontlineChannelList` row, `IMyChannel` the `GetMyChannels` row,
  `IChannelDetail` is `getChannel` and `IPersonalChannel` is
  `getPersonalChannel`; detail sections take `IChannelDetail`. Refetch the
  channel list as `frontlineChannelList` after a channel is added, edited or
  removed. `IChannelMember.member` is the core `User` selection; pass it to
  `MembersInline` through `toMemberUser` (`channels/utils/channelMembers`),
  which drops members without an `_id`. The `@/inbox/types/Channel` view type
  accepts a null `icon`; pass `icon ?? undefined` to `IconComponent`.
- The channel pickers search by the `name` variable of `frontlineChannelList`
  and `GetMyChannels`; neither query has a `searchValue` variable.
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
  hotkey scopes); `useQueryState` for URL-backed filters
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
- The help center list is read twice on purpose: `useHelpCenters` applies the
  `searchValue`/`brand` URL filters and owns `helpCenterTotalCountAtom` for the
  filter bar, while `useAllHelpCenters` reads the same document unfiltered so
  `HelpCenterIndexPage` can resolve the one help center `editId` names even when
  the table is narrowed past it. With no filter set both resolve to the same
  variables and Apollo serves one request.

- React Hook Form + Zod for every form (`CHANNEL_SCHEMA`); the
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

- Relation widgets go only through contacts: each lists the records whose
  own `customerId` / `companyId` is the host's customer or company
  (ui-modules `getHostContacts`: the host itself when it is a contact, else
  the first of `customerId(s)` / `companyId(s)` from `IRelationWidgetProps`),
  read with this plugin's own list query, the host left out. "+" creates a
  record with those contacts through its create mutation. No core relation
  is created or read for record ↔ record or record ↔ contact links, and there
  is no "choose existing" picker.
- Conversations belong to a customer by `customerId`, not by relation: the
  conversation relation widget lists the host customer's conversations
  (`getHostContacts`) through `useConversations({ variables: { customerId } })`
  and reads no relation, also on a ticket host.
- Preview iframes load plugin routes with `?inPreview=true` (messenger
  `settings/channels/erxes-messenger-preview`, `settings/forms/form-preview`,
  `forms/preview`). `FrontlineSettingsLayout` and `IntegrationsMain` render
  their children without `AppLayout` when that flag is set, matching core's
  `DefaultLayout`; a new layout wrapper must honor it too.
- `TICKET_CREATE_LAYOUT_SYSTEM_CODES` in `modules/ticket/constants/createLayout.ts`
  mirrors the backend list; a code added on one side must be added on the
  other and get a renderer in `TicketCreateSystemField`.
- The ticket detail's Properties tab (`TicketPipelineProperties`) is
  Settings → Properties as is: every property with `isVisible !== false`, in
  its own group. The pipeline and its create layout never move or hide a
  field there, so a field has one home whatever the pipeline.
- A create-form cell shows only when Settings → Properties allows it on create
  (`useSystemFieldRules(..., 'create')` / `field.isVisibleToCreate`), whatever
  the pipeline layout says.
- `inboxCustomersSharingEmail` uses core `customers(searchValue)`, which is a
  fuzzy search; `useCustomersSharingEmail` must keep only exact,
  case-insensitive matches on `primaryEmail`/`emails` and drop the current
  customer. `conversationDetail.customer` carries `emails` for this, because
  widget-typed emails held by another customer are never made primary.
- `usePipelineConfigForm` and `SelectTicketConfig` take the channel (and
  pipeline) from their caller first and the route only as a fallback; hosts
  outside the pipeline pages must pass them.
- Integration row actions live in `IntegrationActionsMenu({ integration })`
  and read the kind from `integration.kind`, never from the route; action and
  repair components take `integration`, not a table `cell`. Erxes messenger,
  call, callpro and telegram edit through atom-driven sheets; a page listing
  integrations of every kind mounts `IntegrationEditSheets` once (the channel
  list does). Their edits take the channel from the loaded record, never from
  the route.
- Integration create/update/delete/repair/move mutations refetch
  `ChannelIntegrationsPeek` alongside `Integrations`.
- `ChannelIntegrationsPeek` never selects `instagramPage`: that resolver calls
  Graph with a user token and spends the shared app quota.
- Customer media is recognised by its URL (`isUnverifiedAttachment` in
  `ticket/hooks/useUnverifiedAttachments.ts`): uploads here are storage keys
  read through `read-file`; anything else came from a conversation and is
  covered until revealed. Never autoplay it.

- The plugin owns its whole app sidebar. `src/modules/FrontlineMain.tsx` (the `./frontline`
  expose) wraps its routes in `erxes-ui` `AppLayout` (`id="frontline"`) with
  `FrontlineSidebar`. Core-ui draws only the top `CoreTab` bar; `navigationGroup` in
  `src/config.tsx` supplies just the tab name, icon and `defaultPath` and takes
  no `content`/`subGroup`.
- `FrontlineSidebarFooter` pins a Settings link to the bottom of the app
  sidebar. The plugin owns its settings at `/frontline/settings/*`, served by its
  own entry: the entry's top-level `<Routes>` sends `settings/*` to
  `FrontlineSettingsLayout` (`src/Sidebar.tsx`, an `AppLayout` titled
  "<Plugin> settings" with a Back link to the app) and `*` to the app
  `AppLayout`. Settings pages render inside `PluginSettingsRoutes`
  (`ui-modules`), which also serves `tags` and `properties/*` scoped to
  this plugin's types; the settings sidebar appends
  `PluginSharedSettingsNavigation`, which lists Tags/Properties only when the
  plugin registers those types. Core organization settings never list
  plugin settings, `config.tsx` has no `settingsNavigation`, and there is
  no `./frontlineSettings` expose; old `/settings/frontline/…` URLs are redirected
  by core. The settings navigation renders no `Sidebar.GroupLabel`.
- Page header breadcrumbs follow the shared pattern: crumbs are default ghost `Button`s (no `font-semibold`), the first crumb carries a 16px icon in the default text color, crumbs are separated by `Separator.Inline` or `Breadcrumb.Separator`, and settings pages carry no favorite toggle.
- The conversations filter bar header (`ConversationsHeader`) uses
  `bg-background`, matching the host's `PageHeader` and `PageSubHeader`, never
  the sidebar tint.
- Expandable navigation rows end in the host sidebar's chevron:
  `IconChevronRight` (`size-3.5`, muted) inside a span that rotates 90° when
  open, never a filled caret, so the rotation stays on the compositor and
  matches the main sidebar. Expandable group trigger buttons use `rounded`
  like `Sidebar.MenuButton`.
- The Team Inbox unread `NotificationCount` badge in `FrontlineNavigation.tsx`
  stays the same compact size as the host's My inbox count
  (`h-5 min-w-5 rounded-full px-1.5 text-[11px] tabular-nums`).
- Page-level side menus render `Sidebar.Panel` from `erxes-ui`, which keeps its
  own open state (`sidebarPanelOpenState`), separate from the plugin's
  `AppLayout` sidebar. Never stack two headings: a menu without a heading passes one as
  `label` (header row with the heading, optional `actions` and the collapse
  toggle); a menu that starts with its own heading row (group label, collapsible
  or accordion trigger) omits `label` and ends that row with
  `Sidebar.PanelTrigger`. Keep `<Sidebar collapsible="none">` for sidebars
  inside sheets and dialogs.
- `PipelineSidebar` stays `<Sidebar collapsible="none">`: below `md` it turns
  into a horizontal tab strip that must never collapse.
- Telegram consumes existing message/attachment/poll contracts and adds only
  optional `extraData.telegram` display metadata. Use native message actions
  and reply previews. Telegram poll labels name Telegram; other providers keep
  their defaults. Observed Telegram reactions do not enable send-reaction UI.
- Keep Telegram linkification, authenticated preview lookup and Stream-origin
  validation inside its module. Quotes render literal provider text. Never
  put Telegram bot tokens or token-bearing download URLs in browser data.
- Reconcile a saved Telegram bot with the server before retrying inbox linking;
  a lost mutation response may hide an already-committed integration.
- Telegram chat-label loads explicitly settle both success and rejection;
  failed metadata reads preserve existing labels or the inbox/customer fallback.
- Telegram attachment selection enforces both the configured upload limit
  (20 MiB by default) and 50 MiB total across uploaded and pending files.
  Immediate refs must account for rapid selections before the next render.
- Cloudflare Stream players use the validated cross-origin host and a sandbox
  permitting scripts, their own origin and presentation, without top navigation.
- Telegram bot reads and saves share the `frontlineTelegramBotFields`
  fragment in `integrations/telegram/graphql.ts`, spread by name.
  `TelegramBot`, `TelegramWebhookInfo` and `TelegramChat` derive from the
  generated query types. Link cards select the `TelegramLinkPreview` fields and
  map them to the inbox `IMessageEmbed`, turning a null `description` or
  `image` into `undefined`. Setup fails with `failed` when the created
  integration comes back without an `_id`.
- Telegram suppresses automatic response-template suggestions while typing;
  the explicit template selector remains available. Preserve other providers'
  composer behavior, Facebook partial-delivery recovery, Instagram error
  feedback and stale-send/draft guards.

- The inbox and ticket composers pick their mode through the one
  `ComposerModeTabs`; a composer that separates a customer reply from an
  internal note reuses it rather than a single toggle, and internal mode is
  always drawn with the `warning` colour. The one exception is a mail
  conversation: its replies go through the mail compose box, so `ComposerShell`
  shows a static warning-coloured Internal Note label there instead of the tabs.
- `TicketFields` must not save the description just because a ticket was
  opened. Plain-text (legacy v2) descriptions are converted to blocks with a
  fresh `crypto.randomUUID()` per block on every parse, so a re-parse never
  equals the loaded content; the save effect skips while the debounced content
  is still the loaded reference (`loadedDescriptionRef`) and only writes after a
  real editor change.
- On the form builder's Callout step, turning **Skip callout** on dims the
  callout fields the way 2.x's `LeftItem $deactive` did: they sit in a
  `<fieldset disabled>` with `opacity-30 dark:opacity-50 cursor-not-allowed`
  (50% in dark mode, where 30% reads as black), and its children get
  `pointer-events-none` so the image `Dropzone` (which has no `disabled` prop)
  also refuses drops. `[&_:disabled]:opacity-100` cancels erxes-ui's own
  `disabled:opacity-50` so the fade is applied once. The switch stays outside
  the fieldset, and turning it off restores the fields with their values
  intact.
- The form builder's General step ends with **Channel** and then **Save as
  customer**. The switch uses the plugin's labelled-row pattern (as in
  `HelpCenterGeneralTab`'s `FeatureSection`): the uppercase `Form.Label` and its
  description on the left and the `Switch` on the right, so it reads like the
  step's other labelled fields.
- Segmented `ToggleGroup` choices in the form builder (General step's
  Appearance and Load type, the field sheet's Field width and Validation) give
  every `ToggleGroup.Item` `flex-1` so the segments split equally; `flex-auto`
  sizes them by label length.
- In the form builder's field list, the whole field row is the drag source:
  it leads with an `IconDragDrop2` drag hint, shows a
  `grab` cursor, and while dragging lifts with `shadow-lg` and a `primary`
  border/ring. A single click anywhere on the row opens that field's
  `FormFieldDetailSheet`, which is where its label and other attributes are
  edited; there is no inline rename. `FormDndField` skips the
  click when the pointer moved at least the `MouseSensor` drag distance (10px)
  since pointer-down, so dropping a dragged field does not open its sheet. The
  row's `...` trigger and the dropdown content stop click propagation, so menu
  actions such as **Remove Field** never reach the row's click handler.
  The row `div` carries only the sortable ref and `listeners` (no role or
  handlers); its icon and label sit in a native `<button>` that is the dnd-kit
  activator (`setActivatorNodeRef`, `attributes`), with the `...` menu as a
  sibling (its `DropdownMenu.Trigger` is `asChild` over the `Button`) so
  buttons never nest. On that button **Enter** opens the sheet (its
  keydown is kept from the `KeyboardSensor`, and during a keyboard drag it is
  left to drop instead), while **Space** picks the field up, arrows move it and
  **Space** drops it; Space's keyup is prevented so it never clicks the button.
- The form builder runs under two route families — `frontline/forms/*` and
  `frontline/settings/channels/:id/forms/*` — and tells them apart by the `id`
  route param, never by a flag. `FormsCreateButton`, `FormMutateLayout`'s cancel
  and `useFormMutate`'s post-save navigation each read `useParams().id` and fall
  back to the `frontline/forms` path when it is absent; a new builder surface
  must keep that fallback or it will strand the user in settings.
- `useFormMutate` resolves the channel for a create as
  `formDetail?.channelId || setup state channelId || :id param`. The setup
  state's `channelId` comes from `formSetupValuesAtom`, which exposes it beside
  `formValues` because `formsAdd` takes `channelId` as its own argument — do not
  fold it into `formValues`, the edit path spreads those straight into
  `formsEdit`.
- A channel change on a resource goes through `channelMoveResources`, never
  through the resource's own edit mutation. The move mutation is the only path
  that validates the destination and cascades a pipeline's tickets and a form's
  lead integration. The one remaining exception is the inline `Channel` cell on
  the global `/frontline/forms` table, which still writes `formsEdit`.
- `MoveToChannelDialog` owns its `open` state in the row cell, outside the
  `Popover` / `DropdownMenu` content. Rendering it inside the menu content
  unmounts it the moment the menu closes and the dialog never appears.
- `FormStatus` is shared by the forms and surveys surfaces. Its `BarItem` and
  `View` default to `['active', 'archived']`; only the surveys sub-header
  passes `statuses`, so adding a status there must never change the forms
  filter. Its `Badge` keeps rendering the raw status string, and an unknown
  status falls back to the neutral dashed-circle badge.

- `CONFIG` keeps a top-level `icon` alongside `navigationGroup.icon`. The host
  reads only the top-level one for a `frontline:*` notification's avatar in My
  Inbox, and renders nothing when it is missing.
- A form's `leadData` may be `null` (forms written without the builder), so
  `formSetSetupAtom` reads it null-safely, falls back to the default
  `Initial step` when it has no steps, and places a field without
  `pageNumber` on page 1 — never dereference `payload.leadData` directly.
- The Convert menu shows the deal entry only when the `sales` plugin config is
  loaded, and each entry only with its create action (`createTicket`,
  `dealsAdd`) on top of `conversationConvertToCard`.
- The convert dialog keeps its own open state and never touches
  `ticketCreateSheetState` / `ticketCreateDefaultValuesState`, which the ticket
  relation widget in the same sidebar drives. Its ticket pickers reuse
  `SelectChannel`, `SelectPipeline` and `SelectStatusTicket`; the pipeline and
  status pickers watch `channelId` / `pipelineId` on whatever form they are
  given, so a form using them must name those fields exactly that.
- Convert-time properties come only from Settings → Properties, the same way
  for every kind: `frontline:ticket` or `sales:deal` fields
  whose `Visible to create` (`isVisibleToCreate`) is on and whose display logic
  passes, rendered per field group under a `Properties` heading at the bottom
  of the dialog. Ticket pipeline property selection does not filter them.
  Multi-row groups are not offered at convert time. The values are sent as
  `customFieldsData` without empty entries.
- Convert-time system fields come from core `propertySystemFields` (the Settings
  → Properties "Basic information" group) through `FrontlineConvertSystemFields`.
  Priority, tags, start date and due date render only when their system field
  has `Visible to create` on and its display logic passes; `Required` blocks
  submit while empty. `useConvertSystemFields` resolves which keys show;
  `getConvertSystemFieldCode` maps a form key to the kind's code, and only
  `closeDate` differs (`CONVERT_TYPE_OPTIONS[type].closeDateCode`, which is
  `targetDate` on tickets and tasks). Name, stage,
  assignee, branch, department, attachments and description stay always shown.
- A successful convert refetches `ConversationConvertedItems` and evicts
  cached `getTickets` / `deals` lists, so the menu and the customer's lists
  update without a reload. Convert makes no relation.
- Any new call atom created with `atomWithStorage` must also be reset in
  `ClearCallCacheButton` (`call/components/CallSipActions.tsx`), otherwise the
  clear-cache action leaves stale call state behind. `callConfigAtom` is reset
  last, after `callSelectConfigDialogAtom` is set to `true`, so the picker opens.
- Which call integrations are switched on is `callEnabledIntegrationIdsAtom`
  unioned with `callConfigAtom.inboxId` while it `isAvailable`; read and change
  it only through `useCallEnabledIntegrations`, so the switches and `Call from`
  never disagree. The union keeps a config chosen before multi-toggle existed
  switched on.
- The call widget popover sits at `z-100` and `Select.Content` portals to
  `body` at `z-50`, so any select inside the widget must raise its content
  above the widget (`SelectPhoneCallFrom` uses `z-110`), or its list opens
  hidden behind it.
- `SipProvider` restarts its JsSIP user agent in place when `host`, `port` or
  `user` change, so a `Call from` change to different SIP credentials
  re-registers and one on the same credentials keeps the live connection. Never
  force a `key` on `SipProvider`: `CallWidget` renders inside it, and a remount
  runs the widget's `IDLE` effect and closes the widget. Its `useSip()` context
  carries only call controls; frontline_api has no active-session contract, so
  there is nothing to register a device or tab against.
- `RecordTable.Provider`'s container is `overflow-hidden`, so a table that is
  not wrapped in a scroll area clips every column past the viewport instead of
  scrolling. The help center and its categories tables paginate by page, not by
  cursor, so they need an explicit `RecordTable.Scroll` wrapper — only the
  cursor-paginated tables get a scroll area for free from
  `RecordTable.CursorProvider`.
- This migration deliberately changed **no** user-facing wording: the drawer,
  its tabs and the table keep the exact `kb-*` i18n keys and English fallbacks
  they had when a help center was a knowledge base topic. Renaming a label is a
  separate, explicitly-asked-for change — an API migration must not drift the
  copy, especially not onto new keys the gateway locales do not carry, which
  would silently drop non-English users to the English fallback.
- A help center's settings are **not** a client portal's. `core-api` owns
  `ClientPortal` (portal users, auth, OAuth) and `core-ui` edits it under
  Settings; this surface owns `HelpCenterConfig` through `helpCenterConfig*`
  operations. `getClientPortals` is read for exactly one thing — the website
  picker's options — and never written: never point a help center write at
  `clientPortalUpdate`, and never name a help center field `clientPortal*`.
- Every help center read and write goes through one fragment,
  `HELP_CENTER_CONFIG_FIELDS` on `HelpCenterConfig`, shared by
  `frontlineHelpCenterList`, `frontlineHelpCenterDetail` and the
  `helpCenterConfigUpdate` mutation. Because the mutation selects the same
  fragment, Apollo normalizes the result onto the cached record and every
  surface updates without a refetch — never narrow one of the three selections.
- `helpCenterConfigUpdate` replaces the whole config, so an inline cell can
  never send only the field it changed. `useEditHelpCenter` rebuilds the full
  input from the cached record through `toHelpCenterConfigInput`, applies the
  patch on top, and refuses the write when `title` would end up empty. `title`
  is the only required field — `brandId` is optional, and a brand-less help
  center stays inline-editable.
- Help center save feedback uses its own `help-center-saved`,
  `help-center-created` and `help-center-needs-name` keys in
  `useSaveHelpCenter` and `useEditHelpCenter`; never reuse the knowledge base
  `kb-topic-*` keys, whose defaults say "Topic".
- The table's ticket channel/pipeline/status cells reuse the ticket module's
  `Select*` components in their `table` variant, but pass their own
  `onValueChange` — those components' roots save onto a ticket, and
  `SelectStatusTicket`'s needs an `id`, so the status cell composes the provider
  itself the way `HelpCenterGeneralTab` does.
- A help center's ticket target is a channel → pipeline → status chain, so
  changing a level clears the levels under it — `useEditHelpCenter` does this
  for inline edits and `HelpCenterGeneralTab` does it through `form.setValue`.
  The forms card has its own chain: a frontline form belongs to one channel
  (Settings → Channels → Forms), so the Forms picker only offers
  `formChannelId`'s forms, is disabled without a channel, and changing
  `formChannelId` clears `formIds` — in the drawer and in `useEditHelpCenter`.
  `formChannelId` is independent of `ticketChannelId`; the two channel selects
  are deliberate. The forms card has no switch of its own: it follows
  `ticketToggle`, and its channel is optional — no channel means no forms.
  The drawer has no CMS card: picking a CMS needed the content plugin's
  `contentCMSList`. The help center's own `cmsId`, `cmsAppToken` and
  `cmsConfigs` stay in the form untouched — `toHelpCenterConfigInput` loads
  them, the form is not registered with `shouldUnregister`, and
  `useEditHelpCenter` spreads them back — so saving never clears a CMS the
  public help center app still reads.
  The API blanks a switched-off feature's whole group in
  `normalizeHelpCenterConfig`, so a disabled feature never keeps stale
  configuration no matter which surface saved it.
- `HelpCenterDrawer` splits across `SheetNavSidebar` tabs — **general** and
  **appearance** always, plus **embed** and **domain** while editing
  (`HELP_CENTER_TABS` vs `HELP_CENTER_CREATE_TABS`, because a config must exist
  before its script or domain is worth showing): general stacks full-width cards in a fixed order — general
  settings (name and client portal side by side, then description), knowledge
  base,
  tickets, forms, and CMS. Each feature card keeps its
  switch row on top and lays its fields out in a two-column grid under a
  divider, and `FULL_WIDTH_SELECT` stretches every select to the `h-8` input
  height, so the two columns line up. Embed renders the knowledge base module's
  `TopicEmbedTab` for the topic this help center publishes (`kbTopicId`), and
  falls back to a `select-knowledge-base-topic` line until one is picked — it
  holds no field of its own and saves nothing. Appearance owns the published
  site's whole look — logo and favicon, the six main colours, fonts with their
  text and link colours, the three form-element colours, this help center's own
  accent colour and cover image, the header's wording, the footer's content, and
  the raw header/footer HTML. The sidebar
  keeps the active tab in the `tab` URL query param, so the drawer clears it on
  close or the next one opens wherever the last was left. Both tabs stay mounted
  (hidden, not unmounted) so values and validation survive switching, and an
  invalid submit switches to the tab holding the first failing field via
  `HELP_CENTER_FIELD_TAB` — add every new form field to that map.
- The appearance tab's Header card edits `header` through
  `HelpCenterHeaderFields`, which renders `HELP_CENTER_HEADER_FIELDS` as plain
  inputs whose `placeholder` is the published site's own built-in wording — a
  blank field means "keep that label", so the card never pre-fills a value. The
  knowledge base and ticket tab labels are deliberately absent: they are
  `kbLabel` / `ticketLabel` on the General tab, beside the toggles that gate
  them.
- Footer columns render as an `Accordion` (`type="multiple"`, controlled) so a
  long footer stays scannable. The trigger shows a live heading and link count
  through `useWatch`, and the remove button sits beside the trigger rather than
  inside it — a button nested in a trigger is invalid markup. The trigger is
  wrapped in its own `flex-1 min-w-0` div because a `flex-1` passed to
  `Accordion.Trigger` lands on the inner button, not on the header Radix wraps
  it in; without the wrapper the row shrinks to its text and the remove button
  stops sitting at the right edge. Collapsed content
  unmounts, which is safe only because the drawer's `useForm` leaves
  `shouldUnregister` at its default `false`; turning that on would drop a
  collapsed column's values on save.
- The appearance tab's Footer card edits `footer`, a nested object with `logo`,
  `description`, `copyright` and a `columns` array, through
  `HelpCenterFooterFields`. The two `useFieldArray` levels — columns, and links
  inside a column — are why the tab takes the whole `form` rather than just
  `control`, and why `toFooterInput` rebuilds every level field by field: the
  cached record carries `__typename` at each one and `HelpCenterFooterInput`
  rejects it. Leaving `columns` empty is meaningful — it is what tells the
  published site to keep its built-in Support / Knowledge base / Account
  columns — so the card never seeds defaults on its own; the author asks for
  them with the "Start from the built-in columns" action.
- A help center has **no page of its own**: `/frontline/helpcenter/:id` was
  removed, and editing is addressed by the `editId` URL query on the list page,
  which opens `HelpCenterDrawer` over the table. The page mounts **one** drawer
  for both creating and editing, keyed on the record — two would each mount a
  `FocusSheet` and each read the same `tab` query param. The row menu's Edit, the
  name cell's anchor and a shared link all go through that one param — never
  reintroduce a detail route. Every surface widens a list record for a save
  through `toHelpCenterConfigInput`; passing a partial record would reset the
  fields it omitted on the next save.
- Category editing lives on the knowledge base categories route
  (`/frontline/knowledgebase/:topicId/categories`), which owns create, edit and
  delete. The help center surface does not duplicate it.
- The upload slots use the repo's usual `Upload.Root` handler
  (`if ('url' in fileInfo) field.onChange(fileInfo.url)`) — `Upload.RemoveButton`
  reports a removal in that same shape, so no special case is needed here. The
  gateway stamps the `userid` header `/delete-file` needs from the session.
- Never hide a pane or a field group with the `hidden` **attribute** here: this
  app runs Tailwind v4, whose `display` utilities are declared after preflight's
  `[hidden]` rule and win over it, so `<div className="grid" hidden>` stays
  visible. Toggle the class instead (`enabled ? 'flex flex-col' : 'hidden'`) —
  both the drawer's tab panes and its feature sections do.
- The help center's own types and constants live in `helpcenter/types/index.ts`
  and `helpcenter/constants/index.ts`; the knowledge base keeps its own in
  `knowledgebase/types/index.ts` and `knowledgebase/constants/index.ts`. Neither
  module may re-export from `content_ui` — that pulls another plugin's source
  into this remote and breaks it at runtime.
- The help center table shows the three identifying columns — name, website,
  knowledge base topic — followed by the three ticket routing selects, each
  headed `Ticket channel` / `Ticket pipeline` / `Ticket status` so a row reads
  as one ticket target rather than three unrelated picks. Those three headers
  pass their own `ticket-*-label` keys with inline English fallbacks; the bare
  `channel-label` / `pipeline-label` / `status-label` keys are shared repo-wide
  and live in the gateway locales, outside this plugin, so never rename them to
  suit this table. The two on/off switches (`kbToggle`, `ticketToggle`), the
  knowledge base name (`kbLabel`), the ticket menu label and the description are
  drawer-only; put a new field of that kind in `HelpCenterGeneralTab`, not in a
  column. `kbLabel` still ships in `HELP_CENTER_CONFIG_FIELDS` and is rebuilt by
  `useEditHelpCenter` on every inline write even though no column shows it —
  dropping it would blank the drawer's field on the next save. `erxesAppToken`
  is in the fragment for exactly the same reason: no field or column shows it,
  and a whole-config write that omitted it would clear the site's widget token. The ticket selects cascade: pipeline is disabled until a channel is
  chosen and status until a pipeline is, and `useEditHelpCenter` clears the
  downstream ids when an upstream one changes.
- The client portal reference (`clientPortalId`) and the website (`url`) are
  optional and never typed: both write paths pick a client portal through
  `helpcenter/components/SelectHelpCenterClientPortal.tsx` and store that
  portal's `domain` in `url`. `core-ui` already validates a portal's
  `domain` as a URL, so the field needs no URL validator of its own here — the
  plugin's own API still rejects a non-`http(s)` value as a guard. `url` stays a
  plain string on `HelpCenterConfig`: `ClientPortal` is not a federated entity,
  so this remote cannot store a portal id and resolve the portal through
  `frontline_api`. A stored `url` that matches no portal is shown as-is instead
  of reading blank.
- `InlineTextCell` is controlled (`open` state) rather than using
  `closeOnEnter`, so a cell writes on Enter or on clicking away and never twice
  (`saved` ref). It is now the name cell's only user; a field that must come
  from a fixed set of records gets a select cell instead, as website, knowledge
  base topic and the three ticket ids do.
- `kbToggle` defaults to **on** wherever a help center is read or written, and
  there is now exactly one place that decides it: `toHelpCenterConfigInput`
  returns `EMPTY_HELP_CENTER_FORM` for a new record and `?? true` for an existing
  one, and both the drawer's reset and `useEditHelpCenter` go through it. Change
  the default there, never by adding a second `??` at a call site.
- The `Client portal` select is one component,
  `helpcenter/components/SelectHelpCenterClientPortal.tsx`, rendered by both
  surfaces the same way the topic select is. Field, column header and component
  are all named for the record being picked; the label comes from
  `t('sidebar.client-portal')`, a **`common`-namespace** key that both locales
  already translate, reached through the app's `fallbackNS: ['common']`. The
  old `website` key existed in neither locale, so it served English to everyone
  — prefer an existing translated key over a new one here, because this plugin
  cannot write the gateway's locale files. It reads `getClientPortals` and hands the
  whole chosen portal up — `onValueChange(portal)` — because a pick writes
  **three** fields: `clientPortalId` (the reference the API resolves from),
  `url` (its `domain`, what the published site is matched by) and
  `erxesAppToken` (its `token`, what the site boots with). All three must be
  written together (the drawer through `form.setValue`, the table cell through
  one `editHelpCenter` patch); writing only `url` leaves a config pointing at
  one portal with another's token. The trigger resolves by `clientPortalId` and
  falls back to matching the stored `url` against a portal's domain, so a
  config written before the id existed still shows its portal and gets the id
  backfilled on the next save. The popover's footer opens core's
  `/settings/client-portals` in a **new tab** — a portal is core's record, so
  this plugin only links to where it is created, never writes one, and the
  new tab keeps an unsaved drawer alive. Re-opening the popover refetches the
  options, which is how a portal created in that tab appears here. The footer
  is a plain button outside `Command.List` so `cmdk`'s search cannot filter it
  away, and it is labelled with the already-translated `sidebar.client-portal`
  key plus a plus icon rather than a new English-only string. The picker reads like the CMS picker: trigger and
  option show **the client portal's name**, falling back to the domain for an
  unnamed portal, while the domain stays searchable as the option's `keywords`
  and remains the stored value. The trigger resolves the name by matching the
  stored `url` against the loaded options, so it falls back to the raw domain
  while the options load or when the stored domain no longer belongs to a
  portal. Because the stored value is a domain, `toWebsiteOptions` keeps only
  portals that have one and **collapses portals that share a domain** — two rows
  for one domain would both read as checked. Change the option query and that
  shaping in the one file.
- The `Knowledge base topic` select is one component,
  `helpcenter/components/SelectHelpCenterTopic.tsx`, rendered by both surfaces:
  the table cell passes `variant="table"` plus a cell `scope`, the drawer field
  passes `variant="form"`. It reads `knowledgeBaseTopics` — the one knowledge
  base call a help center surface still makes, because picking which topic the
  site publishes is a knowledge base read, not a setting stored on a topic.
  Change the option query in that one file — never fork a second copy for one of
  the two surfaces.
- The help center drawer is split by responsibility, all under
  `helpcenter/components/help-center-drawer/`: `HelpCenterDrawer.tsx` owns only
  the sheet, the form and the save; `HelpCenterGeneralTab.tsx` and
  `HelpCenterAppearanceTab.tsx` own a tab each; `HelpCenterStyleFields.tsx` the
  reusable `Style*Field` helpers; the knowledge base module's
  `shared/components/TopicEmbedTab.tsx` the Embed tab panel (presentational,
  no query of its own); and `helpcenter/{types,constants}/index.ts` the shapes and
  defaults. Add new fields to the owning tab, never back into the drawer. The tabs take the form **as a
  prop**: `react-hook-form` is not in this remote's shared `coreLibraries`, so
  the copy backing `useFormContext` here is not the one `erxes-ui`'s `Form`
  provider filled and reading the context returns null. Never reach for
  `useFormContext` across an `erxes-ui` provider in this plugin.
- The embed script is **owned by the knowledge base** and only borrowed by the
  help center. `knowledgebase/utils/buildTopicEmbedScript.ts` is the only place
  that builds it, and both surfaces that show it call that builder: the
  topic's `kbsettings` page opens `shared/components/TopicEmbedScriptDialog.tsx`,
  and the help center drawer's **Embed** tab renders
  `shared/components/TopicEmbedTab.tsx` with the config's `kbTopicId`. Both
  therefore show the same snippet for the same topic. Never fork a second
  builder.
  The snippet's `window.erxesSettings.knowledgeBase.topicId` and
  `knowledgeBaseBundle.js` output is a published contract with every site that
  already embedded a topic: change the surface around it, never the generated
  text. It needs no query and no new field — a topic's `_id` is the whole
  input. The bundle it loads is built by `apps/frontline-widgets`
  (`compile:knowledgebase`); the panel's install hint names the optional
  `<div data-erxes-kbase></div>` that embeds the widget inline instead of as a
  corner button.
- Every install snippet (messenger, form, knowledge base) takes its host from
  `REACT_APP_WIDGETS_URL` in `src/modules/utils.ts`: `window.env` first, then
  the build-time value `rspack.config.ts` defines from `.env`, then
  `http://localhost:4200` (the `frontline-widgets` dev server) in development.
  Never fall back to the gateway — it serves none of the bundles.

- Appearance fields are one nested `styles` block on the config, addressed as
  `styles.<name>` through React Hook Form and rendered by the four
  `Style*Field` helpers (colour, image, font, HTML). Fonts pick from
  `HELP_CENTER_FONTS`, storing the CSS stack the site serves rather than a bare
  family name; add a face there rather than to a field. Colours use `erxes-ui`'s
  `ColorPicker` — the palette the rest of the product picks from, whose popover
  already carries a hex field; never a native `<input type="color">` — add a style through those
  rather than hand-rolling a field. A colour field pairs the picker with
  `shared/components/ColorDefaultAction.tsx`, which takes the default it resets to as a prop: the
  style fields read theirs from `defaultStyleColor(name)` and the topic colour
  takes the default of the surface it is edited on, because the help center
  starts a topic colour at `#4f33af` and the topic drawer at `#4F46E5`
  (`EMPTY_TOPIC.color`). Apollo runs with `addTypename: true`, so a
  cached block carries a `__typename` that `HelpCenterConfigStylesInput`
  rejects: `toHelpCenterConfigInput` strips it in `stripStylesTypename`, and
  every write path — drawer reset and inline edit alike — goes through it. Any
  new path that sends `styles` back must go through it too.
- The drawer does not collect `brandId` or `languageCode` — they are absent from
  its fields but present in `IHelpCenterConfigInput`, and
  `toHelpCenterConfigInput` carries them through every save, so a config edited
  here keeps them. The brand filter reads `brandId`, so do not drop it from the
  shape or from `HELP_CENTER_CONFIG_FIELDS`.
- `SelectTriggerTicket`'s `form` variant is `w-fit max-w-64` and takes no
  `className`, and ~15 other ticket forms depend on that width.
  `HelpCenterGeneralTab` needs its channel/pipeline/status pickers full width,
  so it overrides them from its own `Form.Item` wrappers via
  `FULL_WIDTH_SELECT`; widen the pickers there, never in the shared trigger.
- `HelpCenterGeneralTab` composes `SelectPipeline` (root) and
  `SelectStatusTicket.Provider` directly rather than their `FormItem` variants:
  `SelectPipeline.FormItem` is typed to `addTicketSchema` and both watch
  `channelId` / `pipelineId` field names this form does not use, and
  `SelectStatusTicket`'s root saves onto an existing ticket.
- `helpCenterConfigsTotalCount` takes the same `searchValue`/`brandId` the
  list does, so the record count is the server's count under the active filter —
  `useHelpCenters` reports it directly and never falls back to the row count.
  `HELP_CENTERS_PER_PAGE` still has to stay large enough to hold the whole list
  in one page: the query pages with `page`/`perPage`, not a cursor, and the table
  has no load-more affordance.
- A survey's `brandId` is optional and selected on the wizard's General step through
  `SelectBrands.FormItem` (`mode="single"`, `disableCreateOption`), which pins
  which of the channel's messenger integrations the survey's answers are filed
  under. Inline brand creation stays disabled there: a brand invented in this
  form has no messenger integration in the channel, and `frontline_api` rejects
  it. The selector lists every brand in the org, so a wrong pick surfaces as the
  mutation's error toast rather than as a filtered-out option.
- A survey is always created with a channel. The wizard runs under two route
  families — `frontline/surveys/create` and
  `frontline/settings/channels/:id/surveys/*` — and tells them apart by the `id`
  route param through `useSurveySetupChannel`, never by a flag. Under settings
  the channel is the `:id` param; on `frontline/surveys/create` it is the
  General step's channel select, required by `SURVEY_GENERAL_CREATE_SCHEMA`.
  `useSurveyMutate`, `SurveyMutateLayout`'s cancel and
  `SurveyOptionTicketConfig`'s pipeline select all read the channel and the
  return path from that hook. Changing that channel select clears every
  option's `ticketPipelineId` and `ticketStatusId` in `surveySetupContentAtom`,
  because pipelines belong to a channel and the API does not check that a
  survey's pipeline matches its channel. Editing, archiving, and removing a
  survey still live only under a channel's settings page.
- The wizard keeps one step's values per Jotai `atomWithStorage` atom
  (`surveySetupGeneralAtom`, `surveySetupContentAtom`, `surveySetupConfirmationAtom`),
  synced by the shared `FormValueEffectComponent`, exactly as the form builder
  does. `SurveyCreate` resets them when the previous visit left an edited survey
  behind; `SurveyEdit` seeds them once per survey id, so a background
  `cache-and-network` refetch cannot discard in-progress edits.
- An option's `ticketCreated` / `ticketId` are server-owned. The wizard reads
  them to show state but never sends them back; `surveySetupValuesAtom` submits
  only the config fields, and it nulls every ticket field when
  `ticketCreationEnabled` is off so a disabled option cannot carry stale config.
- `SurveyOptionTicketConfig` reuses `SelectPipeline` (scoped to the route's
  `channelId`) and `useGetAccessibleTicketStatuses`; changing the pipeline
  clears the chosen status, because statuses belong to one pipeline.
- `useSurveyMutate` sends only `title`, `brandId`, `channelId`, `durationHours`
  and `steps`. The API mirrors step 1 onto the survey's legacy
  `question`/`options`/`allowMultiselect`, so the UI never sends them.
- Survey results are read per step: `SurveyStepResults` renders
  `results.steps[].options` with each step's own percentages, and both the
  results dialog and the results board go through it. `results.options` is the
  flat cross-step list and is not selected by any document here.
- The inbox `withSurvey` filter lives in `INBOX_CONVERSATION_QUERY_KEYS` and
  `INBOX_TARGET_KEYS`, so selecting the channel `Surveys` row clears
  `integrationType`/`integrationId` the same way an integration row does.
  `ChannelSurveyNavItem` counts through its own light
  `frontlineChannelSurveyConversationCount` query — never `useConversations`,
  which owns inbox state and subscriptions.
- `SendSurveyDialog` lists only the conversation channel's active surveys
  through `integration.channelId`, which `IntegrationInline` must keep
  selecting; without it every channel's surveys appear and
  `surveySendToConversation` rejects them as "another channel".
- `useSurveyResultsList` reads the `surveyResultsList` document because
  `Survey.results` runs two aggregations per survey; the management list
  (`useSurveyList`) must not select it.
- Survey types derive from the generated documents: `ISurvey` is
  `SurveyFieldsFragment` (spread by name in the list, results list and
  detail), `ISurveyDetail` is `surveyDetail`, `ISurveyWithResults` a
  `surveyResultsList` row, and `ISurveyStep` / `ISurveyOption` /
  `ISurveyStepResult` index into them. `ISurveyAttachment` is the form and
  `AttachmentInput` shape; stored step attachments enter the form through
  `toContentAttachments`. `surveyTotalCount.byStatus` stays `JSON` because no
  surface reads it.
- The composer shows two different controls by integration kind:
  `PollComposer` (ad-hoc, provider-native) for `discord-messenger` and
  `telegram-messenger`, and
  `SendSurveyDialog` (saved survey) for `messenger`. Neither is a fallback for
  the other.
- Discord polls and erxes surveys are separate all the way down. Discord writes
  `extraData.poll` and renders through `MessagePoll`; a survey writes
  `extraData.survey` and renders through `MessageSurvey`. `MessageItem` reads
  both and may show either. Never merge the two renderers again — the split is
  what lets a survey carry steps while a Discord poll keeps its numeric answer
  ids.
- `MessageSurvey` reads `survey.steps` when present and otherwise synthesises a
  single step from the snapshot's top-level `question`/`answers`, which is what
  every message sent before multi-step surveys carries. It labels steps only
  when there is more than one.
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
  channel (`channelId` set, `integrationType` cleared) and the chevron (the same
  `IconChevronRight` the host sidebar uses for expandable rows) expands the
  integration types inside it, each of which narrows the same channel by source.
  A `NavigationMenuGroup` header is itself a collapse control, so a group that
  holds exactly one channel renders that channel with `collapsible={false}`:
  the personal row therefore has no chevron of its own, since a second one there
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
- A draft body is seeded into its editor through `DOMPurify.sanitize` and shown
  read-only through `EmailBody`, never through raw `innerHTML`. Drafts are one per
  inbound mail; the UI lists them all and never assumes a single draft per
  conversation. `mailDraftApprove` resolving is not success either — its toast
  reads the returned `deliveryStatus` through `useDeliveryToast`.
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
  That query selects the core `Customer` inline fields, and
  `useCallProCustomersByPhone` drops rows without an `_id` and maps null
  fields to `undefined` so the rows are `ICustomer`s.
- Call Pro follows the `call` module's integration-form shape: `callProAddSheetAtom`
  (boolean) and `callProEditSheetAtom` (integration id) drive two `Sheet`s over a
  single `CallProIntegrationForm`, and `CallProIntegrationDetail` is the one place
  both sheets are mounted. Do not fork a second form for edit.
- The Call Pro recording player sets `src` on `<audio>` directly with no MIME
  `type`. The PBX serves ogg/mp3/wav depending on the account, and a wrong
  `<source type>` makes the browser skip the file silently.
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
- The call report's `SLA` tab reads `callSlaReport`, never
  `callKpiScorecard.serviceLevel`: the tab measures answered ÷ offered with no
  answer-time threshold, so its number is expected to differ from the KPI
  card. A missed call that we called back and the customer answered inside
  the callback window counts as answered. Its settings are an agent select
  (options come from `callSlaReport.agents`, which is never narrowed by the
  selection) and the callback window, component state in `SlaSection`
  defaulting to 60 min (`DEFAULT_CALLBACK_WINDOW_MINUTES`) with options Off,
  15, 30, 60, 120, 240 and 1440 minutes. There is no target level and no
  short-abandon selector: the 5 s short-abandon rule is fixed in the API and
  echoed back as `shortAbandonSeconds`, and the service level is coloured with
  the shared `rateColorVar` thresholds. **Export Excel** re-reads
  `callSlaReport` lazily with `breachLimit` 5000 (`SLA_EXPORT_BREACH_LIMIT`,
  refused with a toast when `breachCount` is larger) and `slaExcel.ts` writes
  Summary, Daily, Missed reasons, Queues and Breaches sheets. The "Why calls
  were missed" card (`SlaMissedReasons`) renders `missedReasons` as bars and
  `missedByHour` as a stacked hourly bar chart; reason labels, hints and
  colours live in `MISSED_REASON_META` and must stay in step with
  `MISSED_REASONS` in `frontline_api`. The tab ignores the direction chip
  because SLA is inbound-only.
- Call report charts are recharts **bar** charts: `VolumeChart` groups
  inbound / outbound / answered / no-answer bars per PBX day,
  `CarrierBarChart` is a horizontal bar per carrier labelled with its share,
  and `SlaTrendChart` draws one bar per day coloured by `rateColorVar`. The
  heatmap stays a cell grid, not a chart.
- The tab row, KPI row and tab content share one width container
  (`CONTENT_WIDTH` in `CallReportsPage`, `max-w-[1440px] px-6`) so their left
  and right edges line up; keep new blocks inside it.
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
- Ticket List report columns live in
  `report/components/ticket-charts/TicketListColumns.tsx`. Only the columns in
  `TICKET_LIST_DEFAULT_COLUMNS` start visible; `TicketListColumnDefaults` hides
  every other column the first time it appears (no stored visibility key) and
  keeps the `more` column last, because the shared provider appends newly
  arrived column ids — property fields load asynchronously — after it. The
  action column id must stay `more` so the selector never lists it, which would
  let a user hide the selector itself. Property cells read
  `propertiesData[field._id]` and resolve option labels; they never mutate.
- Ticket List export columns are built by `useTicketExportColumns` from the
  `{id, header}` list `TicketListColumnDefaults` reports upward. Each non-
  property column id needs an entry in `TICKET_EXPORT_VALUES` reading the
  `reportTicketExport` row, or it is silently left out of the file; property
  columns reuse `toPropertyText` so the sheet matches the cell text.
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
- The report boards (overview, ticket, Facebook, call center) are picked from
  the `ToggleGroup` header tabs in `ReportIndexPage`; there is no context-
  column navigation for `/frontline/reports*`. The boards' paths, labels,
  icons and path matching live in
  `src/modules/report/constants/reportSections.ts` — add a board there, not
  in the page. The Facebook board lives at `/frontline/reports/facebook`.
  `ReportsView` also still renders it for `?reportModule=facebook`; keep
  both, because the query-param path is what the `REPORT_MODULES` entry uses.
  The KPI row reads the header's `OVERVIEW_KPI_DATE_FILTER_ID` date atom,
  exactly like the conversation board, so the header filter keeps driving it.
- **`REPORT_MODULES` is not a visible menu.** `ChooseReportModule` renders it,
  but its only consumer `ReportNavigations` is imported nowhere; the report
  boards are the `ReportIndexPage` header tabs. Adding an entry to
  `REPORT_MODULES` therefore ships no clickable surface — a new report board
  needs a `reportSections.ts` entry and a `reportContent` branch in
  `ReportIndexPage`.
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
- Translated modules scope their keys with a `keyPrefix` matching the module
  (`modules.integrations`, `modules.helpcenter`, `widgets.automations-mail`, …)
  and call `t('key')` without inline English defaults; every key used under a
  prefix must exist in both `en` and `mn` under the same path.
- Ticket tag selectors must go through `SelectTagsTicket`
  (`src/modules/ticket/components/ticket-selects/SelectTagsTicket.tsx`), never
  `TagsSelect.SelectedList` directly — the shared component chains every
  selected tag as a badge with no cap, which is the long-list look the ticket
  UI intentionally avoids in favor of a "Tag +N" count trigger, matching how
  Sales' `DealTagsChip` calls `TagsSelect.Trigger` with `showSelectedTagsOutside={false}`.
- Ticket channel, pipeline and status command items carry
  `keywords={[name]}`: their `value` is the record id, and `cmdk` searches only
  `value` and `keywords`.
- Inline create forms submit through `SelectCreateContainer`, which stops the
  `submit` event: the popover is portaled, but React still bubbles it to a form
  that renders the select. Each form must wait for the select's list to refetch
  before selecting the new id — `useChannelAdd` refetches no list the select
  reads, so the channel form calls the provider's `refetch` itself. The create
  mutations' results are nullable in the schema, so each form selects the new
  id only when the result is present.
- `TicketDetailActions` reads `ticket` from the cache, which changes only once
  a mutation settles; every action runs through its `pending` guard so a
  second pick cannot resend the same stale toggle or remove twice.
- Each inline-create select gates the create option on its list query's
  `error` as well as `loading`: a failed query leaves an empty list that would
  otherwise invite a duplicate of an existing record. `useGetPipelines`
  returns `error` for this.
- The ticket index favorite control uses selected channel and pipeline query
  loading states for its skeleton. Missing records after those queries settle
  are not loading states; they must leave a valid tickets-only breadcrumb.

- The topic settings route is `kbsettings`, never `settings`: core-ui's
  `useIsSettings` matches any path containing `/settings` and would swap the
  host's second navigation column for the workspace settings menu (the CMS
  names its own route `cmssettings` for the same reason).
- The knowledge base is route-driven, not query-param driven: the index lives
  at `/frontline/knowledgebase` and every per-topic surface at
  `/frontline/knowledgebase/:topicId/{articles,categories,kbsettings}`. The
  sidebar and breadcrumbs build their links from `KNOWLEDGE_BASE_PATH`; never
  reintroduce a `?topicId=` selection. A sidebar category links to its topic's
  `articles` route with the existing `categoryId` filter param, so the sidebar
  and the filter bar chip always show the same selection. `editId`,
  `createTopic`, `categoryId` and `status` stay query params, because they are
  filter and drawer state, not routes.
- `KnowledgeBaseLayout` renders `sidebar/components/KnowledgeBaseSidebar` on
  every knowledge base page, including the index; there is no topics card grid
  or topics table. The index redirects to the first topic's `articles` route,
  carrying the query string so `?createTopic=true` from the Frontline
  navigation still opens the sidebar's topic drawer; with no topics it shows
  `TopicsEmptyState`.
- The sidebar reads its selection from the route through
  `useKnowledgeBaseRoute` and its expanded topic from
  `kbSidebarOpenTopicIdAtom`. The tree is an accordion: at most one topic is
  open, opening a topic closes the one before it, and closing a topic only
  clears the atom when that topic is the open one. Arriving on a topic's
  route opens it, and the open topic survives moving between that topic's
  pages. It queries `TOPICS` (with nested
  categories) without the search/brand filters — the articles search box must
  never filter the tree. Article, category and topic writes all refetch
  `TOPICS`, so tree titles and per-category article counts stay live.
- The sidebar is an erxes-ui `Sidebar.Panel` (collapsible, `w-60`, its own
  open state) without a `label`, laid out like the `AppLayout` sidebar on
  the Tickets/Forms pages: `KnowledgeBaseLayout` puts the panel full height to
  the left of the `PageContainer`, so its first row — "Knowledge Base"
  (`text-sm font-medium`, `h-12` to line up with `PageHeader`) with a `size-8`
  `Sidebar.PanelTrigger`, with the ghost `+` (new topic) beside it — sits
  beside the page header, followed by a `Separator` that continues the page
  header's rule. There is no second "Knowledge bases" heading under it; the
  panel's built-in `label` is not used either, because its mono face differs
  from the other headings. When collapsed the panel still portals its expand trigger
  into the page header's `data-sidebar-panel-slot`.
  The panel resizes like the `erxes-ui` `AppLayout` sidebar: `sidebar/components/KbResizeHandle`
  (same drag/keyboard/double-click behaviour) sits on its right edge —
  drag or arrow keys between `KB_SIDEBAR_MIN_WIDTH` (180) and
  `KB_SIDEBAR_MAX_WIDTH` (480), double-click to reset. The width lives in
  `kbSidebarWidthAtom` (`atomWithStorage` under `frontline:kb-sidebar-width`,
  `null` = the panel's default `w-60`) and is passed as an inline `width`;
  the panel's width transition is switched off while `kbSidebarResizingAtom`
  is set, and its collapsed `w-0!` still wins over the inline width. The panel
  keeps its children mounted while collapsed, so the topic and category
  drawers inside it still open from `?createTopic=true`. The `+` opens
  the full `TopicDrawer` sheet (every topic field, including appearance), and
  creating or editing a category from the sidebar opens the full
  `CategoryDrawer` sheet — never a reduced create dialog for either. A topic
  row has one `...` button, shown on hover, that opens a dropdown through
  `KbSidebarRowActions` (new category, manage categories, settings — a topic
  is deleted only from its `kbsettings` danger zone). A category row has no
  dropdown: `CategoryRowActions` shows two inline icon buttons on hover or
  focus — pencil (edit, opens `CategoryDrawer`) and trash (delete, confirms
  first, turns destructive on hover) — `size-5` with `size-3.5` icons and a
  `title`. A topic row
  uses the default `Sidebar.MenuButton` size (`h-7`) with the title only — no
  chevron and no topic icon (a deliberate exception to the expandable-row
  chevron rule above, asked for by the product owner), and there is no "All
  articles" child — the topic
  row is that link. Opening and closing copies core-ui's
  `NavigationDisclosure` (settings sidebar) through the plugin's own
  `sidebar/components/KbDisclosure`: a `grid-rows-[0fr]`/`[1fr]` transition
  (250ms, `cubic-bezier(0.22,1,0.36,1)`) with an opacity fade, children
  mounted on first open and kept mounted afterwards. The topic row is a plain
  `Sidebar.MenuButton` with `aria-expanded`/`aria-controls`, not a Radix
  `Collapsible` — `Collapsible.Content` unmounts on close and cannot run that
  transition. Clicking a topic that is not
  showing its full article list (another topic, or the current one while a
  category or `categories`/`kbsettings` is open) opens it — closing the
  previous one — and navigates to `/:topicId/articles` in a transition whose
  `isPending` already counts as active, so the row reacts on click.
  Clicking the topic while its full list is showing only toggles it. The
  current topic row is `isActive`, and erxes-ui's `Sidebar.MenuButton` turns
  an active row that holds a `Sidebar.Sub` into the grey group highlight
  (`bg-foreground/5`) — so an open current topic is grey and the selected
  category inside it is the purple pill. Never recolour the topic row from
  the plugin; that shared group rule owns it. Hovering
  or focusing a non-current topic row prefetches that topic's
  `ARTICLES`, `CATEGORIES` and `TOPIC_DETAIL` through `usePrefetchTopic`, so
  its articles usually open from the Apollo cache. The prefetch builds its
  variables with the same `articlesQueryVariables` /
  `categoriesQueryVariables` the page hooks use — change those builders,
  never hand-copy the variables, or the prefetch stops hitting the cache.
  Topic and category rows are `rounded-sm` and press with
  `active:bg-primary/10`. Categories render as a real tree: `groupCategoriesByParent` (sidebar `utils/`) groups them by parent,
  sorted by title, re-attaching orphans and cycles to the root so none is lost
  or rendered twice, and `CategoryTreeItem` recurses into a bordered
  `Sidebar.Sub` per level. Category rows show title and an article-count pill
  only, no category icon, muted until hovered or active; on hover or focus
  the pill hides and the row reserves `pr-12` so the title truncates before
  the two icons. Each hover group is `group/kb-row` on the
  row itself (the topic row's wrapper `div`, the category `SubItem`), never the
  enclosing `group/menu-item`, so hovering a category never reveals its topic's
  menu. Deleting the selected category returns to its topic's articles.
  Category deletion goes through `useConfirmRemoveCategory`, shared with the
  categories table.
- `FrontlineSubGroups` renders nothing for `/frontline/knowledgebase`: topics
  are navigated from the knowledge base's own sidebar panel, never from a
  second navigation column.
- The topic, category and article sheets group their fields into `InfoCard`
  sections inside a `ScrollArea`, the same shape the help center drawer uses —
  a new field joins a section, it does not sit loose in the form. The topic
  settings page uses the same sections (General and Appearance on the left,
  Installation and Danger zone on the right). The article sheet is the wide one
  (`sm:max-w-5xl lg:max-w-6xl xl:max-w-[92rem]`) and splits into two columns
  from `lg`: Content on the left, Publishing and Media stacked on the right, so
  the editor never sits at the bottom of a long scroll.
- `TopicColorField`'s label comes from `kb-color-required`, which already ends
  in `*`; never add a second asterisk around it (the help center appearance tab
  renders the same component).
- A category's `icon` is a free-form string in Mongo, and older data uses names
  the picker's `ICONS` list may not carry (`rocket`, `credit-card`, `lock`, …).
  `IconPicker` therefore shows an unknown stored value as itself instead of the
  "Select icon…" placeholder, so a row never looks empty and an unrelated edit
  never silently drops it. Add a missing name to `ICONS` rather than rewriting
  the stored value. Its `variant="table"` renders through
  `RecordTableInlineCell.Trigger`, so an icon cell carries no button border.
- Knowledge base tables are tuned for switching topics without a hitch; keep
  these when touching them. `KbRecordTable` mounts rows in batches of
  `PROGRESSIVE_BATCH_SIZE` (20) through `shared/hooks/useProgressiveRows`,
  restarting only when its `resetKey` (the topic id) changes, so an inline
  edit's refetch never shrinks the list. Smaller batches cost more, because
  erxes-ui rows are not memoised and each batch re-renders the earlier rows.
  Per-row text uses `shared/components/KbOverflowText`, which renders a plain
  truncated span and swaps in erxes-ui's `TextOverflowTooltip` only on hover —
  never put `TextOverflowTooltip` straight into a table cell, since every
  instance runs its own timer and forced layout. `ArticlesRecordTable` is
  `memo`ised and memoises its `KbRecordTable` element, so the `Articles` page
  must pass stable callbacks and must not subscribe to `ARTICLES` itself (the
  mutations already refetch it).
- Topic, category and article `code` sit behind a **sparse** unique index, so a
  missing code is fine but an empty string `""` counts as a value and the
  second one fails with `E11000`. Every topic and category write
  (`useSaveTopic`, `useSaveCategory`, `useEditCategoryField`) passes its doc
  through `utils/withoutEmptyCode`, which drops a blank code; a new write path
  must do the same.
- `KnowledgeBaseCategory` has **no** `topicId` field — selecting one makes the
  whole query fail with a 400. A category's topic comes from the route
  (`useParams().topicId`), and that is what an edit sends back in the doc.
- Knowledge base GraphQL operation names are prefixed `frontlineKb*`
  (`frontlineKbTopics`, `frontlineKbArticleDetail`, `frontlineKbCategoryEdit`, …)
  even though the fields they select are the shared `knowledgeBase*` ones —
  `content_ui` queries the same fields, and operation names must stay unique
  repo-wide.
- `knowledgeBaseArticlesEdit` takes a whole `KnowledgeBaseArticleDoc` with a
  required `content`, so an inline cell edit must re-read the article detail
  first (`useEditArticleField` does) and never send a doc built from the list
  row alone — that would blank the article body.
- The backend paginates topics, categories and articles with `page`/`perPage`;
  there is no cursor query for them. Knowledge base tables therefore use
  `RecordTable.Scroll` with the `*_PER_PAGE` constants, not
  `RecordTable.CursorProvider`.
- A topic's three sections are switched only by the `ToggleGroup` tabs that
  `KnowledgeBaseLayout` renders after the topic in the header breadcrumb (the
  contacts header pattern); there is no knowledge base sidebar. Add a new
  section to `SECTIONS` there and to `TKnowledgeBaseSection`, never as a
  second navigation surface.
- A parent category's article count is its own plus every descendant's
  (`countCategoryArticles`), and `useArticles` filters a `categoryId` by
  `getCategoryWithDescendantIds`, waiting for the topic's categories before it
  queries. Keep the table badge and the filter on these helpers so they never
  disagree.
- Article status is a filter-popover item and filter-bar chip, like category;
  do not promote it to a separate tab strip beside the filter.
- `ARTICLE_STATUSES` lists every status for labels, the filter and the drawer;
  `QUICK_ARTICLE_STATUSES` drops `scheduled` for the inline status cell and the
  bulk command bar, because scheduling needs a date — the cell's `Schedule…`
  item opens the drawer instead. The drawer sends `scheduledDate` only while
  the status is `scheduled`; `useUpdateArticle` resends the stored
  `scheduledDate` so an inline edit of a scheduled article passes the backend's
  date check.
- `C` is wired through `shared/hooks/useKbCreateHotkey`, which sets the page
  scope (`TopicsPage`, `ArticlesPage`, `CategoriesPage`) and switches to
  `KnowledgeBaseHotKeyScope.FormSheet` while a drawer is open. The erxes
  hotkeys fire inside content-editable elements by default, so a page must
  never keep its page scope while the article editor is open. A header button
  that shows `<Kbd>C</Kbd>` must have this hook on its page.
- Every article write goes through `useUpdateArticle` in
  `articles/hooks/useArticleMutations.ts`: it re-reads the detail and sends the
  whole doc with the patch on top. Inline edits and command bar bulk edits
  (`useBulkEditArticles`) both use it; a patch touching `status` or
  `categoryId` refetches the article and category lists, because the row may
  leave the current filter and category counts change.
- `useDuplicateArticle` copies an article as a `draft` titled
  `<title> (copy)`, rebuilding every attachment through `toAttachmentInput` —
  query results carry `__typename`, which `AttachmentInput` rejects.
- Articles load `ARTICLES_PER_PAGE` at a time. `useArticles` exposes
  `hasMore` / `handleFetchMore` (next `page`, de-duplicated by `_id`), and
  `KbRecordTable` renders an in-view skeleton row that loads the next page.
  A refetch after a write resets the list to the first page.
- `Articles` opens the create drawer once when the URL carries
  `createArticle=true` (with `categoryId` preselecting the category), then
  clears the param; the category row action links there.
- The articles table reads left to right as identity, placement, state, reach,
  freshness, author, then summary: `title`, `categoryId`, `status`,
  `viewCount` (right-aligned, locale-formatted, muted at zero),
  `modifiedDate`, `createdUser` (avatar + name), `summary` (muted). Status
  badges are `success` for published, `warning` for draft and `secondary` for
  archived — archived is retired, not an error.
- Every knowledge base list refetches after a write (`refetchQueries`, or
  `client.refetchQueries` for bulk deletes) so a create, edit or delete shows up
  without a manual refresh.
- A category's `topicId` and parent, and an article's `topicId` and
  `categoryId`, always come from the knowledge base picked in the drawer (the
  route topic by default); changing that topic clears the parent or category.
  Inline edits, bulk edits and duplicates keep the route topic. The category
  drawer sends `parentCategoryId: ''` for "No parent category" — an omitted
  field would leave the old parent in place.
- The categories page's `useCategories` call uses `cache-and-network` with
  `nextFetchPolicy: 'cache-first'`, so counts changed by a write on another
  page refresh when it opens. The topics and articles lists load one page
  (`TOPICS_PER_PAGE` / `ARTICLES_PER_PAGE`) and stay current through the
  writes' `refetchQueries`; there is no load-more.
- Message reactions are read through `getMessageReactions` /
  `findOwnReaction` in `conversation-messages/utils/message.ts`
  (`reactions`, falling back to `extraData.reactions`); do not re-derive the
  fallback in components or hooks.
- Image clipboard copies reuse `isImageAttachment`, `canCopyAttachment` and
  `toPngBlob` from `conversation-messages/utils/copyAttachment.ts`; the
  Instagram proxy path only adds the `frontlineInstagramCopyImage` fallback.
- Instagram send/reaction toasts map provider errors through ordered
  `InstagramErrorRule` lists; adding a case means adding a rule with its own
  `instagram-*` i18n key, keeping existing keys and fallback copy unchanged.
- GraphQL documents interpolate no string snippets: codegen drops `${...}`
  text, so an interpolated selection is sent at runtime but missing from
  validation and the generated types. A shared field set is a `gql` fragment
  defined in this plugin. In a `gql()` document from `~/gql` it is spread by
  name only and never interpolated; the generated document embeds it
  (`ReportChartFields`). The inbox message inserted and updated
  subscriptions share `FrontlineConversationMessageFields`, so an update
  replaces a message with the same full shape. `GetTickets`,
  `ticketListChanged`, `CreateTicket`, `GetTicket` and `ticketChanged` share
  `FrontlineTicketFields` (`ticket/graphql/fragments/ticketFields.ts`), so a
  pushed or created ticket written into the list carries every field the
  list selects.
- Every module is typed from the schema: each document is
  `` gql(`...`) `` from `~/gql`, Apollo hooks take no type arguments, hook
  options are typed as `QueryHookOptions<XQuery, XQueryVariables>` from
  `~/gql/graphql`, and response types derive from the generated query types.
  `eslint.config.js` enforces this with operation_ui's rules:
  `no-restricted-imports` rejects `graphql-tag` and `gql` from
  `@apollo/client`, and `no-restricted-syntax` rejects type arguments on
  `useQuery` / `useMutation` / `useSubscription` / `useLazyQuery` /
  `useSuspenseQuery` and `subscribeToMore`. `src/gql/**` is ignored.
  The `~/gql/graphql` type import goes after the `@apollo/client` import;
  the migration's `rg` check otherwise reads across the two imports and
  reports a false hit.
- Integration types derive from the generated queries: `IIntegration` is the
  `Integrations` list row (record tables use `CellContext<IIntegration>`),
  `IIntegrationDetail` is `integrationDetail`, and `IIntegrationType` /
  `IIntegrationTypeByChannel` are the used-types entries.
- Status types derive from the generated queries: `ITicketStatus` is a
  `GetTicketStatusesByType` row, `ITicketStatusDetail` is `getTicketStatus`,
  `ITicketStatusChoice` is an accessible-status choice and
  `ITicketStatusPermissionChoice` (aliased by the pipelines `StatusItem`) a
  pipeline choice with its member lists. `useGetTicketStatus(type)` reads the
  pipeline from the route. `useGetAccessibleTicketStatuses` and
  `useGetTicketStatusesByPipeline` take `variables?: { pipelineId?: string |
null }`, fall back to the route pipeline and skip without one; never pass
  them `channelId`, which neither query declares.
- `GetTicketStatus` (`useGetTicketStatusById`) selects `type` and `color`,
  which the report status filter chip renders as the status icon.
- A hook that compacts a generated list (`useTickets`, `useGetPipelines`,
  `useGetTicketConfigs`, the channel hooks, `useFormsChannelList`) memoizes the
  result on the Apollo field. The ticket board copies `tickets` into jotai atoms
  from an effect keyed on that array, so a fresh array per render loops the
  board and starves navigation updates.
- Ticket types derive from the generated documents: `ITicket` is
  `FrontlineTicketFieldsFragment` (list rows, created tickets and board
  cards) and `ITicketDetail` is `getTicket`, which adds `isSubscribed` and
  `attachments`; the detail sheet's `TicketFields` and `TicketDetailActions`
  take `ITicketDetail`. Only `_id` is non-null; pass nullable ids on as `?? ''`
  or `?? undefined` and read id lists with `compactList`. `useTickets` takes
  filter-shaped `variables: ITicketFilter`, like operation's `useTasks`.
  Ticket attachments go through `toTicketAttachments` / `toAttachmentInput`
  (`ticket/utils/ticketAttachments`), never `removeTypename`.
- Pipeline types derive from the generated queries: `IPipeline` is the
  `GetTicketPipelines` list row and `IPipelineDetail` is
  `getTicketPipeline`. Only the detail selects `userId`, `visibility` and
  `memberIds`, so `useTicketPermissions` takes an `IPipelineDetail` from
  `useGetPipeline`. Pipeline id lists (`memberIds`, `departmentIds`,
  `excludeCheckUserIds`, …) are `[String]` in the SDL; read them with
  `compactList`. `IConfig` is a `TicketConfigs` row and
  `ITicketConfigDetail` is `ticketConfigDetail`; `ConfigsForm` turns a
  loaded config into form values with `toPipelineConfigFormValues`.
- Conversation types derive from the generated queries: `IConversation` is
  the `Conversations` list row, `IConversationDetail` is
  `conversationDetail`, and `IConversationIntegration` is a list row's
  integration. `ConversationContext` holds `IConversationContextValue`, which
  is a list row, a detail, or both merged; detail-only fields are optional
  there. Providers map `customer` to `ICustomerInline` with
  `toCustomerInline` (rows without a customer `_id` show no customer), and
  detail views build the value with `toConversationContextValue`, whose
  `integration` comes only from `IntegrationInline`. Never cast a merged
  conversation.
- `conversationCounts` stays `JSON` (numbers keyed by integration id, kind or
  filter name); read it with `readCountMap` / `readCount` from
  `inbox/conversations/utils/conversationCounts`. `propertiesData` is narrowed
  with `isRecord`, and convert system field `logics` with `readLogicRules`.
  Date filter variables go out as ISO strings through `getDateFilterVariable`.
- `Conversation.automatedReplyControl` is an object type; select
  `{ status pausedUntil reason updatedAt updatedBy }`. Mutations whose
  optimistic response or cache write needs the type select `__typename`
  explicitly (mark as read, edit custom fields).
- The customer progress hooks have no live subscription: `conversationChanged`
  needs a conversation `_id`, and the progress queries are per customer.
- Discord hooks in `useDiscordSetup` infer from the `gql()` documents and drop
  null list items with `compactList`. `DiscordConversationChannel` is the
  `discordConversationChannels` row; consumers default its nullable
  `channelName` and a participant's `avatar` where they render. A participant's
  `userId` and `name` are non-null in the schema. `DiscordChannelsNav` reads
  the typed `CONVERSATION_COUNTS` through `readCountMap`. Discord repair sends
  `discord-messenger` when the route has no integration type.
- `facebookGetPost` and `instagramGetPost` return `attachments` as image URL
  strings (`[String]`), not attachment objects. `FacebookPostTrigger`,
  `IgPostTrigger` and `PostMediaCard` drop null entries with `isDefined` and
  use each string as the image source.
- Messages reach the renderers only through `toMessage`
  (`inbox/conversation-messages/utils/toMessage`): every message hook (inbox,
  pinned, form widget, Facebook, Instagram) maps its generated rows with it,
  while subscriptions and `updateQuery` keep writing the generated rows.
  `IMessage` is that normalized shape: nulls are `undefined`, `content` and
  `createdAt` are strings, and JSON is parsed by the lenient zod schemas in
  `inbox/types/messageSchema.ts`, whose outputs are the message sub-types
  (`IMessagePoll`, `IMessageEmbed`, `ITelegramMessageData`, ...). Each leaf
  falls back on its own and objects pass undeclared keys through, because
  forwarding sends snapshots back to the server. A reply without a
  `messageId` and a reaction without a `senderId` are dropped.
  `formWidgetData` and `botData` pass through unparsed; Facebook rows add
  `toFacebookMessageExtras` for `botData`, `source` and `relatedMessage`.
  Facebook reply delivery is read from the add mutation's `extraData` with
  `readFacebookDelivery`.
- Mail internal notes also pass through `toMessage`; pagination and
  subscription-triggered merges retain the generated query rows in Apollo.
  Mail thread rows use their own generated `MailMessage` selection, whose
  optional stored fields remain nullable. Known delivery strings are narrowed
  with `toMailDeliveryStatus` before rendering a delivery badge.
- Each pipeline mail mutation hook passes its generated document directly
  to `useMutation`, preserving its result and variable inference. Only toast
  callbacks and the awaited integration refetch options are shared through
  `usePipelineMailMutationOptions`; never widen a generated document to
  untyped `DocumentNode` in a helper.
- `IResponseTemplate` is the `ResponseTemplates` list row; `name`, `content`
  and `channelId` are nullable because the Mongoose schema requires none of
  them. Template pickers (inbox suggestions, `ResponseTemplateSelector`, note
  suggestions) read rows through `toResponseTemplateText`, which defaults
  `name` and `content` to `''`. Creating a template opens its detail page from
  `responseTemplatesAdd._id`.
- Facebook and Instagram message queries select `__typename`, because their
  subscriptions write inbox messages into those lists under the provider
  typename.
- Integration hooks drop null list items with `compactList` and adapt
  `PageInfo` through `@/shared/utils/cursorList`. Query variables follow the
  `id ? { ... } : undefined` plus `skip` pattern; `channelId` is required by
  the `Integrations` query.
- `Integration.details` stays `JSON` because its shape depends on the kind.
  Readers narrow it with `isRecord` from `@/shared/utils/isRecord` (a copy of
  operation's) and `typeof` checks, never casts; `MailIntegrationDetail` reads
  `details.data`.
- `useIntegrationEditField` sends only the edit mutation's variables (`_id`,
  `name`, `channelId`, `brandId`); a null row `channelId` goes out as `''`,
  which keeps the integration's channel. The detail query selects `channelId`,
  which the Facebook, Instagram, mail and Discord edit forms send back.
- Report outputs stay nullable as the schema declares them, except the call
  report's `day` fields, which `frontline_api` declares non-null. Null list
  items are dropped with `isDefined` from `erxes-ui`, either in the hook or in
  the component that maps the list, before anything renders or computes.
  Components default null scalars where they render or compute. Tightening a
  report output to non-null is a `frontline_api` contract change, not a UI
  cast.
- Call notes stream through `CALL_CONVERSATION_NOTE_INSERTED`
  (`CallConversationNoteInserted`), the call module's own subscription to
  `conversationMessageInserted` with exactly the note selection.
  `useCallConversationNotes` consumes it with `useSubscription` and writes the
  note into the `callConversationNotes` cache entry with `cache.updateQuery`;
  it does not share the inbox `CONVERSATION_MESSAGE_INSERTED` document.
- Call integrations come back typed: `operators` is `[CallOperator]`,
  `callsGetConfigs` is `[CallConfig]` whose `value` is `JSON` (only string
  values become `callConfigs` entries), `callExtensionList` is
  `[CallExtension]`, and `callQueueList` is `[CallQueueStatistic]`. Call hooks
  that return a list drop null rows with `isDefined`, and components default
  null integration fields where they render.
- Facebook bots share one selection: the `FacebookMessengerBotListFields`
  fragment in `integrations/facebook/graphql/queries/facebookBots.ts` backs
  `FACEBOOK_BOTS_LIST` and both bot save mutations, so a saved bot is written
  into the list cache with every field the list reads. A save mutation never
  selects less than that fragment. `IFacebookBot` is the fragment type,
  `IFacebookBotDetail` the form query and `IFacebookBotProfile` the trigger
  profile query.
- Instagram bots save through `ADD_INSTAGRAM_BOT` / `UPDATE_INSTAGRAM_BOT`,
  whose results stay `JSON`, so a save refetches `INSTAGRAM_BOTS_LIST` and
  `INSTAGRAM_BOTS_TOTAL_COUNT` instead of writing the cache. `IInstagramBot` is
  the list row, `IInstagramBotDetail` the form query (also the form context's
  `instagramMessengerBot`) and `IInstagramBotProfile` the trigger profile
  query.
- Knowledge base documents share the `FrontlineKb*Fields` fragments in
  `knowledgebase/graphql/queries.ts`, spread by name. `ITopic`, `ICategory`,
  `IArticle` (list rows), `ITopicDetail`, `IArticleDetail` and
  `IKnowledgeBaseTopic` (the messenger FAQ preview's topic content) are derived
  from those queries; `ITopicDoc`, `ICategoryDoc` and `IArticleDoc` stay the
  local input shapes. `ICategoryFields` is `FrontlineKbCategoryFieldsFragment`,
  the category embedded in a topic: the sidebar tree, `CategoryDrawer` and
  `groupCategoriesByParent` (generic over `TCategoryNode`) take it, and
  `ICategory` adds `authors`. `withoutEmptyCode` and `useConfirmRemoveCategory`
  accept the schema's `null`. `useTopics`, `useTopicOptions`, `useCategories`
  and `useArticles` memoize their filtered lists, because the knowledge base
  tables and sidebar memoize on them. A topic's brand is read from
  `brand._id` (the schema has no `brandId` output).
- Help center documents share the `HelpCenterConfigFields` and
  `CustomDomainFields` fragments, spread by name. `IHelpCenter` is
  `HelpCenterConfigFieldsFragment`, `ICustomDomain` is
  `CustomDomainFieldsFragment`, and the CMS, client portal, form and topic
  option types are derived from their option queries. The config input,
  styles, header and footer interfaces stay the local form/input shapes;
  `toHelpCenterConfigInput` drops null list items and defaults null scalars
  when it turns a stored config into that input.
- Cursor lists typed from the schema go through
  `@/shared/utils/cursorList` (a copy of operation's adapter): the shared
  `PageInfo` SDL from `erxes-api-shared` declares its booleans nullable, while
  the `erxes-ui` record table helpers need booleans. Hooks read rows with
  `compactList`, page info with `toCursorPageInfo`, and merge `fetchMore`
  pages with `mergeCursorList`. Delete the adapter once the shared `PageInfo`
  is non-null.
- Ticket activities stream through `useSubscription(ACTIVITY_CHANGED)` with
  `ignoreResults`: `created` appends to the `getTicketActivities` cache entry
  and bumps `totalCount`, `removed` evicts the `TicketActivity` and lowers
  it, and `updated` lands through the normalized cache. `IActivity`, `INote`,
  `ITicketNoteAttachment`, `ITicketNoteMailDelivery` and `ITicketReplyTarget`
  are derived from the activity and note documents; a read-only note renders
  its stored attachments with their nullable fields rather than as
  `IAttachment`.
- Form `leadData` stays `JSON` (the frontline widgets read it too); the form
  UI reads it only through `LEAD_DATA_SCHEMA`, whose every leaf falls back on
  its own so a malformed value never drops the rest of a form. `IForm` is a
  forms-list row, `IFormDetail` the form detail, and a stored field validator
  is narrowed through `FIELD_VALIDATOR_SCHEMA`. A form's `numberOfPages` is the
  number of steps in its `steps` record.
- An Erxes Messenger's `messengerData` and `uiOptions` stay `JSON` (the
  messenger widget and the shared integration detail read them as scalars);
  the setup reads them only through `EM_MESSENGER_DATA_SCHEMA` /
  `EM_UI_OPTIONS_SCHEMA`, where every leaf, list item and map entry falls back
  on its own. `IEMIntegrationDetail` is the setup's integration detail.
- An Erxes Messenger needs a brand: `EM_CONFIG_SCHEMA.brandId` is required,
  matching the `brandId: String!` of the create, edit and save mutations
  (the brand field's own `rules` never ran under `zodResolver`). The create and
  edit variables carry only the arguments those mutations declare; ticket
  configs go through `integrationsSaveMessengerTicketData`.
- Facebook and Instagram config hooks keep only string config values, the
  same way `useCallGetConfigs` does. Facebook integration repair always sends
  a `kind` (the route's integration type, falling back to
  `facebook-messenger`, the same kind its re-auth URL uses).
- Knowledge base article attachments follow `AttachmentInput`: `name` is
  required on input though nullable on output, so the article drawer and
  article duplication map stored attachments through `toKbAttachment`
  (`knowledgebase/utils`; null `name` becomes `''`) before they reach the form
  or a mutation.
- Facebook and Instagram bot tables read a row's `account` / `page` name from
  `cell.row.original` (falling back to `-`), never from a cast of
  `cell.getValue()`.
- Bot persistent menus and ice breakers without an `_id` cannot be targeted by
  a trigger, so Facebook and Instagram trigger code drops them with
  `hasBotItemId` (`widgets/automations/modules/facebook/components/bots/utils`).
  The bot forms narrow a stored menu `type` and `tag` through
  `facebookBotFormSchema` / `instagramBotFormSchema` instead of casting.
- `useFacebookBotAutomations` reads core `automations` triggers, whose
  `config` is core-owned `JSON`; `isBotTriggerConfig` narrows it before the
  bot id is compared.
- `useTransferCall` refetches the extension list by its document
  (`CALL_EXTENSION_LIST`), not by an operation-name string.
- `ReportChartFilters` is the `TicketReportFilter` input a card builds and
  sends; `SavedReportChartFilters` is the `ReportChartFields` selection a card
  restores from. Restoring reads the saved shape and drops null items before
  setting the filter atoms, and applies `visualType` only when
  `isResponsesChartType` accepts it.
- `useTicketList` normalizes `reportTicketList` once (`toTicketList`,
  memoized on the Apollo field): null rows are dropped and counts and pages
  default, so `TicketList`, its columns and the fetch-more merge read a
  non-null shape. The list columns pass nullable member ids and descriptions
  on as `undefined`.
- The call SLA missed reason is the schema's `String`, so
  `getMissedReasonMeta` in `report/call/components/SlaSection/slaUtils.ts`
  falls back to neutral metadata for a reason without an entry in
  `MISSED_REASON_META`.
- `CustomLegendContent` takes recharts' `DefaultLegendContentProps` handler
  signatures (`data`, `index`, `event`), so a `Legend` content callback is
  written `(props) => <CustomLegendContent {...props} />` with no annotation.
  Item enter reports that item; leaving the legend container reports the last
  hovered item, so a pie chart's highlight clears only when the pointer leaves
  the legend.
- `src/gql/` is generated and gitignored; `build` and `serve` depend on the
  `codegen` target, which depends on `gateway:schema:compose`. Build inputs hash generated TypeScript through `dependentTasksOutputFiles` so backend schema changes invalidate the bundle.
  `pnpm dev:uis` starts remotes without `dependsOn`, so
  `scripts/start-ui-dev.js` runs `codegen` once and then `codegen:watch`
  beside the dev server. `codegen:watch` has no `dependsOn` and stays out of
  `serve`, because a watcher never exits.
- Codegen reads only `backend/gateway/generated/schema.graphql`. Change public contracts in their owning backend; generated SDL is ignored and regenerated through Nx.
- Operation names are unique within the plugin even ignoring case, because
  codegen PascalCases them into type names. `refetchQueries` strings name
  operations, so a rename updates them in the same change.
- A document variable is non-null wherever the frontline_api argument is:
  `ConversationMessageAdd($conversationId)`, `ConversationMarkAsRead($id)`,
  `ResponseTemplatesEdit($id)`, `TicketCreateNote($contentId)`,
  `AddTicketStatus($type)`, and `[String!]!` for
  `ChannelAddMembers($memberIds)` and `FormsRemove($_ids)`. Codegen rejects a
  nullable variable in a non-null position, so a backend tightening changes
  the documents in the same change.
- The Facebook message-trigger condition schema is one flat object keyed by a
  `type` enum, not a discriminated union, so its derived types index the fields
  directly; `Extract<..., { type: ... }>` on it collapses to `never`.
- `Sheet.Header` is a fixed 40px row. A header with a visible second line (subtitle, record number, description) adds `h-auto py-2` so it sizes to its content; detail-page title rows are `h-10`, level with `PageHeader`.
- Every in-app `Link`/`navigate` target starts with `/frontline/…`. A relative `to="frontline/tickets…"` resolves against the current route, so each click appends another `frontline/tickets` segment (`/frontline/tickets/frontline/tickets/…`). The tickets sidebar channel rows (`TicketNavigations`) link to `/frontline/tickets?channelId=…&pipelineId=…`.

## Validation

- Smoke: open `/frontline/knowledgebase` — it lands on the first topic's
  articles. Create a topic from the sidebar `+`, add a category from its
  `...` menu, click the category and create an article in it — the tree, its count
  and the table update without a reload. Open another topic and confirm the
  previous one closes and its articles open; click a category, then the
  topic again to return to its full list; move between `articles`, `categories` and
  `kbsettings` and confirm the current topic stays open.
  Rename an article inline, change its status and category, filter by status,
  bulk-delete from the command bar, edit and delete a category from the
  sidebar, then delete the topic from its `kbsettings` danger zone.
- `pnpm nx run frontline_ui:codegen --skip-nx-cache` - validates every
  document against the composed gateway schema;
  `build` and `serve` run it first.
- `pnpm nx build frontline_ui`
- `pnpm nx test frontline_ui` — includes the knowledge base sidebar's
  `groupCategoriesByParent` and `withoutEmptyCode` specs.
- `pnpm nx lint frontline_ui` from the repository root; distinguish existing
  baseline lint failures from regressions in touched files.
- `npx tsc --noEmit -p frontend/plugins/frontline_ui/tsconfig.app.json` - no
  errors under `frontend/plugins/frontline_ui`; errors reported inside
  `frontend/libs` are pre-existing and owned by those libraries.
- `project.json` defines `build`, `serve`, `serve-static`, `test`, `codegen`
  and `codegen:watch`.
- `pnpm nx test frontline_ui` — the project defines a Jest test target for
  Telegram setup/rendering and inbox composer regression coverage.
  Composer send regression tests import `hooks/composer/useComposerSend`;
  keep them aligned with the production hook when composer paths change.
- Telegram smoke: config-page personal/team inbox links, production callback
  defaults, local tunnel validation, saved callback preservation, optional
  connection names, private/group/topic history,
  native replies, note isolation, media playback/open links, link cards and
  poll labels. Verify switching conversations during a send preserves the new
  draft, and other providers retain their reply and partial-delivery behavior.
- Telegram recovery smoke: retry setup after a lost integration-create response
  and confirm it resumes webhook registration without another integration;
  select files in quick succession and confirm the combined size guard includes
  pending uploads and releases capacity after removal or composer reset.
- Smoke (move to channel): in `frontline/settings/channels/:id`, open each of
  Integrations, Pipelines, Forms, Surveys and Response templates, use `⋮` →
  `Move to channel`, pick another channel and confirm the row leaves this list
  at once, shows up under the destination channel, and is still there after a
  reload. Select two forms and move them from the command bar; selecting forms
  from two channels on `/frontline/forms` must leave that button disabled.
- Smoke (convert): in a conversation open Convert → `Convert to a ticket`,
  `…a deal` and `…a task`; each save shows a success toast, the entry turns
  into `Go to a …`, and the customer button's side panel lists the new item
  under Tickets/Deals/Tasks.
- Smoke (help center): open `/frontline/helpcenter`, change a name inline, then
  open the drawer and pick a client portal on **General** and save a colour on
  **Appearance**; reload and confirm both persisted. The website picker must
  list each client portal once by name, and the trigger must read back that name
  after the pick, in the drawer and in the table cell alike; typing a domain in
  the picker's search must still find it. The network tab must show `helpCenterConfig` /
  `helpCenterConfigUpdate` for all three writes, `getClientPortals` only as the
  website picker's option list, and no `knowledgeBase*` operation other than the
  topic picker's option list.
- Smoke (help center CMS): with the content plugin enabled, open a help
  center's **General** tab, pick two CMSes and save; reload and confirm both
  badges return. A CMS whose client portal has no app token must be refused
  with a toast and stay unselected, and a help center saved before `cmsConfigs`
  existed must open with its old CMS already selected.
- Smoke (knowledge base embed): open a topic's `kbsettings` page and open its
  embed script dialog; the snippet must carry that topic's `_id` and
  `Copy Script` must put it on the clipboard. Editing a help center must show
  the same snippet on its own **Embed** tab for the topic picked on
  **General**, with `Copy Script` turning into `Copied!` for three seconds, a
  prompt to pick one when `kbTopicId` is empty, and no Embed tab at all while
  creating one. Paste the snippet into a plain HTML page served from another
  origin: a corner button opens the topic's categories and articles (inline
  inside a `<div data-erxes-kbase>` when the page has one).
- Smoke (knowledge base counts): on a topic's `categories` page a parent such as
  `1. ТАНИЛЦУУЛГА` shows the sum of its subcategories' articles; its badge
  opens `articles?categoryId=<parent>` listing every subcategory's article.
  The sidebar's per-category counts match those badges. In the article drawer, switching the knowledge base clears the
  category, and saving moves the article to that topic's list and counts.
  Moving a parent category from its drawer takes its subcategories and their
  articles along; the articles page's "records found" matches the topic's
  article count, duplicated articles included.
- Smoke (help center footer): on **Appearance** open the Footer card, press
  "Start from the built-in columns", rename a heading, add a link and remove
  another, then save and reload — the drawer shows what was saved and
  `localhost:3900` renders those columns. Emptying every column and saving
  brings the site's built-in Support / Knowledge base / Account columns back.
- Smoke (conversation properties): open a conversation, click the side
  widget's **Properties** tab (matches the Settings icon), edit a field
  through `FieldsInDetail` and confirm it saves and survives a reload; the
  tab renders in one column even in the widget's narrow (sheet) layout.
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
- Smoke (mail drafts): build Email Received → AI Agent → Draft Email Reply,
  mail the inbox twice, and confirm two draft cards appear without a reload,
  each naming the mail it answers; edit one and save, send it and see it join
  the thread, delete the other after confirming.
- Smoke (mail sending): with a Cloudflare account connected, open Integrations
  config and confirm the card names the domain replies leave through and shows the
  quota underneath. Break it by revoking the token's Email Sending permission and
  running _Update worker_: the card must say sending is inactive, name the step
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
  <<<<<<< HEAD

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-10-16` — Knowledge scope tree and ticket media

- **Summary:** Topic/category scope for the AI knowledge base source, attachments on the Create ticket action, audio and non-MIME ticket attachments, and covered customer media.
- **Affected areas:** `widgets/automations/modules/{knowledgebase,ticket}`, `ticket/components/attachments`, `activity/components/NoteInputReadOnly.tsx`.
- **Contracts changed:** New GraphQL operation `frontlineAiKnowledgeTopics`; knowledge source config keys `topicIds`, `categoryIds`, `articleIds`.

### `2026-10-06` — Telegram metadata promise handling

- **Summary:** Handles chat-label loader promises explicitly while preserving failure fallbacks and later recovery.
- **Affected areas:** `useTelegramChats.ts` and chat-label regression tests.
- **Contracts changed:** None.

### `2026-10-06` — Telegram setup recovery and attachment guards

- **Summary:** Recovers setup after interrupted responses, validates cumulative attachment sizes and tightens Telegram rendering hygiene.
- **Affected areas:** Telegram setup/media presentation, inbox attachment hook, documentation and regression tests.
- **Contracts changed:** None; uses existing bot queries, upload callbacks and inbox contracts.

### `2026-10-06` — Telegram review fixes

- **Summary:** Keeps disconnect usable with revoked tokens, explains unconfirmed webhook cleanup and avoids repeated URL suffix scans.
- **Affected areas:** Telegram setup, translations, link rendering, webhook URL helper and regression tests.
- **Contracts changed:** Consumes `telegramDisconnectBot` Boolean as provider-cleanup confirmation after local deactivation.

### `2026-10-06` — Telegram config entry and automatic setup defaults

- **Summary:** Adds Telegram guidance to Integrations config and derives production webhook addresses and connection names while retaining local/custom overrides.
- **Affected areas:** `src/pages/IntegrationConfigPage.tsx`, Telegram setup/config components, webhook URL helper/tests and plugin-owned translations.
- **Contracts changed:** None; existing routes and per-bot setup are reused.

### `2026-10-06` — Telegram on the native composer and message components

- **Summary:** Integrates Telegram setup and message presentation using the current inbox composer, replies and attachment renderer.
- **Affected areas:** `src/modules/integrations/telegram`, inbox provider metadata, composer hooks, message actions and integration menus.
- # **Contracts changed:** Adds the Telegram integration kind and optional message metadata; consumes the existing canonical reply mutation with Telegram provider IDs.
  > > > > > > > b5737b8f9a6f3d229cf63081569bfebc7196a29c
