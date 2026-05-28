# Frontline — Data Model

> The shape of Conversation, Message, Integration, Ticket, and KnowledgeBase entities and how they relate. Read this before any skill that touches the database layer.

## Entity-relationship overview

```
Integration
  ↓ (1:N)
Conversation (inbox)
  ├─ customerId              → core.Customer
  ├─ assignedUserId          → core.User
  ├─ readUserIds[]           → core.User[]
  ├─ participatedUserIds[]   → core.User[]
  ├─ tagIds[]                → core.Tag[]
  └─ messageCount            → number
       ↓ (1:N)
ConversationMessage
       ├─ conversationId     → frontline.Conversation
       ├─ customerId         → core.Customer
       └─ userId             → core.User (if sent by operator)

Channel (groups integrations)
  └─ integrationIds[]        → frontline.Integration[]

Ticket (ticketing pipeline)
  ├─ pipelineId              → frontline.Pipeline
  ├─ statusId                → frontline.Status
  ├─ assigneeId              → core.User
  ├─ channelId               → frontline.Channel
  ├─ companyIds[]            → core.Company[]
  ├─ labelIds[]              → core.Tag[]
  └─ tagIds[]                → core.Tag[]
```

## Conversation — the central inbox entity

**Definition:** `backend/plugins/frontline_api/src/modules/inbox/db/definitions/conversations.ts`
**Model class:** `db/models/Conversations.ts`
**GraphQL type:** `graphql/schemas/conversation.ts`

### Key fields

| Field | Type | Notes |
|---|---|---|
| `_id` | string | federation `@key` |
| `content` | string | summary/coped content of the first/last message |
| `integrationId` | string | references Integration |
| `customerId` | string | links to core.Customer |
| `userId` | string | creator operator ID |
| `assignedUserId` | string | currently assigned operator |
| `readUserIds` | string[] | users who have read the conversation |
| `status` | string | state of the conversation (new, open, closed, snooze) |
| `messageCount` | number | count of messages in this conversation |
| `tagIds` | string[] | linked tags (core.Tag) |
| `isCustomerRespondedLast` | boolean | flag to indicate if customer sent the last message |

---

## Ticket — the ticketing board entity

**Definition:** `backend/plugins/frontline_api/src/modules/ticket/db/definitions/ticket.ts`
**Model class:** `db/models/Ticket.ts`
**GraphQL type:** `graphql/schemas/ticket.ts`

### Key fields

| Field | Type | Notes |
|---|---|---|
| `_id` | string | unique identifier |
| `name` | string | ticket title |
| `description` | string | detailed issue description |
| `pipelineId` | string | references Pipeline |
| `statusId` | string | references Status |
| `channelId` | string | references Channel |
| `priority` | number | priority level of the ticket |
| `assigneeId` | string | references core.User |
| `createdBy` | string | creator operator ID |
| `labelIds` | string[] | custom labels |
| `tagIds` | string[] | core.Tag references |
| `companyIds` | string[] | references core.Company |

---

## KnowledgeBase

### Topic
Groups categories and articles together.
- `title`: string
- `description`: string
- `categoryIds`: string[]

### Category
Groups articles within a topic.
- `title`: string
- `description`: string
- `articleIds`: string[]

### Article
The actual help document content.
- `title`: string
- `content`: string
- `status`: 'draft' | 'published'
