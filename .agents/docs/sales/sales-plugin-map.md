# Sales Plugin — Annotated Map

> Where things live in `backend/plugins/sales_api/` and `frontend/plugins/sales_ui/`. Use this when a skill says "look at X" and you need to find it.

For the *file inventory per module*, see [`../../plugins/sales/INDEX.md`](../../plugins/sales/INDEX.md) and `plugins/sales/modules/*.md`. This file explains the *shape* — what each directory means.

## Backend (`backend/plugins/sales_api/`)

```
src/
├── main.ts                          ← entry point; calls startPlugin()
│                                       Payment callback at lines 71-129
├── connectionResolvers.ts           ← Mongoose model factory; generateModels(subdomain)
├── routes.ts                        ← Express REST routes
│                                       /pos-init, /pos-sync-config,
│                                       /ecommerce-init, /ecommerce-wishlist, etc.
├── apollo/                          ← Apollo Server bootstrap
│   ├── subscription.ts              ← GraphQL subscriptions
│   ├── resolvers/                   ← root resolver index
│   └── schema/                      ← root typedef index (merges modules')
├── trpc/
│   └── init-trpc.ts                 ← appRouter merges per-module routers
├── modules/                         ← three modules: sales, pos, ecommerce
│   ├── sales/                       ← deals, pipelines, stages, boards, checklists, labels
│   │   ├── @types/                  ← TS interfaces
│   │   ├── db/
│   │   │   ├── definitions/         ← Mongoose schemas
│   │   │   └── models/              ← classes with business methods
│   │   ├── graphql/
│   │   │   ├── schemas/             ← per-entity typedefs + extensions.ts (federation)
│   │   │   ├── resolvers/
│   │   │   │   ├── queries/         ← deals.ts, pipelines.ts, stages.ts, boards.ts
│   │   │   │   ├── mutations/       ← deals.ts, pipelines.ts, ...
│   │   │   │   ├── customResolvers/ ← computed/relational fields
│   │   │   │   └── loaders/         ← DataLoaders for federated references
│   │   ├── trpc/                    ← per-procedure files
│   │   ├── meta/
│   │   │   ├── automations/         ← triggers + actions registered with platform
│   │   │   ├── segments/            ← Deal as a content type for segment builder
│   │   │   └── activity-log/        ← every CRUD generates an entry
│   │   ├── fieldUtils.ts            ← custom-field generation
│   │   ├── utils.ts                 ← createBoardItem, getTotalAmounts, watchItem, ...
│   │   └── constants.ts
│   ├── pos/                         ← POS config, orders, covers
│   │   ├── @types/
│   │   ├── db/
│   │   ├── graphql/                 ← extendTypes.ts extends ProductCategory
│   │   ├── trpc/
│   │   ├── meta/
│   │   │   ├── segments.ts
│   │   │   └── export/
│   │   └── routes.ts                ← /pos-init, /pos-sync-config
│   └── ecommerce/                   ← wishlists, reviews, addresses, last-viewed
│       ├── @types/
│       ├── db/models/
│       ├── graphql/
│       ├── trpc/
│       ├── routes.ts                ← /ecommerce-* REST surface
│       └── utils.ts
└── meta/
    ├── automations.ts               ← exported up to startPlugin meta.automations
    ├── segments.ts                  ← exported to meta.segments
    └── permissions.ts               ← RBAC matrix
```

## Frontend (`frontend/plugins/sales_ui/`)

```
src/
├── bootstrap.tsx                    ← React mount
├── config.tsx                       ← Module Federation expose: name, icon, navigation, modules[], widgets
├── MainNavigation.tsx               ← top-level nav for sales group
├── SalesSubNavigation.tsx
├── SalesSettingsNavigation.tsx
└── modules/
    ├── deals/                       ← the kanban / deal-management surface
    │   ├── Main.tsx                 ← deals routes entry
    │   ├── boards/                  ← board-level UI
    │   │   ├── hooks/useBoardDetails.ts
    │   │   └── components/
    │   ├── pipelines/               ← pipeline CRUD + config
    │   │   ├── hooks/usePipelineDetails.ts
    │   │   └── components/
    │   ├── stage/
    │   │   └── hooks/usePipelineStages.ts
    │   ├── cards/                   ← deal-card UI (the kanban card)
    │   │   ├── hooks/{useDeals,useChecklists,useDealCustomFieldEdit}.tsx
    │   │   └── components/{AddCardForm,WorkflowFields}.tsx
    │   ├── components/              ← AddDealSheet, ChooseDealSheet, SalesLeftSidebar, DealsTotalCount, ...
    │   │   ├── breadcrumb/SalesBreadCrumb.tsx
    │   │   └── deal-selects/
    │   ├── context/                 ← React contexts: Deal, PipelinesInline, StagesInline, BoardsInline, Drag
    │   ├── states/                  ← Jotai atoms: dealsBoardState, dealContainerState, dealsViewState, dealCreateSheetState, ...
    │   ├── graphql/
    │   │   ├── queries/
    │   │   ├── mutations/
    │   │   └── subscriptions/
    │   ├── types/                   ← TS types: deals, pipelines, stages, boards, checklists, attachments, products
    │   ├── constants/
    │   ├── schemas/                 ← Zod schemas: boardFormSchema, pipelineFormSchema
    │   ├── utils/
    │   └── actionBar/               ← filter + view toolbar
    └── pos/                         ← POS terminal config + orders + dashboards
        ├── Main.tsx
        ├── PosNavigation.tsx
        ├── PosOrderNavigation.tsx
        ├── components/              ← pos-create/, pos-edit/, pos-delete/, appearance/, payment/,
        │                              permission/, products/, slots/, syncCard/, deliveryConfig/,
        │                              screenConfig/, properties/
        ├── orders/                  ← order management (~80 files)
        │   ├── components/
        │   ├── detail/              ← order detail: modifiers, items, payments
        │   ├── graphql/
        │   ├── hooks/{useOrderInfo,useOrderItem,...}
        │   ├── states/
        │   └── types/
        ├── pos/                     ← POS dashboard
        ├── pos-by-items/            ← inventory view
        ├── graphql/
        ├── hooks/{useGetPos,usePayments,useCategories,usePosSlots,useProductGroups,useSalesStages}
        └── constants/
```

**Note:** there is no `frontend/plugins/sales_ui/src/modules/ecommerce/`. Ecommerce is REST-only on the sales side; the UI lives in `apps/client-portal-template/` and `apps/frontline-widgets/`.

## How modules talk to each other

- `deals` and `pos` both consume `core.Product`, `core.Customer`, `core.User` via federation
- `pos` extends `ProductCategory` with order-count fields (`pos/graphql/schemas/extendTypes.ts`)
- `pos` uses sales `Stage` for converting orders → deals (`pos/hooks/useSalesStages.ts`)
- `ecommerce` has no direct UI; its data flows out via REST and is consumed by the standalone apps

## How sales talks to other plugins

- `core` — Users, Customers, Companies, Branches, Departments, Tags, Products, ProductCategories
- `frontline` — Conversations and Tickets are linked via `Deal.sourceConversationIds[]`
- `operation` — segment association allows filtering Deals by related Tasks
- `payment` — `main.ts:71-129` intercepts payment-status callbacks for `contentType: 'sales:deal'`

See [`../../plugins/sales/INDEX.md`](../../plugins/sales/INDEX.md) for the full connections table.
