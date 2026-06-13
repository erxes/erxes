# loyalty_ui — Plugin Rules & Notes

Frontend remote for loyalty. **Pricing UI lives here** under
`src/modules/pricing` + `src/pages/pricing`. Inherits the repo-wide frontend
rules in `frontend/plugins/AGENTS.md`.

## Pricing form map

| Concern | Path |
| ------- | ---- |
| Create form | `src/modules/pricing/create-pricing/**` |
| Edit form (general) | `src/modules/pricing/edit-pricing/components/general/GeneralInfo.tsx` |
| Edit form (options/location) | `src/modules/pricing/edit-pricing/components/options/OptionsInfo.tsx` |
| Hooks / GraphQL / types | `src/modules/pricing/{hooks,graphql,types}` |

The general form is driven by React Hook Form. An `appliesTo` switch
(`category` / `product` / `segment` / `vendor` / `tag` / `bundle`) reveals the
matching **product**-targeting inputs. `handleSubmit` maps form values to the
`pricingPlanEdit` doc; `form.reset` maps a loaded plan back to form values.

---

## Feature: Customer & agent targeting ("dynamic conditions")

Adds two **who**-dimensions to a pricing plan alongside the existing product
targeting (see `backend/plugins/loyalty_api/AGENTS.md` for the engine + data
model). The form gains a **Customer** and an **Agent** condition section,
**independent of** the `appliesTo` product switch (a plan can target a customer
*and* a product at once).

### New form values → doc fields

| Form value | Component (from `ui-modules`) | Plan field |
| ---------- | ----------------------------- | ---------- |
| `customerIds` | `SelectCustomer` (multiple) | `customerIds` |
| `customerIdsExcluded` | `SelectCustomer` (multiple) | `customerIdsExcluded` |
| `customerSegmentId` | `SelectSegment` (single → stored as `[id]`) | `customerSegmentIds` |
| `agentIds` | `SelectMember` (multiple) | `agentIds` |
| `agentIdsExcluded` | `SelectMember` (multiple) | `agentIdsExcluded` |
| _(not exposed — backend-only)_ | — | `agentSegmentIds` |

Reuse the existing selectors — do **not** introduce a new picker. `SelectSegment`
is single-select with **no `contentType` prop** (it lists all segments, exactly
like the existing product-`segments` usage), so `customerSegmentId` is stored as a
one-element array `[id]`, mirroring how the product segment is persisted. There is
no scoped team-member segment picker, so `agentSegmentIds` is left backend-only
(adding a `contentType` to the shared `SelectSegment` would be out of scope). Empty
selections send empty arrays (= no constraint), preserving current behavior. The
who-conditions are written unconditionally (independent of the `appliesTo` switch).

### Required edits

1. Extend `GeneralFormValues` with the six fields above (+ defaults in `useForm`).
2. Extend the `form.reset` mapping to hydrate them from `pricingDetail`.
3. Extend `handleSubmit` to write them onto the edit doc (unconditionally — they
   are not gated by `appliesTo`).
4. Mirror in the create-pricing form.
5. Add the fields to the plan TS type + GraphQL fragments/queries/mutations in
   `src/modules/pricing/{types,graphql}` so they round-trip. Keep operation names
   prefixed (`pricingPlan…`) and unique. Do **not** change backend GraphQL
   contracts from the frontend — the loyalty_api side owns those.

### Implementation status

✅ **Done.** Both forms (`create-pricing/PricingCreateSheet.tsx` +
`edit-pricing/.../general/GeneralInfo.tsx`) carry the Customer & Agent section;
`types.ts`, `graphql/queries.ts` (`PricingPlanDetail`), and
`hooks/useCreatePricing.ts` round-trip the six fields. Verified with
`pnpm nx lint loyalty_ui` (0 errors) and `pnpm nx build loyalty_ui` (success).
The loyalty_api contract + engine landed earlier (see backend AGENTS.md).

## Validation

`pnpm nx lint loyalty_ui` · `pnpm nx build loyalty_ui` ·
`pnpm nx test loyalty_ui` (when tested behavior changes).
