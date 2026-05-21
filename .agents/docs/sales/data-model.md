# Sales — Data Model

> The shape of Deal, Pipeline, Stage, Board, Checklist, Label, and how they relate. Read this before any skill that touches the database layer.

## Entity-relationship overview

```
Board
  ↓ (1:N)
Pipeline
  ↓ (1:N, ordered by `order`)
Stage  ─── probability: 0-100, used in reporting
  ↓ (1:N)
Deal
  ├─ customerId          → core.Customer
  ├─ companyIds[]        → core.Company
  ├─ assignedUserIds[]   → core.User
  ├─ branchIds[]         → core.Branch
  ├─ departmentIds[]     → core.Department
  ├─ labelIds[]          → core.Tag  (note: also sales.Label exists, separate)
  ├─ productsData[]      → embedded { productId, qty, unitPrice, ... }
  ├─ sourceConversationIds[] → frontline.Conversation
  ├─ paymentsData        → JSON (populated by payment plugin callback)
  ├─ watcherUserIds[]    → core.User (subscribers)
  ├─ checklists[]        → 1:N → sales.Checklist (each has ChecklistItem[])
  └─ stageChangedDate    → Date (last stage move)
```

## Deal — the central entity

**Definition:** `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts`
**Model class:** `db/models/Deals.ts`
**GraphQL type:** `graphql/schemas/deal.ts`

### Key fields (representative — not exhaustive)

| Field | Type | Notes |
|---|---|---|
| `_id` | string | federation `@key` |
| `name` | string | required |
| `stageId` | string | required, references Stage |
| `customerId` | string \| null | links to core.Customer |
| `companyIds` | string[] | links to core.Company |
| `assignedUserIds` | string[] | the deal's owners |
| `watcherUserIds` | string[] | subscribers; notified on changes |
| `branchIds`, `departmentIds` | string[] | org-structure scoping |
| `labelIds` | string[] | tags (cross-plugin via core.Tag) |
| `productsData` | embedded[] | line items (see below) |
| `paymentsData` | JSON | populated externally by payment plugin |
| `sourceConversationIds` | string[] | inbound chat → deal links |
| `closeDate` | Date | expected close |
| `stageChangedDate` | Date | last column move (analytics) |
| `priority` | string \| null | free-text today (see `deals.ts:96`); commonly elevated to an enum |
| `description` | string | rich text |
| `createdAt`, `updatedAt`, `createdBy`, `modifiedBy` | tracking |

### productsData (embedded)

Each entry:
```ts
{
  _id: string,             // line-item id
  productId: string,       // → core.Product
  quantity: number,
  unitPrice: number,
  discount: number,
  tax: number,
  taxPercent: number,
  amount: number,          // computed: qty * unitPrice - discount + tax
  currency: string,
  // ... and a handful of other fields
}
```

`getTotalAmounts(deal)` in `modules/sales/utils.ts` is the canonical way to summarize `productsData` into total/taxed/discounted amounts.

### Checklist (1:N with Deal)

```
Deal
 └── Checklist (named) [1:N]
      └── ChecklistItem (text + isChecked) [1:N]
```

Model: `db/models/Checklists.ts`. Each Checklist has its own `_id`, a `contentType` ("sales:deal"), and a `contentTypeId` (the Deal's `_id`).

### Label (sales) — note the namespace

`sales.Label` is a colored tag specific to a Deal. **Not the same as `core.Tag`**, which is the cross-plugin tag entity. Deals reference both:
- `labelIds[]` → `core.Tag[]` (cross-plugin tagging)
- `salesPipelineLabels` (the pipeline's labels) → `sales.Label` (deal-specific coloring)

## Pipeline & Stage

**Pipeline definition:** `db/definitions/pipelines.ts`
**Stage definition:** `db/definitions/stages.ts`

```
Pipeline
  ├─ boardId
  ├─ type: 'deal' (always, for sales pipelines)
  ├─ visibility: 'public' | 'private'
  ├─ memberIds[], departmentIds[], branchIds[]  ← who can see
  ├─ excludeCheckUserIds[]                       ← exceptions
  ├─ tagIds[]                                    ← classification
  ├─ status: 'active' | 'archived'
  └─ order: number                               ← display order

Stage
  ├─ pipelineId
  ├─ probability: number    ← 0-100, used by stage-probability automation
  ├─ status: 'active' | 'archived'
  ├─ order: number          ← column order
  ├─ formId: string?        ← link to a form for conversion
  └─ name: string
```

## Federation surface (what other plugins see)

From `modules/sales/graphql/schemas/extensions.ts`:

```graphql
type Deal @key(fields: "_id") { _id: String! ... }
type SalesBoard @key(fields: "_id") { _id: String! ... }
type SalesPipeline @key(fields: "_id") { _id: String! ... }
type SalesStage @key(fields: "_id") { _id: String! ... }
type SalesPipelineLabel @key(fields: "_id") { _id: String! ... }

extend type User @key(fields: "_id") { _id: String! @external }
extend type Customer @key(fields: "_id") { _id: String! @external }
extend type Company @key(fields: "_id") { _id: String! @external }
extend type Tag @key(fields: "_id") { _id: String! @external }
extend type Product @key(fields: "_id") { _id: String! @external }
extend type Branch @key(fields: "_id") { _id: String! @external }
extend type Department @key(fields: "_id") { _id: String! @external }
extend type ProductCategory @key(fields: "_id") { _id: String! @external orderCount: Int }
```

## Computed fields (custom resolvers)

`modules/sales/graphql/resolvers/customResolvers/deal.ts` computes fields on the Deal that aren't stored:

- `customers`, `companies` — resolved from `customerId` / `companyIds[]` via DataLoader
- `assignedUsers`, `watchers` — resolved from user ID arrays
- `products` — resolved from `productsData[].productId` (embedded items get full product objects)
- `stage`, `pipeline`, `board` — resolved from `stageId`
- `branches`, `departments`, `labels` — resolved from their ID arrays
- `relations` — generic relation lookup (cross-plugin)

## DataLoaders

`modules/sales/graphql/resolvers/loaders/index.ts` registers DataLoaders so a deal list with N items doesn't N+1 query Users, Companies, Products. Always go through `context.loaders` rather than direct `models.Users.findOne` in a list resolver.

## Activity log

Every mutation on Deal/Pipeline/Stage/Board/Checklist generates an activity-log entry. Builders live in `modules/sales/meta/activity-log/`. When you add a new mutation, add a builder there too — otherwise the audit trail is incomplete.

## Segment content type

`Deal` is registered as a segment content type (`sales:deal`) backed by Elasticsearch index `deals`. Two-way associations exist with `core` (Company, Customer, Lead), `frontline` (Conversation, Ticket), `operation` (Task), and `cars`. When you add a new Deal field that should be filter-able in segments, also extend `meta/segments/segmentConfigs.ts`.
