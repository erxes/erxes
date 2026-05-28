# frontline > inbox

Conversations, messaging history, and channel integrations.

## Eval files (verify these after changes)
Highest-priority files. If you touch this module, re-read these:

- `backend/plugins/frontline_api/src/modules/inbox/db/models/Conversations.ts` — Conversations model & business logic
- `backend/plugins/frontline_api/src/modules/inbox/db/models/ConversationMessages.ts` — Messages model
- `backend/plugins/frontline_api/src/modules/inbox/graphql/resolvers/mutations/conversations.ts` — Writes
- `backend/plugins/frontline_api/src/modules/inbox/graphql/resolvers/queries/conversations.ts` — Reads
- `frontend/plugins/frontline_ui/src/modules/inbox/InboxMain.tsx` — Inbox view controller

## All files involved

### Backend — types
- `backend/plugins/frontline_api/src/modules/inbox/@types/conversations.ts`
- `backend/plugins/frontline_api/src/modules/inbox/@types/conversationMessages.ts`
- `backend/plugins/frontline_api/src/modules/inbox/@types/integrations.ts`

### Backend — models & schema
- `backend/plugins/frontline_api/src/modules/inbox/db/models/Conversations.ts`
- `backend/plugins/frontline_api/src/modules/inbox/db/models/ConversationMessages.ts`
- `backend/plugins/frontline_api/src/modules/inbox/db/models/Integrations.ts`
- `backend/plugins/frontline_api/src/modules/inbox/db/definitions/conversations.ts`
- `backend/plugins/frontline_api/src/modules/inbox/db/definitions/conversationMessages.ts`
- `backend/plugins/frontline_api/src/modules/inbox/db/definitions/integrations.ts`

### Backend — GraphQL
- `backend/plugins/frontline_api/src/modules/inbox/graphql/schemas/conversation.ts`
- `backend/plugins/frontline_api/src/modules/inbox/graphql/schemas/integration.ts`
- `backend/plugins/frontline_api/src/modules/inbox/graphql/resolvers/queries/conversations.ts`
- `backend/plugins/frontline_api/src/modules/inbox/graphql/resolvers/mutations/conversations.ts`

### Backend — tRPC, webhook, automation
- `backend/plugins/frontline_api/src/modules/inbox/trpc/inbox.ts`
- `backend/plugins/frontline_api/src/modules/inbox/trpc/conversation.ts`
- `backend/plugins/frontline_api/src/modules/inbox/webhooks.ts`
- `backend/plugins/frontline_api/src/modules/inbox/receiveMessage.ts`

### Frontend — entry & navigation
- `frontend/plugins/frontline_ui/src/modules/inbox/InboxMain.tsx`
- `frontend/plugins/frontline_ui/src/modules/FrontlineNavigation.tsx`
- `frontend/plugins/frontline_ui/src/config.tsx`

### Frontend — components & hooks
- `frontend/plugins/frontline_ui/src/modules/inbox/conversations/hooks/useConversations.ts`
- `frontend/plugins/frontline_ui/src/modules/inbox/components/*`

## Connected to / related to

| Other surface | How | Where |
|---|---|---|
| **core / User** | `assignedUserId` | DB definition + resolvers |
| **core / Customer** | `customerId` | DB definition + resolvers |
| **sales / Deal** | Linked deals | Referenced in front-end details |
