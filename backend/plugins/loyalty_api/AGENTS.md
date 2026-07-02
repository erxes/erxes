# loyalty_api — Plugin Rules & Notes

Backend microservice for loyalty features. **Pricing lives here** as a module
(`src/modules/pricing`), not as a standalone plugin.

## Pricing module map

| Concern     | Path                                                                                                             |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| Data model  | `src/modules/pricing/db/definitions/*` (`pricingPlan.ts` + `priceRule`/`quantityRule`/`expiryRule`/`repeatRule`) |
| Types       | `src/modules/pricing/@types/pricingPlan.ts`                                                                      |
| Calc engine | `src/modules/pricing/utils/index.ts` (`checkPricing`, `getMainConditions`), `utils/rule.ts`, `utils/product.ts`  |
| Eligibility | `src/modules/pricing/utils/eligibility.ts` (customer + broker gate)                                              |
| GraphQL     | `src/modules/pricing/graphql/{schemas,resolvers}/pricingPlan*`                                                   |
| tRPC entry  | `src/trpc/init-trpc.ts` → `pricing.checkPricing`                                                                 |

A **PricingPlan** is a discount rule. `checkPricing` finds the plans that apply
to a cart and returns, per line item, `{ type, value, bonusProducts }`. Callers
(sales_api, posclient_api, mongolian_api) reach it over tRPC.

---

## Feature: Customer & broker targeting ("dynamic conditions")

Historically a plan could target **products** (products/categories/tags/vendors/
product-segments/bundle) and **location/time** (branch/department/pipeline/dates).
It could **not** target _who_ is involved. This feature adds two who-dimensions:

- **Buyer** — the purchaser side of the sale.
- **Broker** — the intermediary side of the sale.

A plan applies only when **all enabled dimensions pass**:
`customer ✓ AND broker ✓ AND product ✓` — the product leg is unchanged.

### Data model (additive, on `IPricingPlan` + the Mongoose schema)

Buyer and broker each have customer/company/user sub-dimensions. There is no
type selector: customer and company constraints can be set at the same time, and
any constrained sub-dimension must match.

```
# buyer: customer dimension
customerIds          string[]   // include: match any
customerTags         string[]   // include: shares any tag
customerExcludeTags  string[]   // disqualify if the buyer carries any
customerSegmentIds   string[]   // member of any (core segment over customers)

# buyer: company dimension
companyIds           string[]
companyTags          string[]
companyExcludeTags   string[]
companySegmentIds    string[]

# buyer: user dimension
userIds              string[]
userPositions        string[]   // holds any of these positionIds
userSegmentIds       string[]   // member of any (segment over team-members / core:user)

# broker: customer dimension
brokerCustomerIds          string[]
brokerCustomerTags         string[]
brokerCustomerExcludeTags  string[]
brokerCustomerSegmentIds   string[]

# broker: company dimension
brokerCompanyIds           string[]
brokerCompanyTags          string[]
brokerCompanyExcludeTags   string[]
brokerCompanySegmentIds    string[]

# broker: user dimension
brokerUserIds        string[]
brokerUserPositions  string[]   // holds any of these positionIds
brokerUserSegmentIds string[]   // member of any (segment over team-members / core:user)
```

**Empty fields = no constraint.** Every pre-existing plan keeps behaving exactly
as before — this is fully backwards-compatible. There are intentionally **no
`is…Enabled` flags** (we follow the existing `segments`/`vendors`/`tags`
convention, not the rule-engine convention).

### Eligibility semantics (`utils/eligibility.ts`)

`planMatchesContext(subdomain, plan, { customerId, companyId, userId, brokerCustomerId, brokerCompanyId, brokerUserId }, cache?)`
→ `boolean`. The buyer dimensions evaluate `customerId` + `customer*`,
`companyId` + `company*`, and `userId` + `user*` independently. Broker
dimensions evaluate `brokerCustomerId` + `brokerCustomer*`, `brokerCompanyId` +
`brokerCompany*`, and `brokerUserId` + `brokerUser*` independently.
Per dimension (`matchesDimension`):

1. no id/tag/excludeTag/segment/position values → **unconstrained, passes**;
2. constrained but the caller supplied no entity id → **fails closed**;
3. an excluded tag (entity carries it) **always disqualifies**;
4. only exclusion set → "everyone except", passes otherwise;
5. otherwise pass if the id is in the include list **OR** shares any tag **OR**
   holds any position **OR** is a member of any segment.

Every constrained buyer/broker sub-dimension is combined with **AND**. Empty
sub-dimensions are unconstrained and pass.

Membership lookups, all **fail closed** if the core service is unreachable:

- segments → `segment.isInSegment(segmentId, idToCheck)` tRPC (Elasticsearch —
  the same dependency the product-segment path already relies on);
- tags / positions → `{customers,companies,users}.findOne` tRPC, reading
  `tagIds` / `positionIds` off the entity doc.

Pass a single `Map` (`EligibilityCache`) across all plans in one `checkPricing`
call. It memoizes both segment checks (`seg:${segmentId}:${entityId}`) and
entity-fact fetches (`doc:${kind}:${entityId}` → `{tagIds, positionIds}`), so N
plans referencing the same segment/entity fan out at most one tRPC call each.

### Wiring the gate into `checkPricing` (the remaining step)

`checkPricing` accepts optional `customerId` / `companyId` / `userId` /
`brokerCustomerId` / `brokerCompanyId` / `brokerUserId`, then inside the plan
loop, before processing items:

```ts
const cache = new Map<string, unknown>(); // once per checkPricing call
// ...
for (const plan of plans) {
  if (
    !(await planMatchesContext(
      subdomain,
      plan,
      {
        customerId,
        companyId,
        userId,
        brokerCustomerId,
        brokerCompanyId,
        brokerUserId,
      },
      cache,
    ))
  ) {
    continue;
  }
  // ... existing getAllowedProducts + rule calc (unchanged)
}
```

The contract (tRPC `checkPricingInput`, GraphQL `checkDiscountParams`, and the
`PricingPlanAddInput`/`EditInput` for the new fields) also carries
`customerId`/`companyId`/`userId`/`brokerCustomerId`/`brokerCompanyId`/
`brokerUserId`, and callers pass the values they can derive:

- **sales_api** `…/mutations/loyaltyUtils.ts` — `customerId` + `companyId`
  (deal relations via `getCustomerIds` / `getCompanyIds`), `userId =
deal.userId`, and `brokerUserId = deal.assignedUserIds?.[0]`.
- **posclient_api** `…/utils/pricing.ts` — `customerId = doc.customerId` only
  (the POS order input has no company or cashier/broker field, so company- and
  broker-targeted plans do not apply at point of sale — by design, not a gap).
- **mongolian_api** `…/handlers/handlePricing.ts` — from the deal.

### Implementation status

| Piece                                                                                             | Status                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IPricingPlan` + Mongoose schema fields                                                           | ✅ landed (additive)                                                                                                                                                                                                                          |
| `utils/eligibility.ts` + unit tests                                                               | ✅ landed, green                                                                                                                                                                                                                              |
| `checkPricing` gate wiring                                                                        | ✅ landed                                                                                                                                                                                                                                     |
| tRPC `checkPricingInput` + GraphQL inputs / `PricingPlan` type / `checkDiscountParams` + resolver | ✅ landed                                                                                                                                                                                                                                     |
| Caller threading                                                                                  | ✅ sales_api (customer + company + broker); ✅ posclient_api (customer only — POS order input has no company/cashier/broker field); ⏳ mongolian_api follow-up (its call uses `pluginName:'pricing'` and the deal exposes no direct customer) |
| Frontend form (`loyalty_ui`)                                                                      | ✅ Participants tab — simultaneous buyer (customer/company/user) + broker (customer/company/user) conditions                                                                                                                                  |

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
