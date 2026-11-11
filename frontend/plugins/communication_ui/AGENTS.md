# `communication_ui` Plugin Guide

## Identity

- **Plugin:** `communication`
- **Project:** `communication_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/communication_ui`
- **Last synchronized:** `2026-11-11`

## Scope

### Owns

- The Communication navigation group and its Messaging page at
  `/communication/messaging`: read-only staff oversight of DIRECT and GROUP
  conversations.

### Does not own

- Messaging data, authorization or audit; `communication_api` enforces them.
- Any participant messaging surface. Staff never send, edit, delete, join,
  mark read or manage members here.
- Permission group editing, which core settings provide.
  Access is explicitly assigned through Communication Messaging Viewer or a
  custom grant of `communicationMessagingViewAll`.

## Current Capabilities

- DIRECT / GROUP tabs, debounced search by group name or member, app filter,
  and a cursor-paginated conversation list with kind badges, member and message
  counts and relative activity time.
- Conversation header with a "Not a participant" indicator, a read-only
  message timeline with sender, subject, timestamp, sequence, mentions and
  attachment metadata, and older-page loading.
- Participant panel with roles, former members, read positions and unread
  counts.
- Image preview and download of bound attachments through the authorized admin
  route.
- A read-only badge and administrative oversight notice on the page; loading,
  empty, permission, audit-unavailable, not-found and error states.
- Filters and the selected conversation are kept in the URL
  (`kind`, `app`, `searchValue`, `conversationApp`, `conversationId`).
- In development, `/communication/messaging?preview=1` renders labeled sample
  data through an isolated Apollo client, with working tabs, search, app filters
  and conversation selection. Production always uses the authorized API.

## Architecture

| Area          | Path                                                                                       | Responsibility                                          |
| ------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| Config        | `frontend/plugins/communication_ui/src/config.tsx`                                         | Navigation group and module                             |
| Entry         | `frontend/plugins/communication_ui/src/modules/CommunicationMain.tsx`                      | `AppLayout`, sidebar and routes; lazy-loads the page    |
| Page          | `frontend/plugins/communication_ui/src/modules/messaging/components/MessagingPage.tsx`     | URL state, layout, read-only badge and oversight notice |
| List          | `frontend/plugins/communication_ui/src/modules/messaging/components/ConversationList.tsx`  | Tabs, search, app filter, paginated list                |
| Conversation  | `frontend/plugins/communication_ui/src/modules/messaging/components/ConversationPanel.tsx` | Header, timeline and participants                       |
| Attachments   | `frontend/plugins/communication_ui/src/modules/messaging/components/MessageAttachment.tsx` | Authorized preview and download                         |
| Access states | `frontend/plugins/communication_ui/src/modules/messaging/components/AccessState.tsx`       | Error codes to user-facing states                       |
| Data          | `frontend/plugins/communication_ui/src/modules/messaging/graphql/`, `hooks/`, `types.ts`   | Documents, Apollo hooks, types derived from codegen     |
| Preview       | `frontend/plugins/communication_ui/src/modules/messaging/preview/MessagingPreview.tsx`     | Development-only sample conversations and Apollo client |

## Contracts

### Provides

- Module Federation exposes `./config` (`CONFIG`) and `./communication`
  (`Communication`), loaded by the host for `/communication/*`.

### Consumes

- `communicationMessagingAdminApps`, `communicationMessagingAdminConversations`,
  `communicationMessagingAdminConversation`,
  `communicationMessagingAdminMessages` and
  `communicationMessagingAdminParticipants` from `communication_api`.
- `GET {REACT_APP_API_URL}/pl:communication/messaging/admin/attachments/<id>?app=<key>`
  with credentials and the `x-communication-messaging-admin: 1` header.
- `erxes-ui` layout and components, `ui-modules` `PageHeader`.

## Data and State

- Server state only, through Apollo. The conversation list uses
  `cache-and-network`; conversation, history and participant queries use
  `network-only`, so each opened view is a fresh, audited read.
- Page state lives in URL query parameters. Attachment previews are object URLs
  revoked on unmount.
- Sample data uses a separate in-memory Apollo cache and local link; it never
  requests messaging data from the API or changes the signed-in user's access.

## Local Invariants

- Never add send, edit, delete, membership, read-marking or other mutating
  controls. The page is read-only by contract.
- Keep the read-only badge, administrative oversight notice and "Not a
  participant" indicator visible.
- Visibility in navigation is not authorization; handle FORBIDDEN from the API
  as a permission state and never cache or show partial data from a failed
  request.
- Every document goes through `gql()` from `~/gql` with a unique
  `communicationMessagingAdmin*` operation name.
- Labels are plain English: the plugin has no gateway locale file.
- Keep sample data opt-in, labeled and restricted to development builds.

## Validation

- `pnpm nx run communication_ui:codegen --skip-nx-cache`
- `pnpm nx lint communication_ui`
- `pnpm nx build communication_ui`
- CI: `.github/workflows/ci-ui-communication.yml` lints and builds this remote
  against the composed schema on pull requests. Main pushes and numeric release
  tags publish it to the corresponding `communication_ui` folder in R2.
- Smoke: as staff with `communicationMessagingViewAll`, open
  `/communication/messaging`, switch DIRECT and GROUP, search, filter by app,
  open a conversation, load older messages and preview an image; as staff
  without it, see the permission state.
- Preview smoke: in development open `/communication/messaging?preview=1`,
  switch tabs, search and filter, open a conversation and refresh its timeline.
