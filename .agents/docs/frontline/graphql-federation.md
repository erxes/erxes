# Frontline — GraphQL Federation

> How `frontline_api`'s GraphQL surface composes with other plugins via Apollo Federation. Read this before you touch schemas, custom resolvers, or add a `@key`.

## The big picture

`backend/gateway` runs Apollo Router. At startup, each plugin (`frontline_api`, `sales_api`, `core-api`, …) registers itself by handing the gateway its typedefs. The gateway composes them into a single supergraph.

Each plugin is a **subgraph**. Types are owned by exactly one subgraph and may be referenced (extended) by others.

## Frontline's owned types (`@key`)

From `backend/plugins/frontline_api/src/modules/`:
- `Channel`
- `Form`
- `Conversation`
- `Integration`
- `KnowledgeBaseTopic`
- `KnowledgeBaseCategory`
- `KnowledgeBaseArticle`

`@key(fields: "_id")` declares that **`_id` is sufficient to identify** this type. Other subgraphs that reference `Conversation` only need to know its `_id`; the frontline subgraph hydrates the rest.

## Types frontline references from other plugins (`@external`)

Extended (consumed from other plugins):
- `User`
- `Customer`
- `Company`
- `Tag`
- `Product`

`@external` means "this field is owned elsewhere; I just need to refer to it." Frontline never resolves these — the gateway routes the field to the owning subgraph (typically `core-api`).

## Federation in resolvers

Just like other subgraphs, frontline resolvers only return representations (`{ _id }`) for federated types (like `User` or `Customer`) and let the gateway query their owning subgraphs to hydrate them.

```ts
assignedUser: (conversation) =>
  conversation.assignedUserId ? { _id: conversation.assignedUserId } : null,
```

## DataLoaders (preventing N+1 within frontline)

For fields frontline owns, batching matters. DataLoaders are registered in `backend/plugins/frontline_api/src/connectionResolvers.ts` or per-request contexts to prevent N+1 queries.

## Common federation mistakes

- **Forgetting `@key` on a new type**: The supergraph composition fails at gateway startup.
- **Wrong `@key` field type**: If `Conversation._id` is `String!` in frontline but `ID!` in another plugin's reference, composition fails.
- **Returning more than the key from a federated resolver**: Return `{ _id }` representations instead of querying other plugins.
