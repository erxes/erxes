# 30 — Multi-tenancy

> Every request belongs to a subdomain. Every data access goes through subdomain-scoped models. **Ignoring this leaks data across tenants — the most damaging slop class.**

## The subdomain header

Every incoming request to the gateway carries (or is augmented with) a `subdomain` (logical tenant ID). This is propagated through to plugin APIs as `context.subdomain`.

```ts
// In every Apollo resolver
const resolver = async (_, args, { subdomain, models, user }) => {
  // `models` is ALREADY scoped to subdomain
  // `subdomain` is the tenant identifier
};
```

## Models are scoped per request

`generateModels(subdomain)` returns models bound to the tenant's MongoDB collections. Collections are prefixed with the subdomain (or live in a subdomain-specific DB, depending on deploy mode).

```ts
// In connectionResolvers.ts
export const generateModels = async (subdomain: string) => {
  const Users = loadUsersClass(subdomain);
  const Deals = loadDealsClass(subdomain);
  return { Users, Deals };
};
```

## Rules

### ✅ Always
- Use `models` from the request context, not a global instance.
- Pass `subdomain` to any helper that does data work.
- Verify `subdomain` is present in every resolver / tRPC procedure / Express route handler that touches data.

### ❌ Never
- Import a model class directly and call `.find({})` without subdomain scoping.
- Cache data globally (Redis, in-memory) without keying by subdomain.
- Cross-tenant query: hand-construct a query that reads from multiple subdomains in one go (it's almost always wrong).
- Hard-code a subdomain string. Tests use `'test'`; production reads from headers.

## Real gotchas

### BullMQ jobs
Jobs queued by tenant A but processed asynchronously must carry the subdomain in the job payload. Don't rely on request context — it's gone by the time the worker runs.

```ts
await emailQueue.add('send', {
  subdomain,           // ← carry it explicitly
  to: 'user@example.com',
  ...,
});
```

### Cron jobs / scheduled tasks
A single cron tick must iterate over all subdomains it cares about. Use `getSubdomains()` (or the equivalent in your plugin) to enumerate.

### Federation
Federated resolvers (`__resolveReference`) receive context with subdomain — pass it through.

### tRPC
`createContext` for tRPC routers receives subdomain from the gateway proxy. Procedures access it the same way as Apollo resolvers.

## Testing

```ts
// Use a stable test subdomain
beforeEach(async () => {
  models = await generateModels('test');
});

afterEach(async () => {
  await models.Users.deleteMany({});
  await models.Deals.deleteMany({});
});
```

Never use the production subdomain naming in tests. Stick to `'test'` (or `'test-<feature>'` for isolation between test files).

## If you're writing code that does NOT touch `models`

You probably don't need to think about subdomain. Examples: pure utility functions, schema definitions, type files, frontend components that consume data via Apollo (the gateway adds subdomain transparently).

If the code path eventually reads or writes data, subdomain must be in scope.
