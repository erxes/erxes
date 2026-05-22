# sales > pos

Point-of-sale: POS terminal configuration, orders, covers (tables), and inventory sync.

## Eval files (verify these after changes)

- `backend/plugins/sales_api/src/modules/pos/db/models/Pos.ts` — POS CRUD + sync logic
- `backend/plugins/sales_api/src/modules/pos/graphql/resolvers/mutations/pos.ts`
- `backend/plugins/sales_api/src/modules/pos/graphql/resolvers/mutations/orders.ts`
- `backend/plugins/sales_api/src/modules/pos/routes.ts` — `/pos-init`, `/pos-sync-config`
- `backend/plugins/sales_api/src/modules/pos/graphql/schemas/extendTypes.ts` — `ProductCategory` extension
- `frontend/plugins/sales_ui/src/modules/pos/Main.tsx`
- `frontend/plugins/sales_ui/src/modules/pos/orders/hooks/useOrderInfo.ts`
- `frontend/plugins/sales_ui/src/modules/pos/hooks/{useGetPos,usePayments,useCategories,usePosSlots,useProductGroups,useSalesStages}.ts(x)`

## All files involved

### Backend — types
- `backend/plugins/sales_api/src/modules/pos/@types/{pos,orders,covers}.ts`

### Backend — models & schemas
- `backend/plugins/sales_api/src/modules/pos/db/models/{Pos,Orders,Covers}.ts`
- `backend/plugins/sales_api/src/modules/pos/db/definitions/*` — Mongoose schemas

### Backend — GraphQL
- `backend/plugins/sales_api/src/modules/pos/graphql/schemas/{pos,orders,covers,extendTypes}.ts`
- `backend/plugins/sales_api/src/modules/pos/graphql/resolvers/queries/pos.ts`
- `backend/plugins/sales_api/src/modules/pos/graphql/resolvers/mutations/{pos,orders,covers}.ts`

### Backend — tRPC, routes, exports
- `backend/plugins/sales_api/src/modules/pos/trpc/pos.ts`
- `backend/plugins/sales_api/src/modules/pos/routes.ts` — `/pos-init`, `/pos-sync-config`
- `backend/plugins/sales_api/src/modules/pos/meta/segments.ts`
- `backend/plugins/sales_api/src/modules/pos/meta/export/exportHandlers.ts`

### Frontend — entry & navigation
- `frontend/plugins/sales_ui/src/modules/pos/Main.tsx`
- `frontend/plugins/sales_ui/src/modules/pos/PosNavigation.tsx`
- `frontend/plugins/sales_ui/src/modules/pos/PosOrderNavigation.tsx`

### Frontend — POS terminal config
- `frontend/plugins/sales_ui/src/modules/pos/components/pos-create/*`
- `frontend/plugins/sales_ui/src/modules/pos/components/pos-edit/*`
- `frontend/plugins/sales_ui/src/modules/pos/components/pos-delete/*`
- `frontend/plugins/sales_ui/src/modules/pos/components/{appearance,payment,permission,products,slots,syncCard,deliveryConfig,screenConfig,properties}/*`

### Frontend — orders
- `frontend/plugins/sales_ui/src/modules/pos/orders/components/*`
- `frontend/plugins/sales_ui/src/modules/pos/orders/detail/*` — modifiers, items, payments
- `frontend/plugins/sales_ui/src/modules/pos/orders/graphql/*`
- `frontend/plugins/sales_ui/src/modules/pos/orders/hooks/{useOrderInfo,useOrderItem,...}.ts(x)`
- `frontend/plugins/sales_ui/src/modules/pos/orders/states/*` — Jotai
- `frontend/plugins/sales_ui/src/modules/pos/orders/types/*`

### Frontend — dashboard & inventory views
- `frontend/plugins/sales_ui/src/modules/pos/pos/*`
- `frontend/plugins/sales_ui/src/modules/pos/pos-by-items/*`

### Frontend — shared GraphQL & hooks
- `frontend/plugins/sales_ui/src/modules/pos/graphql/*`
- `frontend/plugins/sales_ui/src/modules/pos/hooks/{useGetPos,usePayments,useCategories,usePosSlots,useProductGroups,useSalesStages}.ts(x)`
- `frontend/plugins/sales_ui/src/modules/pos/constants/*`

### Standalone POS client app
- `apps/posclient-front/*` — Next.js 14 POS client (separate process; consumes this plugin's surfaces)

## Connected to / related to

| Other surface | How | Where |
|---|---|---|
| **core / Product** | order items reference product IDs for pricing/availability | order schemas + `usePayments` |
| **core / ProductCategory** | extended with POS order-count fields via federation | `graphql/schemas/extendTypes.ts` |
| **sales > deals** | POS configurations reference a sales stage (`useSalesStages`) for converting orders → deals | `hooks/useSalesStages.ts` |
| **payment** | payment methods configured per POS; payment status callback flows through main.ts payment handler | `components/payment/*`, `main.ts` |
| **posclient app** | external Next.js client calls `/pos-init` and `/pos-sync-config` to bootstrap and refresh | `routes.ts` + `apps/posclient-front` |
| **inventory** | stock adjustments on order completion (implicit, via product references) | order mutations |

## Playwright test
See `../tests/pos.spec.ts`.
