# Sales — GraphQL Federation

> How `sales_api`'s GraphQL surface composes with other plugins via Apollo Federation. Read this before you touch `extensions.ts`, `customResolvers/`, or add a `@key`.

## The big picture

`backend/gateway` runs Apollo Router. At startup, each plugin (`sales_api`, `core-api`, `operation_api`, …) registers itself by handing the gateway its typedefs. The gateway composes them into a single supergraph; queries to the gateway are planned and dispatched to the right subgraphs.

Each plugin is a **subgraph**. Types are owned by exactly one subgraph and may be referenced (extended) by others.

## Sales' owned types (`@key`)

```graphql
type Deal @key(fields: "_id") {
  _id: String!
  name: String
  stageId: String
  # ... full schema in modules/sales/graphql/schemas/deal.ts
}

type SalesBoard @key(fields: "_id") { _id: String! ... }
type SalesPipeline @key(fields: "_id") { _id: String! ... }
type SalesStage @key(fields: "_id") { _id: String! ... }
type SalesPipelineLabel @key(fields: "_id") { _id: String! ... }
```

`@key(fields: "_id")` declares that **`_id` is sufficient to identify** this type. Other subgraphs that reference `Deal` only need to know its `_id`; the sales subgraph hydrates the rest.

## Types sales references from other plugins (`@external`)

```graphql
# In modules/sales/graphql/schemas/extensions.ts
extend type User @key(fields: "_id") {
  _id: String! @external
}
extend type Customer @key(fields: "_id") {
  _id: String! @external
}
# Same pattern for: Company, Tag, Product, Branch, Department, ProductCategory
```

`@external` means "this field is owned elsewhere; I just need to refer to it." Sales never resolves these — the gateway routes the field to the owning subgraph (typically `core-api`).

## Federation in resolvers

When the UI queries:

```graphql
query {
  deals(stageId: "...") {
    _id
    name
    assignedUsers { _id email details { fullName } }
  }
}
```

Here's what happens:

1. Gateway plans: `_id` and `name` come from sales; `assignedUsers.{email, details}` come from core.
2. Sales resolves `deals(...)` returning a list of `Deal` documents.
3. Sales' `customResolvers/deal.ts` resolves `assignedUsers` — but only to `{ _id: ... }[]` (representations), not full User objects.
4. Gateway batches the User `_id`s and queries core's `_resolveReference` to hydrate them.

**You almost never need to touch `_resolveReference` from sales.** Just return representations (`{ _id }`) for federated types and let core do the rest.

```ts
// modules/sales/graphql/resolvers/customResolvers/deal.ts
assignedUsers: (deal) =>
  (deal.assignedUserIds || []).map(_id => ({ _id })),
```

## DataLoaders (preventing N+1 within sales)

Even for fields sales owns (e.g., resolving the `Stage` of a Deal), batching matters. `modules/sales/graphql/resolvers/loaders/index.ts` creates DataLoaders per request:

```ts
context.loaders = {
  stage: new DataLoader(stageIds => Stages.find({ _id: { $in: stageIds } })),
  // ... more loaders
};
```

Use `context.loaders.stage.load(deal.stageId)` instead of `models.Stages.findOne({ _id: deal.stageId })`. Otherwise a list of 100 deals = 100 stage queries.

## Adding a new owned type (`@key`)

If you're introducing a new sales entity (rare — usually you're adding fields to existing types):

1. Define the Mongoose schema in `modules/sales/db/definitions/`
2. Add the GraphQL type in `modules/sales/graphql/schemas/<entity>.ts` with `@key(fields: "_id")`
3. Add resolvers in `graphql/resolvers/{queries,mutations}/<entity>.ts`
4. Register the type in `extensions.ts` if other plugins need to extend it
5. Add a DataLoader if it'll be loaded in lists
6. Restart the gateway (federation composition happens on startup)

## Adding a field to an existing type

Most feature wishes hit this case. To add `priority: String` to Deal:

1. Mongoose schema: `modules/sales/db/definitions/deals.ts` — add to schema
2. TypeScript type: `modules/sales/@types/deal.ts` — add to interface
3. GraphQL type: `modules/sales/graphql/schemas/deal.ts` — add to `type Deal`
4. Mutation input: in the same file's `dealAdd` / `dealEdit` input
5. Resolver: usually no change needed — `models.Deals.createDeal(args)` accepts the new field
6. Frontend: see `skills/sales/add-deal-field.md` for the UI side

## Adding a new field to a referenced (external) type

E.g., "I want `User.preferredCurrency` on every Deal."

- Sales **cannot** add a field to a type it doesn't own.
- The owning subgraph (`core-api`) must add it.
- Once core ships, sales can reference it without changes.

## Common federation mistakes

### Forgetting `@key` on a new type
The supergraph composition fails at gateway startup. The whole API goes down.

### Wrong `@key` field type
If `Deal._id` is `String!` in sales but `ID!` in another plugin's reference, composition fails.

### Returning more than the key from a federated resolver
Don't do this:
```ts
assignedUsers: async (deal) => {
  const users = await callAnotherPlugin(deal.assignedUserIds);  // ❌
  return users;
};
```
The gateway handles the hydration. Return `[{ _id }]` and stop.

### Bypassing federation with `sendCommonMessage`
There's a legacy pattern of plugin-to-plugin RPC via `sendCommonMessage`. For new code, prefer federation or tRPC. If you must use it, document why in `memory/decisions.md`.

## Verifying federation

```bash
# Hit the gateway introspection
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __type(name: \"Deal\") { fields { name } } }"}'
```

If your new field appears here, federation is wired up correctly. If it doesn't, check:
1. The plugin restarted after your typedef change
2. The gateway re-composed (it should auto-recompose; if not, restart it)
3. The field is declared in the right schema file (not just the Mongoose definition)
