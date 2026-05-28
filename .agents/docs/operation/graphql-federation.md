# Operation — GraphQL Federation

> How `operation_api`'s GraphQL surface composes with other plugins via Apollo Federation. Read this before you touch schemas, custom resolvers, or add a `@key`.

## The big picture

`backend/gateway` runs Apollo Router. At startup, each plugin (`operation_api`, `sales_api`, `core-api`, …) registers itself by handing the gateway its typedefs. The gateway composes them into a single supergraph.

Each plugin is a **subgraph**. Types are owned by exactly one subgraph and may be referenced (extended) by others.

## Operation's owned types (`@key`)

From `backend/plugins/operation_api/src/modules/`:
- `Team`

`@key(fields: "_id")` declares that **`_id` is sufficient to identify** this type. Other subgraphs that reference `Team` only need to know its `_id`; the operation subgraph hydrates the rest.

## Types operation references from other plugins (`@external`)

Extended (consumed from other plugins):
- `User`
- `Customer`
- `Company`
- `Tag`
- `Product`

`@external` means "this field is owned elsewhere; I just need to refer to it." Operation never resolves these — the gateway routes the field to the owning subgraph (typically `core-api`).

## Federation in resolvers

Just like other subgraphs, operation resolvers only return representations (`{ _id }`) for federated types (like `User` or `Customer`) and let the gateway query their owning subgraphs to hydrate them.

```ts
assignee: (task) =>
  task.assigneeId ? { _id: task.assigneeId } : null,
```

## DataLoaders (preventing N+1 within operation)

For fields operation owns, batching matters. DataLoaders are registered in `backend/plugins/operation_api/src/connectionResolvers.ts` or per-request contexts to prevent N+1 queries.
