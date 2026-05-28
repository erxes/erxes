# frontline > ticket

Ticketing pipeline management — tickets, pipelines, statuses, boards, notes, and configurations.

## Eval files (verify these after changes)
Highest-priority files. If you touch this module, re-read these:

- `backend/plugins/frontline_api/src/modules/ticket/db/models/Ticket.ts` — Ticket CRUD + business logic
- `backend/plugins/frontline_api/src/modules/ticket/graphql/resolvers/mutations/tickets.ts` — Writes
- `backend/plugins/frontline_api/src/modules/ticket/graphql/resolvers/queries/tickets.ts` — Reads
- `frontend/plugins/frontline_ui/src/pages/TicketIndexPage.tsx` — Tickets board landing page

## All files involved

### Backend — types
- `backend/plugins/frontline_api/src/modules/ticket/@types/ticket.ts`
- `backend/plugins/frontline_api/src/modules/ticket/@types/pipeline.ts`

### Backend — models & schema
- `backend/plugins/frontline_api/src/modules/ticket/db/models/Ticket.ts`
- `backend/plugins/frontline_api/src/modules/ticket/db/models/Pipeline.ts`
- `backend/plugins/frontline_api/src/modules/ticket/db/models/Status.ts`
- `backend/plugins/frontline_api/src/modules/ticket/db/definitions/ticket.ts`
- `backend/plugins/frontline_api/src/modules/ticket/db/definitions/pipeline.ts`
- `backend/plugins/frontline_api/src/modules/ticket/db/definitions/status.ts`

### Backend — GraphQL
- `backend/plugins/frontline_api/src/modules/ticket/graphql/schemas/ticket.ts`
- `backend/plugins/frontline_api/src/modules/ticket/graphql/schemas/pipeline.ts`
- `backend/plugins/frontline_api/src/modules/ticket/graphql/schemas/status.ts`
- `backend/plugins/frontline_api/src/modules/ticket/graphql/resolvers/queries/tickets.ts`
- `backend/plugins/frontline_api/src/modules/ticket/graphql/resolvers/mutations/tickets.ts`

### Frontend — entry & navigation
- `frontend/plugins/frontline_ui/src/pages/TicketIndexPage.tsx`
- `frontend/plugins/frontline_ui/src/modules/ticket/Main.tsx`

### Frontend — components & hooks
- `frontend/plugins/frontline_ui/src/modules/ticket/hooks/useGetTickets.tsx`
- `frontend/plugins/frontline_ui/src/modules/ticket/hooks/useCreateTicket.tsx`
- `frontend/plugins/frontline_ui/src/modules/ticket/hooks/useUpdateTicket.tsx`
- `frontend/plugins/frontline_ui/src/modules/ticket/components/*`

## Connected to / related to

| Other surface | How | Where |
|---|---|---|
| **core / User** | `assigneeId` | DB definitions + resolvers |
| **core / Customer** | `customerId` | custom field data mappings |
| **sales / Deal** | Linked deals | custom properties relations |
