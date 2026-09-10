# loyalty_ui — Plugin Rules & Notes

Frontend remote for loyalty. **Pricing UI lives here** under
`src/modules/pricing` + `src/pages/pricing`. Inherits the repo-wide frontend
rules in `frontend/plugins/AGENTS.md`.

## Pricing form map

| Concern                      | Path                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------- |
| Create form                  | `src/modules/pricing/create-pricing/**`                                         |
| Edit form (general)          | `src/modules/pricing/edit-pricing/components/general/GeneralInfo.tsx`           |
| Edit form (options/location) | `src/modules/pricing/edit-pricing/components/options/OptionsInfo.tsx`           |
| Edit form (participants)     | `src/modules/pricing/edit-pricing/components/participants/ParticipantsInfo.tsx` |
| Hooks / GraphQL / types      | `src/modules/pricing/{hooks,graphql,types}`                                     |

The general form is driven by React Hook Form. An `appliesTo` switch
(`category` / `product` / `segment` / `vendor` / `tag` / `bundle`) reveals the
matching **product**-targeting inputs. `handleSubmit` maps form values to the
`pricingPlanEdit` doc; `form.reset` maps a loaded plan back to form values.

---

## Feature: Customer & broker targeting ("dynamic conditions")

Adds two **who**-dimensions to a pricing plan alongside the existing product
targeting (see `backend/plugins/loyalty_api/AGENTS.md` for the engine + data
model). The **Participants** tab owns buyer conditions (customer, company, and
user) plus broker conditions (customer, company, and user), **independent of**
the `appliesTo` product switch. These sections can be used at the same time.

Both forms render one shared component,
`edit-pricing/components/options/CustomerBrokerConditions.tsx`, which also owns
the `CUSTOMER_BROKER_DEFAULTS`, `customerBrokerFromDetail`, and
`customerBrokerToDoc` helpers (load / save mapping). Host forms
(`ParticipantsInfo`, `PricingCreateSheet`) extend `CustomerBrokerFormValues` and
delegate the section + the save slice.

### Form values → doc fields

| Form value                                         | Component (`ui-modules`)                 | Plan field                                         |
| -------------------------------------------------- | ---------------------------------------- | -------------------------------------------------- |
| `customerIds`                                      | `SelectCustomer` (multiple)              | `customerIds`                                      |
| `customerTags` / `customerExcludeTags`             | `SelectTags` (`tagType="core:customer"`) | `customerTags` / `customerExcludeTags`             |
| `customerSegmentId`                                | `SelectSegment` (single → `[id]`)        | `customerSegmentIds`                               |
| `companyIds`                                       | `SelectCompany` (multiple)               | `companyIds`                                       |
| `companyTags` / `companyExcludeTags`               | `SelectTags` (`tagType="core:company"`)  | `companyTags` / `companyExcludeTags`               |
| `companySegmentId`                                 | `SelectSegment` (single → `[id]`)        | `companySegmentIds`                                |
| `userIds`                                          | `SelectMember` (multiple)                | `userIds`                                          |
| `userPositions`                                    | `SelectPositions` (multiple)             | `userPositions`                                    |
| `userSegmentId`                                    | `SelectSegment` (single → `[id]`)        | `userSegmentIds`                                   |
| `brokerCustomerIds`                                | `SelectCustomer` (multiple)              | `brokerCustomerIds`                                |
| `brokerCustomerTags` / `brokerCustomerExcludeTags` | `SelectTags` (`tagType="core:customer"`) | `brokerCustomerTags` / `brokerCustomerExcludeTags` |
| `brokerCustomerSegmentId`                          | `SelectSegment` (single → `[id]`)        | `brokerCustomerSegmentIds`                         |
| `brokerCompanyIds`                                 | `SelectCompany` (multiple)               | `brokerCompanyIds`                                 |
| `brokerCompanyTags` / `brokerCompanyExcludeTags`   | `SelectTags` (`tagType="core:company"`)  | `brokerCompanyTags` / `brokerCompanyExcludeTags`   |
| `brokerCompanySegmentId`                           | `SelectSegment` (single → `[id]`)        | `brokerCompanySegmentIds`                          |
| `brokerUserIds`                                    | `SelectMember` (multiple)                | `brokerUserIds`                                    |
| `brokerUserPositions`                              | `SelectPositions` (multiple)             | `brokerUserPositions`                              |
| `brokerUserSegmentId`                              | `SelectSegment` (single → `[id]`)        | `brokerUserSegmentIds`                             |

Reuse the existing selectors — no new pickers. `SelectSegment` is single-select
(stored as a one-element array, mirroring the product segment), and `SelectTags`
needs the entity's `tagType`. `customerBrokerToDoc` persists every section, so a
plan can carry customer and company constraints simultaneously. Empty fields = no
constraint.

### Implementation status

✅ **Done.** The shared `CustomerBrokerConditions` renders in the
**Participants** tab (`ParticipantsInfo.tsx`) and the create sheet
(`PricingCreateSheet.tsx`); `types.ts`,
`graphql/queries.ts` (`PricingPlanDetail`), and `hooks/useCreatePricing.ts`
round-trip the typed fields. The legacy flat block was removed from `GeneralInfo`.
Verified with `npx tsc --noEmit` (0 errors). The loyalty_api contract + engine
landed earlier (see backend AGENTS.md).

## Validation

`pnpm nx lint loyalty_ui` · `pnpm nx build loyalty_ui` ·
`pnpm nx test loyalty_ui` (when tested behavior changes).
