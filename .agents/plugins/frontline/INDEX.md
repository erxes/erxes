# frontline plugin

**Backend:** `backend/plugins/frontline_api/` — port **3304**
**Frontend:** `frontend/plugins/frontline_ui/` — port **3004**

Inbound customer communications, ticketing system, forms, channels, and knowledgebase surfaces for erxes.

## Modules

| Module | Doc | Backend root | Frontend root |
|---|---|---|---|
| **inbox** | [modules/inbox.md](modules/inbox.md) | `backend/plugins/frontline_api/src/modules/inbox/` | `frontend/plugins/frontline_ui/src/modules/inbox/` |
| **ticket** | [modules/ticket.md](modules/ticket.md) | `backend/plugins/frontline_api/src/modules/ticket/` | `frontend/plugins/frontline_ui/src/modules/ticket/` |
| **knowledgebase** | [modules/knowledgebase.md](modules/knowledgebase.md) | `backend/plugins/frontline_api/src/modules/knowledgebase/` | `frontend/plugins/frontline_ui/src/modules/knowledgebase/` |

## External surfaces

### GraphQL federation
Exposed via `@key(fields: "_id")`:
- `Channel`
- `Form`
- `Conversation`
- `Integration`
- `KnowledgeBaseTopic`
- `KnowledgeBaseCategory`
- `KnowledgeBaseArticle`

Extended (consumed from other plugins): `User`, `Customer`, `Company`, `Tag`, `Product`.

### tRPC routers
Merged in `backend/plugins/frontline_api/src/init-trpc.ts`:
- `inbox.integrations` — `backend/plugins/frontline_api/src/modules/inbox/trpc/inbox.ts`
- `inbox.conversationMessages` — `backend/plugins/frontline_api/src/modules/inbox/trpc/inbox.ts`
- `inbox.conversations` — `backend/plugins/frontline_api/src/modules/inbox/trpc/inbox.ts`
- `inbox.channels` — `backend/plugins/frontline_api/src/modules/inbox/trpc/inbox.ts`
- `inbox.visitor` — `backend/plugins/frontline_api/src/modules/inbox/trpc/inbox.ts`
- `integration` — `backend/plugins/frontline_api/src/modules/integrations/trpc/integration.ts`
- `conversation` — `backend/plugins/frontline_api/src/modules/inbox/trpc/conversation.ts`

### Express routes
File: `backend/plugins/frontline_api/src/routes.ts`
- `router.use('/facebook', facebookRouter)` — Facebook webhooks/oauth callback
- `router.use('/instagram', instagramRouter)` — Instagram webhooks/oauth callback

### Automation
File: `backend/plugins/frontline_api/src/meta/automations.ts`
- **Triggers:** Pulls actions and triggers dynamically from facebook and instagram modules.

### Segments
File: `backend/plugins/frontline_api/src/main.ts`
- Content type registrations for properties and tags:
  - `conversation` (Inbox)
  - `ticket` (Tickets)
  - `form` (Form tags)

### Permissions
`backend/plugins/frontline_api/src/meta/permissions.ts` — RBAC permissions for conversations, tickets, integrations, channels, knowledgebase, and forms.

## Cross-plugin consumers
- **sales** — references conversations and tickets when linking deals to inbound channels.
- **core** — federates user assignments, customer contacts, company associations, and system tags.

## Cross-plugin dependencies
- **core** — `User`, `Customer`, `Company`, `Tag`, `Product` schemas.
