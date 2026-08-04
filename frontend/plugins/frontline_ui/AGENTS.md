# `frontline_ui` Plugin Guide

## Identity

- **Plugin:** `frontline`
- **Project:** `frontline_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/frontline_ui`
- **Last synchronized:** `2026-08-04`

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
- Facebook bot message action supports a drag-orderable message sequence of
  text, card, quick replies, input, image, attachments, audio, and video, with
  postback/link buttons and optional connects.
- Caps the Facebook message sequence at one message when the action is attached
  to a comment trigger, and explains why in the sequence header.

## Architecture

| Area                | Path                                                              | Responsibility                                             |
| ------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| Host registration   | `src/config.tsx`                                                  | `CONFIG` — navigation, settings, widgets, property inputs   |
| Federation          | `module-federation.config.ts`                                     | Remote name `frontline_ui` and its exposes                  |
| Routes              | `src/modules/FrontlineMain.tsx`, `src/pages/`                     | Routed pages for inbox, ticket, forms, call, channels       |
| Settings            | `src/modules/FrontlineSettings.tsx`                               | Settings routes                                             |
| Inbox               | `src/modules/inbox/`                                              | Conversations, channels, brands, integrations               |
| Ticket              | `src/modules/ticket/`, `src/modules/pipelines/`, `src/modules/status/` | Ticket boards, pipelines, statuses                     |
| Forms               | `src/modules/forms/`                                              | Form builder, preview, submissions                          |
| Knowledge base      | `src/modules/knowledgebase/`                                      | Topics, categories, articles                                |
| Automation widgets  | `src/widgets/automations/modules/<module>/`                       | Per-module trigger/action/bot/history components            |
| FB message action   | `src/widgets/automations/modules/facebook/components/action/`     | Message sequence form, provider, constants, states          |
| Notifications       | `src/widgets/notifications/`                                      | Notification remote entries                                 |

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
- Jotai is reserved for plugin-wide client state; component-local state stays in
  `useState`.

## Local Invariants

- A Facebook message action attached to a comment trigger may hold exactly one
  message. The limit is derived in `getMaxMessagesForTrigger` and enforced in
  both `ReplyMessageProvider.addMessage` and the `MessageSequenceHeader` add
  buttons — keep the two in sync.
- The trigger type reaches the action form through the `trigger` prop already
  present on `AutomationActionFormProps`; do not add a shared-library field to
  obtain it.
- Remote entries must switch on the node type via `splitAutomationNodeType` and
  return `null` for unknown content types.
- Exposed modules stay lazy-loaded and wrapped in `Suspense`.
- Routed pages use `h-full`, never `h-dvh`/`h-screen`.
- New user-facing strings need a key in the gateway-owned `frontline` locale
  files; that is a repository-level change and must be requested explicitly.

## Validation

- `pnpm nx lint frontline_ui`
- `pnpm nx build frontline_ui`
- No `test` target is defined in `project.json`; do not invent one.
- Smoke: in the automation builder attach a Facebook message action to a
  `frontline:facebook.comments` trigger and confirm the sequence header shows
  the single-message notice and every "Add …" button is disabled once one
  message exists; attach the same action to a `frontline:facebook.messages`
  trigger and confirm five messages are still allowed.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

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
