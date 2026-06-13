# loyalty_api — Plugin Rules & Notes

Backend microservice for loyalty features. **Pricing lives here** as a module
(`src/modules/pricing`), not as a standalone plugin.

## Pricing module map

| Concern        | Path |
| -------------- | ---- |
| Data model     | `src/modules/pricing/db/definitions/*` (`pricingPlan.ts` + `priceRule`/`quantityRule`/`expiryRule`/`repeatRule`) |
| Types          | `src/modules/pricing/@types/pricingPlan.ts` |
| Calc engine    | `src/modules/pricing/utils/index.ts` (`checkPricing`, `getMainConditions`), `utils/rule.ts`, `utils/product.ts` |
| Eligibility    | `src/modules/pricing/utils/eligibility.ts` (customer + agent gate) |
| GraphQL        | `src/modules/pricing/graphql/{schemas,resolvers}/pricingPlan*` |
| tRPC entry     | `src/trpc/init-trpc.ts` → `pricing.checkPricing` |

A **PricingPlan** is a discount rule. `checkPricing` finds the plans that apply
to a cart and returns, per line item, `{ type, value, bonusProducts }`. Callers
(sales_api, posclient_api, mongolian_api) reach it over tRPC.

---

## Feature: Customer & agent targeting ("dynamic conditions")

Historically a plan could target **products** (products/categories/tags/vendors/
product-segments/bundle) and **location/time** (branch/department/pipeline/dates).
It could **not** target *who* is involved. This feature adds two who-dimensions:

- **Customer** — the contact the sale is for.
- **Agent** — the salesperson responsible (deal assignee / POS cashier).

A plan applies only when **all enabled dimensions pass**:
`customer ✓ AND agent ✓ AND product ✓` — the product leg is unchanged.

### Data model (additive, on `IPricingPlan` + the Mongoose schema)

```
customerIds          string[]   // include: match any
customerIdsExcluded  string[]   // disqualify if matched
customerSegmentIds   string[]   // member of any (core segment over customers)
agentIds             string[]
agentIdsExcluded     string[]
agentSegmentIds      string[]   // member of any (segment over team-members / core:user)
```

**Empty arrays = no constraint.** Every pre-existing plan keeps behaving exactly
as before — this is fully backwards-compatible. There are intentionally **no
`is…Enabled` flags** (we follow the existing `segments`/`vendors`/`tags`
convention, not the rule-engine convention).

### Eligibility semantics (`utils/eligibility.ts`)

`planMatchesContext(subdomain, plan, { customerId, agentId }, cache?)` → `boolean`.
Per dimension (`matchesDimension`):

1. no include/exclude/segment values → **unconstrained, passes**;
2. constrained but the caller supplied no id → **fails closed**;
3. an excluded id **always disqualifies**;
4. only an exclude list set → "everyone except", passes if not excluded;
5. otherwise pass if the id is in the include list **OR** a member of any segment.

Customer and agent are combined with **AND**; the customer check short-circuits
the agent check on failure.

Segment membership uses the core `segment.isInSegment(segmentId, idToCheck)`
tRPC procedure and **fails closed** if the segment service is unreachable. Pass
a single `Map` (`SegmentMembershipCache`) across all plans in one `checkPricing`
call so repeated `(segmentId, entityId)` lookups fan out only one tRPC call.
Segment evaluation depends on Elasticsearch — the same dependency the existing
product-segment path (`utils/product.ts`) already relies on.

### Wiring the gate into `checkPricing` (the remaining step)

`checkPricing` must accept optional `customerId` / `agentId`, then inside the
plan loop, before processing items:

```ts
const cache = new Map<string, boolean>(); // once per checkPricing call
// ...
for (const plan of plans) {
  if (!(await planMatchesContext(subdomain, plan, { customerId, agentId }, cache))) {
    continue;
  }
  // ... existing getAllowedProducts + rule calc (unchanged)
}
```

The contract (tRPC `checkPricingInput`, GraphQL `checkDiscountParams`, and the
`PricingPlanAddInput`/`EditInput` for the new fields) must also carry
`customerId`/`agentId`, and callers must pass them:

- **sales_api** `…/mutations/loyaltyUtils.ts` — `customerId` (already fetched via
  `getCustomerIds`), `agentId = deal.assignedUserIds?.[0]`.
- **posclient_api** `…/utils/pricing.ts` — `customerId = doc.customerId`,
  `agentId = doc.userId` (cashier).
- **mongolian_api** `…/handlers/handlePricing.ts` — from the deal.

### Implementation status

| Piece | Status |
| ----- | ------ |
| `IPricingPlan` + Mongoose schema fields | ✅ landed (additive) |
| `utils/eligibility.ts` + unit tests | ✅ landed, green |
| `checkPricing` gate wiring | ✅ landed |
| tRPC `checkPricingInput` + GraphQL inputs / `PricingPlan` type / `checkDiscountParams` + resolver | ✅ landed |
| Caller threading | ✅ sales_api (customer + agent); ✅ posclient_api (customer only — POS order input has no cashier/agent field); ⏳ mongolian_api follow-up (its call uses `pluginName:'pricing'` and the deal exposes no direct customer) |
| Frontend form (`loyalty_ui`) | ⏳ pending — see `frontend/plugins/loyalty_ui/AGENTS.md` |

> Cleanup done while wiring: removed stray `console.log` debug lines from
> `utils/index.ts`, `graphql/resolvers/queries/pricingPlan.ts`, and the sales
> caller `loyaltyUtils.ts`. One remains in `utils/product.ts` (`:118`) — left
> untouched to keep this change scoped.

## Testing

```bash
pnpm nx test loyalty_api                                  # all
pnpm nx test loyalty_api --testPathPattern eligibility    # this feature
```

Jest setup mirrors `erxes-agent_api` (`jest.config.ts` + `tsconfig.spec.json`,
`@nx/jest` target). Tests live in `__tests__/` next to the code. ts-jest runs in
`isolatedModules` (transpile-only) — **types are enforced by `pnpm build`/tsc**,
which lets test-first specs reference not-yet-wired code without breaking the run.
