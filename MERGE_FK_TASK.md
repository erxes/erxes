# Task: Finish & standardize post-merge foreign-key replacement (customer / company / product)

> Working doc for the unfinished part of Halit's merge-references work.
> Goal: when two records are merged, **every** plugin collection that still
> points at a merged-away (`status: deleted`) record must be repointed to the
> new merged record.

## ✅ COMPLETED (2026-06-23)

All four gaps below were implemented and the affected plugins build clean
(`nx run-many --target=build --projects=tourism_api,loyalty_api,frontline_api,posclient_api`).

1. **tourism_api** — was entirely missing a merge handler. Added
   `meta/afterProcessHandlers/coreMerge.ts` + `meta/afterProcess.ts`, wired via
   `meta: { afterProcess }` in `main.ts`. Handles `customersMerge` only (no
   company/product refs): `Bookings.customerId`, `Reviews.customerId`,
   `TourBookings.customerId`, `Orders.customerId`, and `Orders.additionalCustomers`
   (array → `$addToSet` + `$pull`).
2. **posclient_api** — added `Products.vendorId` repointing on `companiesMerge`.
3. **frontline_api** — replaced two **no-op** writes (`FacebookConversations.customerId`
   / `InstagramConversations.customerId`, fields that don't exist) with the real
   refs `FacebookCustomers.erxesApiId` / `InstagramCustomers.erxesApiId`
   ("Customer id at contacts-api"). NOTE: `*Conversations.erxesApiId` is a
   conversation id, NOT a customer id — deliberately left untouched.
4. **loyalty_api** — Coupon owner refs live only inside `usageLogs[]`, so the
   top-level `Coupons` owner update was a no-op; replaced with a nested
   `usageLogs.$[log].ownerId` update (arrayFilters). Added missed product refs:
   `priceRules/quantityRules/expiryRules[].discountBonusProduct` (arrayFilters)
   and `productsBundle` (`[[String]]`, rewritten in memory).

### Decision on the open questions
- **insurance_api is OUT of scope.** Its `InsuranceContract.customer/vendor/insuranceProduct`
  reference its **own internal** collections (`insurance_customers`, `vendors`,
  insurance-local `products`), NOT core contacts/products/companies. The audit's
  "insurance refs" were GraphQL query args, not persisted core FKs. No handler added.
- Historical/transactional records (orders, invoices, contracts) **are** repointed,
  consistent with every existing handler. If audit-pinning is later desired, revisit.

### Known harmless no-ops left in place (not missed FKs, safe)
- `sales_api`: `Stages.customerIds` / `Stages.companyIds` — deal↔contact links live
  in core `conformities` (handled by core merge), these fields aren't persisted in
  the sales schema. Writes match nothing.
- `frontline_api`: `CallCdrs.customerId` — left as existing handler had it.

---

## Original analysis (kept for reference)

## 1. Background — how merge works today

For **customer**, **company**, and **product** there is a "merge" mutation. Merging
A + B:

1. Creates a new record **C** with `C.mergedIds = [A, B]`.
2. Sets `A.status` and `B.status` to `deleted` (records are kept, not removed).
3. Fires reference-update logic so anything pointing at A/B now points at C.

Step 3 is the part that is **incomplete**. A/B keep living as `deleted` rows, but
other plugins' collections still hold `customerId: A`, `productId: B`, etc. Those
foreign keys must be replaced with C.

### Merge mutations & core models

| Entity   | Mutation         | Core model fn / file |
|----------|------------------|----------------------|
| Customer | `customersMerge` | `mergeCustomers()` — `backend/core-api/src/modules/contacts/db/models/Customers.ts` (~L325) → `updateCustomerMergeReferences()` |
| Company  | `companiesMerge` | `mergeCompanies()` — `backend/core-api/src/modules/contacts/db/models/Companies.ts` (~L248) → `updateCompanyMergeReferences()` |
| Product  | `productsMerge`  | `mergeProducts()` — `backend/core-api/src/modules/products/db/models/Products.ts` (~L348) → `updateProductMergeReferences()` |

The core `update*MergeReferences` fns only fix **core-owned** collections
(Conformities, Relations, EngageMessages, Products.vendorId, ProductRules,
ProductSimilarities, BundleRule, Packages, etc.).

### The cross-plugin mechanism — `afterProcess` hook

Each plugin repoints **its own** collections by listening to the merge mutations
via an `afterMutation` hook. Reference implementation (copy this pattern):

- Registration: `backend/plugins/sales_api/src/meta/afterProcess.ts`
- Handler:      `backend/plugins/sales_api/src/meta/afterProcessHandlers/coreMerge.ts`

The handler exports `mergeMutationNames` + `handleCoreMergeMutation(models, data)`.
`data` shape:

```ts
{
  mutationName: 'customersMerge' | 'companiesMerge' | 'productsMerge',
  args:   { customerIds?: string[]; companyIds?: string[]; productIds?: string[] }, // old A,B ids
  result: { _id: string },                                                          // new C id
}
```

Key helpers in the reference handler:
- Scalar FK: `Model.updateMany({ field: { $in: oldIds } }, { $set: { field: newId } })`
- Type-discriminated FK (customer vs company in same `customerId` field): filter on
  `customerType` (`'customer'` / missing / `''` for customer; `'company'` for company).
- Nested array of objects: positional `arrayFilters` (see `Deals.productsData`, `PosOrders.items`).
- Array of ids (`customerIds`, `companyIds`, `productIds`): `replaceArrayReferences()` —
  `$addToSet` newId, then `$pull` oldIds (avoids dupes).

## 2. What's DONE

Core-side reference updates exist, and these 7 plugins already have a
`coreMerge.ts` handler wired through `afterProcess.ts`:

| Plugin        | customer | company | product |
|---------------|----------|---------|---------|
| sales_api     | ✅ | ✅ | ✅ |
| accounting_api| ✅ | ✅ | ✅ |
| frontline_api | ✅ | ✅ | — (no product refs) |
| loyalty_api   | ✅ | ✅ | ✅ |
| mongolian_api | ✅ | ✅ | ✅ |
| payment_api   | ✅ | ✅ | — |
| posclient_api | ✅ | ✅ | ✅ |

## 3. What's MISSING (the actual work)

### 3a. Plugins with FK references but NO merge handler at all

These reference customer/company/product ids in their schemas but have **no
`meta/afterProcess.ts`** and **no `coreMerge.ts`** → their FKs are never repointed.

- **`tourism_api`** — `customerId` (required) in:
  - `src/modules/ota/db/definitions/tourBookings.ts`
  - `src/modules/ota/db/definitions/reviews.ts`
  - `src/modules/ota/db/definitions/bookings.ts`
  - `src/modules/bms/db/definitions/order.ts`
  - (also check `src/modules/bms/graphql/schemas/tour.ts` — likely productId/vendorId)
- **`insurance_api`** — `customerId`, `productId`, `vendorId` (company) in
  `InsuranceContract` and related collections:
  - `src/modules/insurance/graphql/schemas/insurance.ts` (find the backing model/definition files for the real persisted collections)

For each: create `meta/afterProcessHandlers/coreMerge.ts` + wire `meta/afterProcess.ts`
(copy sales pattern), then make sure the plugin's `meta` is registered so core
dispatches `afterMutation` to it (compare with how sales registers `afterProcess`).

### 3b. Audit the 7 existing handlers for MISSED collections

The handlers may not cover every collection in their own plugin. For each of the 7
plugins, list every collection field that stores a customer/company/product id and
confirm the handler updates it. Quick scan per plugin:

```bash
rg -n "customerId|companyId|productId|customerIds|companyIds|productIds" \
   backend/plugins/<plugin>_api/src --glob '**/db/**' --glob '**/models/**' --glob '**/definitions/**'
```

Cross-check each hit against its plugin's `coreMerge.ts`. Watch especially for:
- nested-array fields (`*.productId` inside an array) needing `arrayFilters`;
- `vendorId` / `supplierId` style company refs (easy to forget);
- array-of-id fields needing the `$addToSet` + `$pull` pattern, not `$set`.

> sales_api currently covers (for reference): customer → PosOrders, ProductReview,
> Wishlist, LastViewedItem, Address, Stages.customerIds; company → PosOrders,
> Stages.companyIds; product → Deals.productsData, PosOrders.items, ProductReview,
> Wishlist, LastViewedItem. Confirm nothing else in sales references these ids.

### 3c. Confirm core-side coverage

Re-read `updateCustomerMergeReferences` / `updateCompanyMergeReferences` /
`updateProductMergeReferences` and verify they cover all core collections (the
explore pass listed Conformities, Relations, EngageMessages, CPUser, Products.vendorId,
ProductRules, ProductSimilarities, BundleRule, Packages). Note anything they skip.

## 4. Conventions / gotchas (from `AGENTS.md`)

- No `default` exports, no `any`, no relative cross-plugin imports — keep handlers
  self-contained inside their own plugin (use `~/connectionResolvers` `IModels`).
- Don't introduce new `schemaWrapper` usage.
- Keep the array helper + type-discriminator approach identical across plugins so
  the handlers stay "jigd" (uniform) and reviewable.
- Each handler must early-return when `oldIds.length === 0` or mutation/result is
  missing (see reference).

## 5. Suggested order of work

1. Audit pass: produce the full per-plugin FK field inventory (3b + 3c) so we know
   the true scope before editing.
2. Add `tourism_api` handler + wiring (3a).
3. Add `insurance_api` handler + wiring (3a).
4. Patch any missed collections found in the 7 existing handlers (3b).
5. Build affected plugins: `pnpm nx build <plugin>_api`.
6. (If feasible) a small integration test merging A+B and asserting a referencing
   doc now points at C.

## 6. Open questions for the user

- Should `insurance_api` / `tourism_api` actually participate in merge, or are those
  ids intentionally immutable (historical records)? Confirm before wiring.
- For "deleted" historical/transactional records (orders, invoices, contracts already
  closed) — repoint them too, or leave them pinned to the original id for audit? The
  current handlers repoint everything; confirm that's desired for financial/historical data.
