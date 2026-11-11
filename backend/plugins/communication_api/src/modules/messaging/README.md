# Private messaging integration

DIRECT and GROUP messaging is the `messaging` module of the `communication`
plugin (`backend/plugins/communication_api`). The plugin runs as its own
service with no dependency on another plugin. Applications call GraphQL
through the gateway with their existing clients. Its admin pages live in
`frontend/plugins/communication_ui`.

## Public API naming

The canonical namespace is `communicationMessaging*`: 8 queries, 12 mutations
and 1 subscription, with `CommunicationMessaging*` types. The same
`communication:messaging` / `COMMUNICATION_MESSAGING` naming covers the
`x-communication-messaging-token` header, environment variables, collections and
Redis keys. Messaging verifies its own app credentials and does not use Client
Portal identity.

The names following `query`, `mutation` or `subscription` in the copyable examples
are client operation labels; the selected root field names are the API contract.
Renaming a client operation label does not rename a schema field. A future
approved API version that renames a field first adds the new field on the same
authorized resolver, deprecates the old one, and removes it only under an
approved breaking-change policy.

Authentication uses a verified access token in `x-communication-messaging-token`.
`communicationMessagingRegister` enrolls that authenticated identity; it is not a
password login or token-issuing operation. `communicationMessagingMe` returns its
app feature flags and member profile. Application configuration and Firebase
credentials are server-side configuration, not GraphQL configuration mutations.

## Server configuration

Set `COMMUNICATION_MESSAGING_APPS` to a JSON array. An empty array disables app
admission and the messaging worker. Configuration is deployment-owned and is
loaded once per process. Restart the Communication service after changing it.

Each entry has this shape. Replace the public-key placeholder with a PEM-encoded
RSA public key, retaining escaped newlines inside JSON.

```json
[
  {
    "tenant": "organization-a",
    "appId": "mobile-one",
    "issuer": "https://identity.example.com",
    "audience": "organization-a-mobile-one",
    "keys": { "key-2026": "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----" },
    "direct": true,
    "group": true,
    "storage": {
      "bucket": "private-messaging-files",
      "region": "us-east-1",
      "credentialEnv": "COMMUNICATION_MESSAGING_STORAGE_MOBILE_ONE",
      "maxBytes": 10485760,
      "mimeTypes": ["image/png", "image/jpeg", "image/gif", "application/pdf"]
    },
    "push": {
      "projectId": "mobile-one-firebase",
      "credentialEnv": "COMMUNICATION_MESSAGING_FCM_MOBILE_ONE",
      "deepLinkBase": "https://mobile-one.example.com/messages"
    }
  }
]
```

Add another entry for each application. `(tenant, appId)` and
`(issuer, audience)` pairs must be unique across this deployment. Apps in the
same tenant use distinct audiences. A second tenant can reuse an appId with a
distinct audience.

| tenant         | appId      | audience                  |
| -------------- | ---------- | ------------------------- |
| organization-a | mobile-one | organization-a-mobile-one |
| organization-a | mobile-two | organization-a-mobile-two |
| organization-b | mobile-one | organization-b-mobile-one |

In SaaS, tenant is the provisioned erxes organization
subdomain. In self-hosted mode, tenant is a server-chosen scope in the configured
database. All queries additionally include both tenant and appId.

Pinned RSA keys must be at least 2048 bits. During rotation, retain the old
public key by its kid until its access tokens expire. Restart the configured
instances after deploying a key change.

Storage and push are optional. Omit their configuration to disable the feature.
The storage secret environment variable contains AWS credentials as JSON with
`accessKeyId`, `secretAccessKey`, and optional `sessionToken`. Use a private
bucket and dedicated credentials outside the legacy file endpoint's access.
An optional deployment-owned `storage.endpoint` selects an S3-compatible HTTP(S)
server using path-style bucket addressing, for example a local development
storage emulator. Omit it for standard AWS S3. Never accept an endpoint from a
client, and restrict server egress and storage credentials appropriately.
The Firebase secret environment variable contains the Firebase service account
JSON. Its project_id must match the configured projectId. These secrets stay on
the server. The client-facing configuration exposes only the app ID and feature
flags.

MongoDB must support transactions through a replica set or mongos. The module
uses MongoDB's unique indexes, majority-write transactions and Redis. Enable
MongoDB TTL processing for retained event and delivery cleanup. Communication
starts an independent durable-outbox poller for every configured app.

## Authentication

The application's trusted identity backend issues an RS256 access token with
this payload and the configured kid header.

```json
{
  "iss": "https://identity.example.com",
  "aud": "organization-a-mobile-one",
  "sub": "stable-user-subject",
  "token_use": "access",
  "iat": 1794355200,
  "exp": 1794355500
}
```

Use current timestamps. A token is valid for at most one hour after iat. Every
messaging HTTP request carries this header.

```http
x-communication-messaging-token: <access-token>
```

The verified issuer and exact audience select the application configuration and
database scope. Member IDs are server-generated during enrollment. Sender,
tenant and app IDs are derived server-side. Staff cookies, portal identifiers,
widget tokens and caller-supplied routing headers do not establish a messaging
actor. Tokens with token_use other than access or an explicit refresh type are
rejected.

Configure the existing identity provider or its trusted backend to issue this
audience-specific access credential. Keep signing keys on that backend. Store
mobile credentials using the application's existing secure credential storage.

Call `communicationMessagingRegister` once for a signed-in account. It creates the
identity once per verified issuer and subject in this app. Repeated calls return
the existing identity. A display name is a user-supplied label with an 80-character
limit. Member lookup returns enrolled members within the caller's app only.

## API reference

Copy individual named operations from [operations.graphql](./operations.graphql).
Send an operationName when posting the combined document. IDs in the examples
below are illustrative and must come from API responses.

| Operation field                          | Required variables                   | Optional variables | Result                       |
| ---------------------------------------- | ------------------------------------ | ------------------ | ---------------------------- |
| communicationMessagingRegister           | displayName                          | —                  | Profile                      |
| communicationMessagingMe                 | —                                    | —                  | Profile                      |
| communicationMessagingMembers            | —                                    | first, after       | Member page                  |
| communicationMessagingOpenDirect         | peerId                               | —                  | Conversation                 |
| communicationMessagingCreateGroup        | title, memberIds                     | —                  | Conversation                 |
| communicationMessagingChangeGroup        | conversationId, action               | memberId           | Boolean                      |
| communicationMessagingConversations      | —                                    | first, after       | Conversation page            |
| communicationMessagingConversation       | id                                   | —                  | Conversation                 |
| communicationMessagingMessages           | conversationId                       | first, before      | Message page                 |
| communicationMessagingParticipants       | conversationId                       | —                  | Participant list             |
| communicationMessagingSend               | input                                | —                  | Message                      |
| communicationMessagingMarkRead           | conversationId, through              | —                  | Boolean                      |
| communicationMessagingUnreadCount        | —                                    | —                  | Integer                      |
| communicationMessagingTyping             | conversationId, typing               | —                  | Boolean                      |
| communicationMessagingSync               | after                                | first              | Sync page                    |
| communicationMessagingSubscriptionTicket | —                                    | —                  | Ticket and expiry            |
| communicationMessagingWake               | ticket                               | —                  | Boolean subscription wake-up |
| communicationMessagingPrepareAttachment  | conversationId, name, mimeType, size | —                  | Attachment ID and uploadPath |
| communicationMessagingRegisterDevice     | installationId, platform, token      | —                  | Device metadata              |
| communicationMessagingRevokeDevice       | installationId                       | —                  | Boolean                      |
| communicationMessagingPreference         | conversationId, preference           | —                  | Boolean                      |

Page size defaults to 25 and is capped at 50 for lists and history. Sync defaults
to 50 and is capped at 100. Treat conversation and member cursors as opaque.
History uses a message-sequence before cursor and returns each page in ascending
sequence. Refresh the first conversation page after activity because conversations
move in the activity ordering.

### Typical variables and responses

Enrollment variables and response are shaped as follows.

```json
{ "displayName": "Alex" }
```

```json
{ "data": { "communicationMessagingRegister": { "app": { "id": "mobile-one", "direct": true, "group": true, "attachments": true, "push": true }, "member": { "id": "member-a", "displayName": "Alex" } } } }
```

Open a DIRECT with `{"peerId":"member-b"}`, or create a GROUP with
`{"title":"Project team","memberIds":["member-b"]}`.

```json
{ "data": { "communicationMessagingCreateGroup": { "id": "conversation-a", "kind": "GROUP", "title": "Project team", "role": "OWNER", "lastSequence": 0, "lastReadSequence": 0, "unreadCount": 0 } } }
```

Send a message using a stable client-generated message ID.

```json
{ "input": { "conversationId": "conversation-a", "clientMessageId": "device-generated-uuid", "text": "Hello", "mentionMemberIds": ["member-b"], "attachmentIds": [] } }
```

```json
{ "data": { "communicationMessagingSend": { "id": "message-a", "conversationId": "conversation-a", "senderId": "member-a", "clientMessageId": "device-generated-uuid", "sequence": 1, "text": "Hello", "attachmentIds": [], "mentionMemberIds": ["member-b"], "createdAt": "2026-11-11T03:00:00.000Z" } } }
```

Keep the same ID and content when retrying after a lost response. Concurrent
retries return the same committed message and increment unread counts once.
Changing the content for an existing clientMessageId returns CONFLICT.
Messages accept up to 8,000 characters and five attachments. Mentions must name
active GROUP members.

Get history using `{"conversationId":"conversation-a","first":25}`.

```json
{ "data": { "communicationMessagingMessages": { "items": [{ "id": "message-a", "sequence": 1, "text": "Hello" }], "nextCursor": null } } }
```

The exact fields follow the selection set. Conversation lists and member lists
use `{"items":[...],"nextCursor":null}`. A conversation detail returns the
conversation object directly.

Read through a sequence using `{"conversationId":"conversation-a","through":1}`.
Successful read, typing, membership, preference and device-revoke mutations
return their field with value true.

```json
{ "data": { "communicationMessagingMarkRead": true } }
```

```json
{ "data": { "communicationMessagingUnreadCount": 0 } }
```

Participant results include display names, roles, lastReadSequence and
typingUntil. A typingUntil in the past is inactive.

```json
{ "data": { "communicationMessagingParticipants": [{ "member": { "id": "member-b", "displayName": "Sam" }, "role": "MEMBER", "lastReadSequence": 1, "typingUntil": null }] } }
```

## Group permissions

Groups support up to 50 members. The creator is the sole OWNER. MEMBER can send,
read, type, set their preference, and LEAVE. ADMIN can ADD members and REMOVE
ordinary members. OWNER can additionally PROMOTE, DEMOTE and TRANSFER ownership.
Use a target memberId for every action except LEAVE. An owner transfers ownership
before leaving. A GROUP may start with its owner only.

Removal blocks subsequent history, file, typing and send operations. Rejoining
starts a fresh history boundary after the latest existing message. DIRECT
conversations contain exactly two members and have a unique sorted member pair
within the app. Cross-app messaging is disabled.

## Live updates and offline recovery

Use the gateway's existing graphql-ws endpoint with the graphql-transport-ws
protocol. First obtain a subscription ticket over authenticated HTTP.

```json
{ "data": { "communicationMessagingSubscriptionTicket": { "ticket": "opaque-single-use-ticket", "expiresAt": "2026-11-11T03:05:00.000Z" } } }
```

Pass that value in `{"ticket":"opaque-single-use-ticket"}` to
communicationMessagingWake. A ticket only admits a subscription. Start the
subscription before the returned expiresAt, which is at most five minutes away
and never later than the access token's expiry. Starting it consumes the ticket
atomically, so one ticket opens at most one subscription across all gateway
instances. A reused, expired or altered ticket fails with
`Invalid messaging subscription ticket`.

An established subscription stays open until the access token used to obtain
its ticket expires: the token's exp, capped at one hour after iat. At that
moment the server ends the subscription with a graphql-ws `complete` message;
it never stays open without delivering. It also ends when the client completes
it or the socket closes. To avoid a gap, refresh the access token, obtain a new
ticket and start the new subscription before the current one ends, then run
communicationMessagingSync. After any `complete`, error or disconnect, obtain a new
ticket, subscribe again and synchronize from the last committed cursor.

A wake-up is an app/account-scoped invalidation. It carries a Boolean true.
Fetch authorized messages and state over HTTP after a wake-up. Refresh typing
state through communicationMessagingParticipants.

1. Subscribe and buffer wake-ups before requesting the initial sync page.
2. Call communicationMessagingSync with `{"after":0,"first":50}` on first use.
3. Apply events idempotently by event ID and message ID.
4. Persist the returned cursor after applying the page. Follow hasMore.
5. Refresh conversation lists, read positions and the unread total after sync.
6. On reconnect, repeat using the last committed cursor.
7. If resetRequired is true, reload current conversation lists and accessible
   history, then retain the returned cursor.

```json
{ "data": { "communicationMessagingSync": { "items": [{ "id": "event-a", "cursor": 2, "conversationId": "conversation-a", "kind": "MESSAGE", "message": { "id": "message-a", "sequence": 1, "text": "Hello" } }], "cursor": 2, "hasMore": false, "resetRequired": false } } }
```

Events are retained for 30 days. Current membership and join-history boundaries
filter replay. Removed conversations disappear from the refreshed list. Read
positions advance monotonically, and reading does not change conversation
activity ordering. Typing updates are ephemeral, rate-limited to one per two
seconds, and expire after six seconds. Send typing heartbeats while composing.

Wake-ups are published through the shared erxes `graphqlPubsub` on Redis, the
same Pub/Sub the gateway's subscription resolvers listen on. The worker
publishes a member's wake-up after queuing that event's push deliveries and
before marking the event dispatched. If Redis is unavailable, the publish fails
after the Redis client's retries and the event stays undispatched. The worker
retries it after its one-minute lease expires, so a wake-up can arrive late or
more than once. A failed typing wake-up returns an error to the caller and is
not retried. Wake-ups carry no data: clients recover missed events through
communicationMessagingSync on reconnect, on resume or at the next wake-up.

## Private attachments

1. Prepare metadata using the GraphQL mutation. Example variables are
   `{"conversationId":"conversation-a","name":"photo.png","mimeType":"image/png","size":8124}`.
2. PUT the raw bytes to the returned uploadPath with the messaging access-token
   header. Resolve the path against the gateway base, preserving an existing
   /gateway prefix. Use the exact declared byte size.
3. Include the returned ID in communicationMessagingSend input. The sender, app,
   thread, file state and expiry must match.
4. GET the same path with the access-token header to download a bound file.
   A successful request returns the bytes with the declared Content-Type and
   an attachment Content-Disposition.
5. For mobile image previews, fetch authenticated bytes and use the app's
   existing local image-cache mechanism.

```json
{ "data": { "communicationMessagingPrepareAttachment": { "id": "file-a", "uploadPath": "/pl:communication/messaging/attachments/file-a" } } }
```

Build download paths as `/pl:communication/messaging/attachments/<attachmentId>`.

A successful PUT returns `{"id":"file-a"}`. File IDs never grant access by
themselves. Files remain private in storage, and download checks current
membership and history access. MIME signatures and size are checked on upload.
Pending uploads expire after 15 minutes and unattached completed uploads after
24 hours. The worker deletes expired objects before their metadata. Attachment
routes return 404 with `{"error":"Attachment unavailable"}` for rejected or
unavailable requests. Invalid upload content returns 400 with a validation
message. Storage failures return 503 with a generic retryable error.

## Devices, push notifications and deep links

Register each installation after login and whenever its FCM token refreshes.

```json
{ "installationId": "app-generated-installation-uuid", "platform": "IOS", "token": "current-fcm-token" }
```

```json
{ "data": { "communicationMessagingRegisterDevice": { "id": "device-a", "installationId": "app-generated-installation-uuid", "platform": "IOS" } } }
```

ANDROID uses the same operation. Each token belongs to one active login per app.
Pending work resolves the current active token for the installation at dispatch. Invalid-token responses can revoke only the generation actually sent. Before discarding
the access token on logout, call communicationMessagingRevokeDevice for this
installation. Other installations remain active.

The backend uses FCM HTTP v1 and the app's configured service account. Configure
that Firebase project for its Android package and its iOS bundle/APNs credentials.
No Firebase service-account credential belongs in a mobile client.

Set preferences with `{"conversationId":"conversation-a","preference":"NONE"}`.
ALL, MENTIONS and NONE are supported. Mentions are based on validated member IDs.
Already-read messages and removed group members are excluded at dispatch.

A message and its durable recipient events commit together. The worker
idempotently creates per-device deliveries before publishing wake-ups. Failed
worker leases recover after one minute. Transient provider failures retry up to
eight attempts with exponential backoff, jitter and Retry-After. Permanent
unregistered-token responses disable only the matching device generation.
Messages older than 24 hours are excluded from push.

The payload uses stable notificationId, conversationId, messageId, appId, cursor,
badge and url data keys. The configured HTTPS deepLinkBase receives the
conversationId query parameter. Configure each app's existing universal/app-link
handler for its own host. Read authorization is checked again when the app fetches
the conversation after opening a notification.

Alerts have generic text and carry no message body. Android notification tags
and APNs collapse identifiers remain stable for a delivery retry. Foreground
handlers reconcile incoming push with live events and suppress duplicate local
alerts. Background and terminated-state taps use the app's native notification
handler, then synchronize through GraphQL. After resume, login, reconnect or a
read on another device, fetch communicationMessagingUnreadCount to reconcile the
badge. Treat badge as an absolute count and compare cursor values before applying
older application-handled notifications.

Provider acceptance is distinct from device display. Network ambiguity can
produce duplicate provider submissions. Client notification-ID deduplication,
stable collapse identifiers and cursor recovery handle retries. Physical-device
delivery requires the app's Firebase/APNs setup, notification permission and OS
delivery conditions.

## Rate limits

Each limit is a fixed window per verified tenant, app, member and operation.
The window counter lives in Redis and is updated atomically, so every
Communication instance shares it. Caller-supplied headers do not affect the scope.

| Operation                                | Limit | Window     |
| ---------------------------------------- | ----- | ---------- |
| communicationMessagingSend               | 60    | 1 minute   |
| communicationMessagingCreateGroup        | 10    | 10 minutes |
| communicationMessagingPrepareAttachment  | 30    | 5 minutes  |
| communicationMessagingSubscriptionTicket | 20    | 10 minutes |
| communicationMessagingRegisterDevice     | 10    | 1 hour     |

A request over its limit fails with `Too many messaging requests. Retry later.`
and extensions `{"code":"RATE_LIMITED","retryAfter":<seconds>}`, where
retryAfter is the time until the current window ends. Rejected requests do not
run the operation. A retried send keeps its clientMessageId and counts as a new
request. communicationMessagingTyping keeps its separate limit of one update per
two seconds.

Limits fail closed. If Communication's Redis connection is not ready or does not
answer within two seconds, these operations fail with
`Messaging is temporarily unavailable. Retry later.` and code
`SERVICE_UNAVAILABLE` instead of running unlimited. While Redis is unavailable,
starting a subscription waits for the gateway's Redis connection to recover, and
wake-up publishing follows the retry behavior described under live updates.

## Errors and isolation

GraphQL errors use UNAUTHENTICATED, FORBIDDEN, NOT_FOUND, BAD_USER_INPUT,
CONFLICT, RATE_LIMITED and SERVICE_UNAVAILABLE in extensions.code. Membership failures reveal no private record.
Token, app and group IDs are always verified by the new authorization path.

The Communication service exposes no tRPC router. Participant operations
ignore the gateway's subdomain, staff, portal and widget context and derive
tenant and app scope from a verified app access token. Other plugins' models,
public tRPC ingress and portal authorization cannot reach messaging records.
Staff access goes only through the oversight operations below.

## Administrative oversight

Organization operators should tell their app users about this access. Staff
holding the `communicationMessagingViewAll` permission ("View all
conversations" under Communication → Messaging) can read every DIRECT and
GROUP conversation of their organization, including full message history,
members, read positions and bound attachments, without being participants.
The admin UI is at `/communication/messaging`.

- **Granting.** In Settings → Team Member → Permission groups, explicitly
  assign **Communication Messaging Viewer** under **Plugin communication**.
  This predefined group (`communication:messaging-viewer`) grants only
  `communicationMessagingViewAll` at `all` scope. Its ID deliberately avoids
  Core's automatic `:viewer` assignment convention. Owners also need an
  explicit grant; allow-all app tokens are not admitted implicitly. A custom
  group can instead select Communication → Messaging → View all conversations,
  or a user's custom permissions can grant the action. A permission check that
  cannot complete denies access.
- **Discovery.** The group list displays `meta.permissions.defaultGroups`;
  the Custom Group editor displays `meta.permissions.modules`. Both are
  registered by `communication_api` in Redis. After upgrading permission
  metadata, restart Communication to register it, then refresh Core's service
  discovery cache (or restart Core) and reload the permission editor. Core
  keeps plugin metadata in memory, and the editor caches its Apollo queries.
- **Scope.** In SaaS, an organization sees only apps whose `tenant` equals its
  subdomain. A self-hosted deployment serves one organization, which sees every
  configured app. Apps are addressed by an opaque `tenant/appId` key that the
  server resolves against that list; other keys return NOT_FOUND.
- **Read-only.** The `communicationMessagingAdmin*` queries never send, edit or
  delete messages, change members or roles, mark messages read, change unread
  counts, publish typing or wake-ups, register devices, trigger push or issue
  tickets. There are no admin mutations. Participants are not notified.
- **Audit.** Every successful list, conversation, history, participant and
  attachment access is queued to the core logs service before data is returned
  (`action: 'communicationMessagingAdminAccess'`) with the staff user,
  organization, tenant, app, conversation or attachment ID, access type and
  time. Records never contain message text or file contents. When the record
  cannot be queued, the request fails with SERVICE_UNAVAILABLE and returns no
  data. Reading the records requires the core `logsRead` permission.
- **Attachments.** Staff download bound files only through
  `GET /pl:communication/messaging/admin/attachments/<id>?app=<key>` with the
  `x-communication-messaging-admin: 1` header, which is authorized and audited
  independently. Storage credentials never reach the browser.
- **AI assistant.** The admin queries are hidden from the core AI assistant's
  operation discovery.

## Known limitations

- An open subscription is not ended early when a member is deactivated. It
  keeps receiving content-free wake-ups until its access token expires, at most
  one hour. Every data request is authorized again over HTTP.
- Per-member limits cover only the five operations under rate limits, plus
  typing. Other operations rely on the gateway's per-IP request limit. A fixed
  window can admit up to twice its limit across a window boundary.
- Native push delivery through FCM and APNs has not been verified on physical
  devices.
- Production requires MongoDB transactions (a replica set or mongos), one Redis
  shared by Communication and the gateway for wake-ups and subscription tickets, and
  correctly configured app credentials: COMMUNICATION_MESSAGING_APPS entries whose
  issuer, audience and pinned keys match the identity provider, plus the storage
  and Firebase credential environment variables for apps that enable them.

## Deployment

Communication has a backend service and an admin UI remote. The service listens on port
3306 (override with `PORT`) and joins gateway service discovery through Redis as
`communication`. Outside development it advertises
`http://plugin-communication-api:<port>`, so name the container or service
`plugin-communication-api` or set `LOAD_BALANCER_ADDRESS`. Enable it with
`ENABLED_PLUGINS=communication` on the gateway, the service and the UI host,
which then loads the `communication_ui` remote. Use
`ENABLED_PLUGINS_ONLY_API=communication` instead to run the API without the
admin UI. The Docker image
`erxes/erxes-next-communication_api` is built from
`backend/plugins/communication_api/Dockerfile` by
`.github/workflows/ci-api-communication.yml` on pushes to `main`, tagged by
`release.yml`, and versioned by a `communication_api@<version>` tag.

The service reads the same `MONGO_URL` and Redis settings as other plugins, plus
`COMMUNICATION_MESSAGING_APPS` and the per-app
`COMMUNICATION_MESSAGING_STORAGE_*` and `COMMUNICATION_MESSAGING_FCM_*` secrets
named by each app's `credentialEnv`. Collections and indexes are created on
first use.

Deploy the Communication service, then restart the gateway so it recomposes the
supergraph and downloads the Communication subscription plugin. To roll back,
disable Communication and restart the gateway. Disabling the service does not
remove its collections or stored objects.

## Validation

Run from the repository root.

```sh
pnpm nx build communication_api
pnpm nx run communication_api:schema:print
pnpm nx lint communication_api
pnpm nx test communication_api
pnpm nx run gateway:schema:compose
pnpm nx build communication_ui
```

`pnpm nx test communication_api` covers staff oversight: authorization,
tenant and app scope, read-only access, audit and the admin attachment route.
Participant messaging has no automated tests in this checkout; integration
tests used during its development are not part of this module.

Physical-device push delivery and a production S3 connection require deployment
credentials and are not covered by these checks.
