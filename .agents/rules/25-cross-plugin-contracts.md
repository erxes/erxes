# 25 — Cross-Plugin Contracts

> How plugins talk to each other without violating architecture boundaries.

Plugins are isolated microservices. When a feature requires data or action across plugins (e.g., Sales Deal creation triggering a Frontline Notification), you must use one of the three established contract patterns.

## 1. GraphQL Federation (For Data Composition)

Use this when **UI needs data from multiple plugins in one view** (e.g., displaying a Customer's Deals).

### Mechanism
- The owning plugin defines the base type with `@key(fields: "_id")`.
- The extending plugin adds its fields to the base type.
- The Gateway (`gateway/`) merges them at startup.

### Rules
1. **Never import schemas directly.** Always extend.
2. Define extensions in `src/graphql/schemas/extensions.ts`.
3. Provide a `__resolveReference` in your resolver for your extended fields.

```typescript
// Good: Sales extending Core Customer
export const extensionsTypeDefs = `
  extend type Customer @key(fields: "_id") {
    _id: String! @external
    deals: [Deal]
  }
`;
```

## 2. tRPC (For Synchronous Backend Logic)

Use this when **Plugin A needs data or a synchronous action from Plugin B during a backend operation.**

### Mechanism
- Each plugin exposes a router in `src/trpc/`.
- Other plugins call it via the gateway's internal proxy.

### Rules
1. Never bypass the gateway.
2. Use the shared tRPC client wrapper if available, or fetch from `http://localhost:4000/trpc/plugin.procedure`.
3. Keep payloads small and serializable.
4. Input validation (Zod) is mandatory for all exposed procedures.

## 3. Redis PubSub / BullMQ (For Asynchronous Events)

Use this when **Plugin A emits an event that Plugin B (or multiple plugins) should react to**, without Plugin A knowing about Plugin B.

### Mechanism
- **PubSub:** Used for real-time GraphQL subscriptions (e.g., new message arrived).
- **BullMQ / messageBroker:** Used for background processing and cross-plugin side effects.

### Rules
1. Use standard event names: `pluginName:entity:action` (e.g., `sales:deal:created`).
2. Do not pass full entities in the payload if they are large; pass the `_id` and let the consumer fetch what it needs.
3. Catch all errors in consumer queues to avoid crashing the worker.

## The Contract File Structure

When documenting cross-plugin logic in a skill or spec:
1. Identify the consumer plugin.
2. Identify the provider plugin.
3. Name the exact federation type, tRPC route, or message broker event.
4. If modifying a contract, you must ensure BOTH plugins are updated and tested.
