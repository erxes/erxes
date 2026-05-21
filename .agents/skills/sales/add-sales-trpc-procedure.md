# add sales trpc procedure

> **When to use:** the wish exposes sales data/behavior to **another plugin** via type-safe RPC — e.g., `sales.deal.dealsForCustomer(customerId)` so frontline can show "open deals" inside a conversation card, or `sales.pos.activeTerminals()` so operation can list POS-affected branches. NOT for UI-only data flow (that's GraphQL) and NOT for fire-and-forget events (that's Redis pubsub — see [`../../rules/20-architecture-boundaries.md`](../../rules/20-architecture-boundaries.md)).

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters in `backend/plugins/sales_api/src/modules/sales/trpc/deal.ts`:

| Sister procedure | Shape | Why |
|---|---|---|
| `deal.findOne(input)` | query, returns one document | mirror for any "get one entity by id" |
| `deal.find({ query, skip, limit, sort })` | query, returns a paged list | mirror for any list/filter read |
| `deal.findDealProductIds({ _ids })` | query, returns a derived array via aggregation | mirror for a computed lookup |
| `deal.createItem` / `deal.editItem` / `deal.removeItem` | mutation, delegates to mutation/utils | mirror for any cross-plugin write |
| `pos.ecommerceGetBranches` | query that delegates to a utility (`getBranchesUtil`) | mirror for any "wrap a util as a procedure" |

**Read these files in full** before writing any code:

- `backend/plugins/sales_api/src/modules/sales/trpc/deal.ts` — the full `dealTrpcRouter`. Pay attention to the `t.procedure.input(z.any()).query/mutation(...)` shape and the `{ status: 'success', data: ... }` response convention
- `backend/plugins/sales_api/src/modules/pos/trpc/pos.ts` — sibling pos router showing the same pattern
- `backend/plugins/sales_api/src/trpc/init-trpc.ts` — `appRouter` merges all sub-routers. New top-level namespaces register here.
- [`../../rules/20-architecture-boundaries.md`](../../rules/20-architecture-boundaries.md) — when to use tRPC vs GraphQL federation vs pubsub
- `backend/erxes-api-shared/src/utils/*` — look for `sendTRPCMessage` (used in `deal.ts` line 430+) to understand the caller side

If your procedure needs to call **another plugin's** tRPC (e.g., sales calls core to fetch a customer), use the `sendTRPCMessage` pattern shown in `deal.ts` `fetchSegment` (lines 430–450).

## Phase 4 — PLAN

Default plan for adding a new procedure under an existing namespace (e.g., `deal.dealsForCustomer`):

1. **add procedure to existing router** — files: `backend/plugins/sales_api/src/modules/sales/trpc/deal.ts`
2. **(optional) extract shared logic** — only if a second caller emerges, otherwise inline ([`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md))
3. **playwright/eval** — files: `.agents/plugins/sales/tests/deals.spec.ts`

If the procedure is a brand-new namespace under sales (e.g., a `forecast.*` set of procedures), add one more commit:

4. **register namespace in init-trpc.ts** — files: `backend/plugins/sales_api/src/trpc/init-trpc.ts`

## Phase 5 — IMPLEMENT (step-by-step)

1. **Choose the sister procedure** that matches your shape. For a read: `find` or `findOne`. For a write: `createItem` or `editItem`. For aggregation: `findDealProductIds`.
2. **Add the procedure** as a property of the existing namespace object (e.g., inside `deal: t.router({ ... })`). Shape:
   ```ts
   yourProcedureName: t.procedure.input(z.any()).query(async ({ ctx, input }) => {
     const { models, subdomain } = ctx;
     // logic
     return { status: 'success', data: <result> };
   }),
   ```
   Use `.query(...)` for reads, `.mutation(...)` for writes. Returning `{ status, data }` is the convention every existing sales procedure uses — callers expect it.
3. **Validate input meaningfully** if it's a system-boundary contract. `z.any()` is the existing precedent for trust-the-caller plugin-to-plugin RPC; tighten only if you genuinely guard a public surface. Do not validate fields TypeScript already guarantees ([`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md) "validation at internal boundaries").
4. **Subdomain.** `ctx.subdomain` is populated by the gateway proxy. Every data access must scope through `models` (subdomain-bound). See [`../../rules/30-multi-tenancy.md`](../../rules/30-multi-tenancy.md).
5. **Reuse models / mutation utils.** Writes should delegate to `models.Deals.createDeal` or `mutations/utils.ts addDeal/editDeal` — the same path GraphQL takes. Do not duplicate write logic in the tRPC handler. See how `createItem` (deal.ts line 153) calls `addDeal`.
6. Run `.agents/evals/run.sh sales --backend-only`. Exit 0.
7. Test the call from outside: gateway proxies tRPC at `/trpc/*`. The caller plugin uses `sendTRPCMessage({ pluginName: 'sales', module: 'deal', action: 'dealsForCustomer', input: {...} })` — see the `fetchSegment` example at `deal.ts` line 430.

## Phase 6 — VERIFY

This skill's verify is weaker than the GraphQL ones because the consumer of a tRPC procedure is usually another backend service, not a UI. Two options:

- **Option A (preferred):** add a unit/integration test in `backend/plugins/sales_api/src/modules/sales/__tests__/<procedure>.test.ts` that builds a tRPC caller, runs the procedure against a seeded DB, and asserts the response. Mirror existing tests under `__tests__/` if any.
- **Option B (when the consuming plugin is in this repo):** find the caller (`sendTRPCMessage({ pluginName: 'sales', ... })`), write/update a Playwright spec for the consumer's UI surface that exercises the cross-plugin path end to end.

If neither is feasible, add a single Playwright assertion that an existing UI surface that *transitively* exercises the procedure still works (regression net), and document the gap in [`../../memory/lessons.md`](../../memory/lessons.md).

Run: `cd .agents && pnpm test plugins/sales/tests/deals.spec.ts`

## Pitfalls (specific to this skill)

- **Wrong escape hatch.** If the consumer plugin is the UI of another plugin (frontend), tRPC is overkill — that plugin's GraphQL client can just query the federated `Deal` type. tRPC is for **backend-to-backend** calls.
- **Direct import is illegal.** Even though both plugins live in the same repo, importing `models.Deals` from `frontline_api` directly violates [`../../rules/20-architecture-boundaries.md`](../../rules/20-architecture-boundaries.md). The point of tRPC is to avoid that import.
- **Subdomain hop.** When sales calls another plugin via `sendTRPCMessage`, you must include `subdomain` in the message. The gateway forwards it; the callee's `ctx.subdomain` picks it up. Forgetting causes the callee to operate on the wrong tenant.
- **Procedure naming.** The consumer reaches `sales.deal.dealsForCustomer` via `action: 'dealsForCustomer'`, `module: 'deal'`. The procedure key in the router must match the action name exactly.
- **Returning a Mongoose Document.** Always `.lean()` before returning. tRPC serializes via JSON; Mongoose docs carry methods that JSON drops, but they also carry hidden fields (`__v`, virtuals) that may surprise the caller.
- **`try/catch` discipline.** The sister `createItem` and `editItem` (deal.ts lines 162–172, 187–204) wrap their work in `try/catch` because they're a public boundary that returns `{ status: 'error', errorMessage }`. That's the only legitimate `try/catch` shape in sales tRPC. Don't add `try/catch` to a read that can't fail.

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No `try/catch` around a read that has no recovery path
- [ ] No new namespace if the procedure fits an existing one (`deal`, `stage`, `pipeline`, `pos`)
- [ ] No duplicated write logic — delegate to `models.*` or `mutations/utils.ts`
- [ ] No `z.object({...}).passthrough()` declared but unused — match existing `z.any()` precedent unless you genuinely guard a contract
- [ ] No swallowed subdomain — `ctx.subdomain` is threaded into every data access
- [ ] No returning a `Document`; always `.lean()`
