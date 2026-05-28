# sales plugin

**Backend:** `backend/plugins/sales_api/` — port **3305**
**Frontend:** `frontend/plugins/sales_ui/` — port **3005**

Sales pipelines, point-of-sale, and ecommerce surfaces for erxes. Three conceptual modules, ~530 source files total.

## Modules

| Module | Doc | Backend root | Frontend root |
|---|---|---|---|
| **deals** | [modules/deals.md](modules/deals.md) | `backend/plugins/sales_api/src/modules/sales/` | `frontend/plugins/sales_ui/src/modules/deals/` |
| **pos** | [modules/pos.md](modules/pos.md) | `backend/plugins/sales_api/src/modules/pos/` | `frontend/plugins/sales_ui/src/modules/pos/` |
| **ecommerce** | [modules/ecommerce.md](modules/ecommerce.md) | `backend/plugins/sales_api/src/modules/ecommerce/` | _(shared via GraphQL only)_ |

## External surfaces

### GraphQL federation
Exposed via `@key(fields: "_id")`:
- `Deal`
- `SalesBoard`
- `SalesPipeline`
- `SalesStage`
- `SalesPipelineLabel`

Extended (consumed from other plugins): `User`, `Branch`, `Department`, `Company`, `Customer`, `Tag`, `Product`, `ProductCategory`.
File: `backend/plugins/sales_api/src/modules/sales/graphql/schemas/extensions.ts`

### tRPC routers
Merged in `backend/plugins/sales_api/src/trpc/init-trpc.ts`:
- `sales.deal` — `backend/plugins/sales_api/src/modules/sales/trpc/deal.ts` (field list procedure)
- `sales.pos` — `backend/plugins/sales_api/src/modules/pos/trpc/pos.ts`
- `sales.ecommerce` — `backend/plugins/sales_api/src/modules/ecommerce/trpc/ecommerce.ts`

### Express routes
File: `backend/plugins/sales_api/src/routes.ts`
- `GET /pos-init` — initialize POS config
- `POST /pos-sync-config` — sync POS configuration
- `GET /ecommerce-init` — initialize ecommerce data
- `GET /ecommerce-product-summary` — product metadata
- `GET /ecommerce-last-viewed` — user's last viewed items
- `GET /ecommerce-wishlist` — wishlist data
- `GET /ecommerce-addresses` — saved addresses
- `GET /ecommerce-product-reviews` — product reviews
- `POST /ecommerce-bulk-operations` — batch ops

### BullMQ queues
None registered explicitly. Async work flows through automation/event dispatchers.

### Automation
File: `backend/plugins/sales_api/src/meta/automations.ts`
- **Triggers:** `sales:deal` (created), `sales:deal` with `relationType: 'probability'` (stage probability change)
- **Actions:** `create` on `sales:deal`, `create` on `sales:checklist`

### Segments
File: `backend/plugins/sales_api/src/meta/segments.ts`
- Content type: `sales:deal` (ElasticSearch index `deals`)
- Two-way associations: `core` (company, customer, lead), `frontline` (conversation, ticket), `operation` (task), `cars`

### Payment integration
`backend/plugins/sales_api/src/main.ts:71–129` — intercepts payment status updates for `contentType: 'sales:deal'` and updates `deal.paymentsData.bank`.

### Permissions
`backend/plugins/sales_api/src/meta/permissions.ts` — RBAC for deals/pipelines/stages/boards/checklists/labels.

## Cross-plugin consumers
- **core** — federates `Deal`/`SalesBoard`/`SalesPipeline`/`SalesStage` into composite responses
- **frontline** — links conversations and tickets to deals via `sourceConversationIds`
- **operation** — segment association allows filtering deals by related tasks
- **payment** — calls back into sales when a deal-attached invoice updates
- **cars** — segment association

## Cross-plugin dependencies
- **core** — `User`, `Customer`, `Company`, `Branch`, `Department`, `Tag`, `Product`, `ProductCategory`
- **frontline** — `Conversation`, `Ticket` references
- **payment** — for POS payment methods and deal invoice tracking
