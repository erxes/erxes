# Glossary

> Domain terms across all erxes plugins and cross-cutting platform concepts. If a term is in this file, every page in `.agents/` uses it consistently.

## Sales domain

### Deal
A sales opportunity tracked through a pipeline. Lives on a `Stage`. Has a `customerId`, `companyIds`, `assignedUserIds`, `productsData[]`, and free-form `paymentsData`. Backend: `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts`.

### Pipeline
A named sequence of `Stage`s. Belongs to a `Board`. Visualizes a single workflow (e.g., "New business," "Renewals"). Backend: `db/definitions/pipelines.ts`.

### Stage
A column on a pipeline kanban. Has a `probability` (0–100) used by reporting. Has an `order` (position). Backend: `db/definitions/stages.ts`.

### Board
The top-level container that holds one or more pipelines. Backend: `db/definitions/boards.ts`.

### Checklist
A list of `ChecklistItem`s attached to a Deal. Used for ad-hoc to-do tracking inside a deal. Backend: `db/models/Checklists.ts`.

### Label (sales)
A colored tag attached to a Deal. **Not the same as `Tag`** (which is a core type used across plugins). Backend: `db/models/Labels.ts`.

### productsData
Embedded array on Deal — the line items. Each entry is `{ productId, quantity, unitPrice, discount, tax, currency, amount, ... }`. Computed totals (`getTotalAmounts`) derive from this.

### sourceConversationIds
Array on Deal linking it to one or more frontline `Conversation`s. The pathway by which an inbound chat becomes a tracked sale.

### Watchers
Users who get notified when a Deal changes. Stored as user IDs on the Deal.

### stageChangedDate
Timestamp updated whenever a Deal moves between stages. Used for stage-time-in-stage analytics.

## POS domain (sales plugin)

### POS (config)
A configured point-of-sale terminal. Has payment methods, slots (tables), product permissions, and a sync state. Backend: `backend/plugins/sales_api/src/modules/pos/db/models/Pos.ts`.

### Cover
A table / venue / slot in a POS. Orders are opened on a cover. Backend: `db/models/Covers.ts`.

### Order
A POS transaction. Items are products with modifiers; payments are records of how it was settled. Backend: `db/models/Orders.ts`.

## Ecommerce domain (sales plugin)

### Wishlist
A customer's saved products. REST-only on the backend; consumed by `client-portal-template`.

### ProductReview
A customer's rating + comment on a product. REST-only.

### LastViewedItem
A customer's recent product views. Used for "you might like" suggestions.

## Frontline domain

### Conversation
An inbound or outbound communication thread between a customer and an agent. Has a status lifecycle: new → open → closed. Backend: `backend/plugins/frontline_api/src/modules/inbox/`.

### Channel
A routing container that maps integrations to team members. Conversations arrive via integrations and are routed through channels.

### Integration
A connection to an external communication platform (email, messenger, SMS, Facebook, Instagram, etc.). Each integration belongs to a brand and feeds conversations into channels.

### Ticket (frontline)
A support ticket tracked through a pipeline. Similar structure to Deal (board → pipeline → stage → ticket). Backend: `backend/plugins/frontline_api/src/modules/ticket/`.

### KnowledgeBase
Self-service documentation organized as Topic → Category → Article. Can be embedded in the messenger widget.

## Operation domain

### Task
A work item tracked through a pipeline (board → pipeline → stage → task). Has assignees, due dates, and status. Backend: `backend/plugins/operation_api/src/modules/task/`.

### GrowthHack
An experiment tracked through a pipeline. Has scoring fields (ease, impact, confidence, reach) for ICE/RICE prioritization. Backend: `backend/plugins/operation_api/src/modules/growthhack/`.

## Payment domain

### Payment Method
A configured payment provider (e.g., bank transfer, card, QPay, SocialPay). Backend: `backend/plugins/payment_api/`.

### Invoice
A payment request generated from a deal or POS order. Tracks amount, status, and payment history.

## Accounting domain

### Journal Entry
A double-entry bookkeeping record. Debits and credits must balance. Backend: `backend/plugins/accounting_api/`.

### Account (accounting)
A ledger account in the chart of accounts. Has a type (asset, liability, equity, revenue, expense).

## Loyalty domain

### Loyalty Program
A customer reward program with rules for earning and redeeming points. Backend: `backend/plugins/loyalty_api/`.

### Voucher
A redeemable reward issued to a customer. Has an expiration and redemption status.

### SpinWheel
A gamified reward mechanism. Customers spin a wheel to win vouchers or points.

## POS Client domain

### POS Client
A standalone point-of-sale terminal application. Syncs with the sales POS config for offline-capable order taking. Backend-only: `backend/plugins/posclient_api/`.

## Mongolian integrations domain

### Ebarimt
Mongolian tax receipt system. Generates VAT receipts for POS transactions. Required by law for retail.

### QPay / SocialPay
Mongolian digital payment platforms. Integrated as payment methods.

### XypService
Mongolian citizen/company data lookup service. Used for customer verification.

## Cross-cutting platform terms

### Subdomain
The tenant identifier. Every request carries it; every data access scopes to it. See [`../rules/30-multi-tenancy.md`](../rules/30-multi-tenancy.md).

### Plugin
A microservice. Backend: `backend/plugins/<name>_api/`. Frontend: `frontend/plugins/<name>_ui/`. Registers with the gateway at startup via Redis.

### Gateway
The API gateway at port 4000. Composes GraphQL federations, proxies REST and tRPC. Apollo Router under the hood.

### Federation
Apollo Federation. Plugins expose types via `@key(fields: "_id")` and reference each other's types via `@external`/`@provides`/`@requires`. Composed by the gateway at startup.

### Remote
A Module Federation remote — a frontend plugin that the host (`core-ui`) loads dynamically. Declared in `module-federation.config.ts`.

### Host
The Module Federation host = `core-ui`. Loads remotes by name.

### erxes-api-shared
The backend shared library at `backend/erxes-api-shared/`. Built to `dist/`, imported by every plugin via `erxes-api-shared/*`.

### erxes-ui
The frontend shared component library at `frontend/libs/erxes-ui/`. Singleton across host + remotes.

### ui-modules
The frontend shared UI module library at `frontend/libs/ui-modules/`. Singleton across host + remotes.

### Segment
A dynamic filter on a content type (e.g., "all Deals over $10k closing this month"). Defined per-plugin in `meta/segments.ts`. Backed by Elasticsearch.

### Automation
A trigger → action workflow defined in `meta/automations.ts`. Triggers fire on events; actions execute when their conditions match.

### tRPC procedure
A type-safe RPC endpoint. Plugin exposes via `src/trpc/`. Other plugins call via gateway proxy.

### Activity log
Every CRUD on a major entity (Deal, Pipeline, Stage, …) generates an activity log entry. Consumed by audit trails. See `meta/activity-log/`.

## Useful abbreviations

| Abbrev | Means |
|---|---|
| **API** | the backend services |
| **UI** | the frontend services |
| **SSR** | server-side rendered (Next.js apps) |
| **MF** | Module Federation |
| **MFE** | Micro-frontend (a Module Federation remote) |
| **GQL** | GraphQL |
| **PubSub** | graphql-redis-subscriptions |
| **EE** | Enterprise Edition (plugins under a non-AGPL license) |
