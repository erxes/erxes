# sales > ecommerce

Customer-facing ecommerce surfaces: wishlists, product reviews, saved addresses, last-viewed items. Backend-only on this plugin's side — surfaced through public REST endpoints and consumed by `client-portal-template` / `frontline-widgets`.

## Eval files (verify these after changes)

- `backend/plugins/sales_api/src/modules/ecommerce/routes.ts` — all public REST endpoints
- `backend/plugins/sales_api/src/modules/ecommerce/db/models/Wishlist.ts`
- `backend/plugins/sales_api/src/modules/ecommerce/db/models/ProductReview.ts`
- `backend/plugins/sales_api/src/modules/ecommerce/db/models/Address.ts`
- `backend/plugins/sales_api/src/modules/ecommerce/db/models/LastViewedItems.ts`
- `backend/plugins/sales_api/src/modules/ecommerce/graphql/typeDefs.ts`
- `backend/plugins/sales_api/src/modules/ecommerce/utils.ts`

## All files involved

### Backend — types
- `backend/plugins/sales_api/src/modules/ecommerce/@types/{address,wishlist,productReview,lastViewedItem}.ts`

### Backend — models
- `backend/plugins/sales_api/src/modules/ecommerce/db/models/{Address,Wishlist,ProductReview,LastViewedItems}.ts`

### Backend — GraphQL
- `backend/plugins/sales_api/src/modules/ecommerce/graphql/typeDefs.ts`
- `backend/plugins/sales_api/src/modules/ecommerce/graphql/schema/{address,wishlist,productReview,lastViewedItem}.ts`
- `backend/plugins/sales_api/src/modules/ecommerce/graphql/resolvers/*` — custom resolvers

### Backend — tRPC, routes, utils
- `backend/plugins/sales_api/src/modules/ecommerce/trpc/ecommerce.ts`
- `backend/plugins/sales_api/src/modules/ecommerce/routes.ts`
- `backend/plugins/sales_api/src/modules/ecommerce/utils.ts`

### Frontend
This module has **no `frontend/plugins/sales_ui/src/modules/ecommerce/`** directory. It is consumed externally:
- `apps/client-portal-template/*` — Next.js 16 customer portal
- `apps/frontline-widgets/*` — embeddable widgets

Both apps call the Express routes below directly (not through the Apollo gateway).

## Public REST surface
Defined in `backend/plugins/sales_api/src/routes.ts`:
- `GET /ecommerce-init` — initialize / hydrate session
- `GET /ecommerce-product-summary` — product metadata aggregation
- `GET /ecommerce-last-viewed` — current user's last-viewed product IDs
- `GET /ecommerce-wishlist` — wishlist for the authenticated customer
- `GET /ecommerce-addresses` — saved shipping/billing addresses
- `GET /ecommerce-product-reviews` — reviews for a product
- `POST /ecommerce-bulk-operations` — batched ops (e.g., review submission, wishlist toggle)

## Connected to / related to

| Other surface | How | Where |
|---|---|---|
| **core / Product** | reviews / wishlist / last-viewed all reference product IDs | model schemas |
| **core / Customer** | every record is scoped by `customerId` | model schemas |
| **client-portal-template app** | primary consumer of the REST endpoints | `apps/client-portal-template/` |
| **frontline-widgets app** | embedded widgets (e.g., product reviews on a marketing page) | `apps/frontline-widgets/` |

## Playwright test
See `../tests/ecommerce.spec.ts`.
