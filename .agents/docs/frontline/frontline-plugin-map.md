# Frontline Plugin — Annotated Map

> Where things live in `backend/plugins/frontline_api/` and `frontend/plugins/frontline_ui/`. Use this when a skill says "look at X" and you need to find it.

For the *file inventory per module*, see [`../../plugins/frontline/INDEX.md`](../../plugins/frontline/INDEX.md) and `plugins/frontline/modules/*.md`. This file explains the *shape* — what each directory means.

## Backend (`backend/plugins/frontline_api/`)

```
src/
├── main.ts                          ← entry point; calls startPlugin()
├── connectionResolvers.ts           ← Mongoose model factory; generateModels(subdomain)
├── routes.ts                        ← Express REST routes (/facebook, /instagram)
├── init-trpc.ts                     ← appRouter merges per-module routers
├── apollo/                          ← Apollo Server bootstrap
│   ├── subscription.ts              ← GraphQL subscriptions
│   ├── resolvers/                   ← root resolver index
│   └── schema/                      ← root typedef index (merges modules')
├── modules/                         ← frontline backend modules
│   ├── channel/                     ← inbound/outbound communication channels
│   ├── form/                        ← custom forms and fields
│   ├── inbox/                       ← conversations, messages, integrations, messenger apps
│   │   ├── @types/                  ← TS interfaces
│   │   ├── db/
│   │   │   ├── definitions/         ← Mongoose schemas
│   │   │   └── models/              ← classes with business methods
│   │   ├── graphql/
│   │   │   ├── schemas/             ← per-entity typedefs
│   │   │   └── resolvers/
│   │   ├── trpc/                    ← procedure files (inbox, conversation)
│   │   ├── receiveMessage.ts        ← message webhook handler
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── integrations/                ← call, imap, facebook, instagram integrators
│   ├── knowledgebase/               ← self-service articles, categories, topics
│   ├── reports/                     ← inbox/ticket performance reporting
│   ├── response/                    ← canned response templates
│   └── ticket/                      ← ticketing board, status, and config
└── meta/
    ├── automations.ts               ← exported to startPlugin meta.automations
    ├── notifications.ts             ← notification triggers and events
    └── permissions.ts               ← RBAC matrix
```

## Frontend (`frontend/plugins/frontline_ui/`)

```
src/
├── bootstrap.tsx                    ← React mount
├── config.tsx                       ← Module Federation expose: name, icon, navigation, modules[], widgets
├── modules/
│   ├── FrontlineMain.tsx            ← routes switch entry
│   ├── FrontlineNavigation.tsx      ← top-level nav for frontline group
│   ├── FrontlineSettings.tsx        ← settings landing page
│   ├── FrontlineSubGroups.tsx       ← subgroup view config
│   ├── inbox/                       ← inbox & chat UI
│   │   ├── brand/
│   │   ├── channel/
│   │   ├── components/
│   │   ├── conversations/
│   │   └── hooks/
│   ├── ticket/                      ← ticket board UI
│   │   ├── components/              ← board header, card, status selects
│   │   ├── hooks/                   ← useGetTickets, useCreateTicket, useUpdateTicket
│   │   ├── states/                  ← Jotai atoms
│   │   └── types/                   ← TS types
│   ├── knowledgebase/               ← KB topics, articles editor
│   ├── forms/                       ← form builder and detail page
│   ├── channels/                    ← channels management
│   ├── integrations/                ← integrations setup UI
│   └── settings/                    ← general frontline settings
```

## How modules talk to each other

- `inbox` messages can trigger/create a `ticket` from the conversation detail sidebar.
- `inbox` uses `channels` and `integrations` to receive and route messages.
- `ticket` uses custom `forms` to gather structured user inputs on creation.
- `knowledgebase` articles can be searched and shared within `inbox` conversations as responses.

## How frontline talks to other plugins

- `core` — Users (assignees), Customers (inbound contacts), Companies, Tags.
- `sales` — Deals are linked to frontline tickets and conversations to track customer intent.
