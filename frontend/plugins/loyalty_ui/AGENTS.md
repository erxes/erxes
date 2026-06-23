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
model). The **Options** tab gains a typed **buyer** condition (customer *or*
company, via a `customerType` toggle) plus an **agent** (salesperson) condition,
**independent of** the `appliesTo` product switch.

Both forms render one shared component,
`edit-pricing/components/options/CustomerAgentConditions.tsx`, which also owns the
`CUSTOMER_AGENT_DEFAULTS`, `customerAgentFromDetail`, and `customerAgentToDoc`
helpers (load / save mapping). Host forms (`OptionsInfo`, `PricingCreateSheet`)
extend `CustomerAgentFormValues` and delegate the section + the save slice.

### Form values → doc fields

| Form value | Component (`ui-modules`) | Plan field |
| ---------- | ------------------------ | ---------- |
| `customerType` | `ToggleGroup` (customer/company) | `customerType` |
| `customerIds` | `SelectCustomer` (multiple) | `customerIds` |
| `customerTags` / `customerExcludeTags` | `SelectTags` (`tagType="core:customer"`) | `customerTags` / `customerExcludeTags` |
| `customerSegmentId` | `SelectSegment` (single → `[id]`) | `customerSegmentIds` |
| `companyIds` | `SelectCompany` (multiple) | `companyIds` |
| `companyTags` / `companyExcludeTags` | `SelectTags` (`tagType="core:company"`) | `companyTags` / `companyExcludeTags` |
| `companySegmentId` | `SelectSegment` (single → `[id]`) | `companySegmentIds` |
| `agentUserIds` | `SelectMember` (multiple) | `agentUserIds` |
| `agentUserPositions` | `SelectPositions` (multiple) | `agentUserPositions` |
| `agentSegmentId` | `SelectSegment` (single → `[id]`) | `agentSegmentIds` |

Reuse the existing selectors — no new pickers. `SelectSegment` is single-select
(stored as a one-element array, mirroring the product segment), and `SelectTags`
needs the entity's `tagType`. **Only the active `customerType`'s fields are
persisted** (`customerAgentToDoc` clears the inactive kind), so a plan never
carries contradictory stale targeting. Empty fields = no constraint.

### Implementation status

✅ **Done.** The shared `CustomerAgentConditions` renders in the **Options** tab
(`OptionsInfo.tsx`) and the create sheet (`PricingCreateSheet.tsx`); `types.ts`,
`graphql/queries.ts` (`PricingPlanDetail`), and `hooks/useCreatePricing.ts`
round-trip the typed fields. The legacy flat block was removed from `GeneralInfo`.
Verified with `npx tsc --noEmit` (0 errors). The loyalty_api contract + engine
landed earlier (see backend AGENTS.md).

## Validation

`pnpm nx lint loyalty_ui` · `pnpm nx build loyalty_ui` ·
`pnpm nx test loyalty_ui` (when tested behavior changes).
