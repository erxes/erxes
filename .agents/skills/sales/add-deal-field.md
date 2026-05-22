# add deal field

> **When to use:** the wish adds a new field on `Deal` that the user can read and edit — e.g., a `dealColor` enum, a `riskScore` number, a `customerLifetimeValue` JSON.

> Heads-up: `priority` already exists across the schema, types, GraphQL, mutation input, and the UI fragment. Do **not** mirror "add `priority`" — read [`../../docs/sales/data-model.md`](../../docs/sales/data-model.md) for the canonical Deal shape and pick a field that isn't there yet.

## Surface-set checklist (resolve in Phase 0/2, not Phase 5)

Every "add deal field" wish needs to nail down **all four** of these in SPEC.md before grounding. Lessons accumulated from PR #7758 (riskLevel) and PR #7762/confidenceScore (this wish):

| Surface | Sister file | When to include |
|---|---|---|
| **Detail-sheet edit** (the persistent deal sheet) | `cards/components/detail/overview/SalesFormFields.tsx` + `components/deal-selects/SelectDealX.tsx` | When the wish says "editable from the deal detail sheet." `AddCardForm.tsx` is NOT this surface — that's the create-sheet. |
| **Kanban-card display** | `boards/components/DealsBoardCard.tsx` + `commonListFields` in `DealsQueries.ts` | When the field is visible on the board. Note: `commonListFields` is over-fetched on every list query — fine for tiny scalars, but consider `dealDetail`-only for big JSON/arrays. |
| **Add-deal sheet** (the create-sheet) | `cards/components/AddCardForm.tsx` + `constants/formSchema.ts` (Zod) | When the wish says "set on create." **No existing numeric/scalar Form.Field precedent exists in this form** — first such wish must do a clean deviation with a plain `<Input type="number" min={X} max={Y}>`. |
| **Action-bar filter** | `actionBar/components/SalesFilter.tsx` + `actionBar/constants/Filters.ts` + `components/common/filters/SelectX.tsx` | When the wish says "filterable." Audit the `priority` precedent for slop (`[String]` shape on a single-select UI = inherited slop). |

If a wish hits multiple surfaces, the SPEC must say so explicitly and the GROUND must read the sister file for each.

## Type-runtime contract (the "type lies" trap)

When the wish narrows the TypeScript type (e.g., a literal-union enum, an integer range), narrow the data layer too:

- **Mongoose:** `enum: [...]` for enums; `min: X, max: Y` for ranged numbers.
- **GraphQL:** declare an actual `enum RiskLevel` for enums, `Int` for integers (`Float` would let `60.5` through).
- **Resolver / model static:** for tighter ranges or business rules, validate in `models.Deals.createDeal/updateDeal` so non-UI write paths (tRPC, direct Mongo, forged GraphQL) are also guarded.

Without these, a TS type of `0..100` is enforced only by the UI input. A forged mutation can store 9001 and you'll discover it months later. See [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md) "TS literal-union without schema enum."

## Default-at-read vs default-at-write

Decide in SPEC, not in implementation:

- **Default-at-read** (UI coerces `undefined → default`): cheap to ship, no migration, but `models.Deals.find({ field: 'low' })` won't return undefined-deals. Acceptable for display-only fields.
- **Default-at-write** (backfill migration + new-deal default in `createDeal`): authoritative; the field is queryable. Required when the field is sorted or filtered with exact-match.

The action-bar `$gte` filter sidesteps the `undefined` problem; exact-match filters don't. SPEC must state which mode the wish uses and document the implication in "Out of scope."

## Filename uniqueness (don't inherit precedent slop)

If your wish needs both an edit-picker and a filter, **do not** create two files both named `Select<Field>.tsx` in sibling directories — that's the slop pattern logged in [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md) "Two files with the same basename in sibling directories." Pick one shape:

- `components/deal-selects/Select<Field>.tsx` (edit) **plus** `components/common/filters/Filter<Field>.tsx` (filter) — distinct basenames.
- Or one file in `components/deal-selects/Select<Field>.tsx` that namespaces both via `Object.assign(Root, { FilterBar, FilterView, FilterItem })`.

`priority` itself violates this rule today (two `SelectPriority.tsx` files); that's documented as precedent slop. Your wish doesn't have to inherit it.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

For this skill, the natural sisters are:

| Sister field | Why it's a good mirror |
|---|---|
| `priority` (string) | already wired through every layer — schema, type, GraphQL type + input, mutation variables, UI fragment |
| `closeDate` / `startDate` (Date) | shows how a non-string scalar threads through the same stack |
| `tagIds[]` (string array) | shows array shape end-to-end |

**Read these files in full** before writing any code. **Pick the frontend file-set that matches the surfaces in the SPEC's surface-set checklist above** — do not read the add-form files if the wish is detail-only, and don't skip the detail-sheet files if the wish says "editable from the deal."

Backend (always):
- `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts` — Mongoose schema (search for `priority:` at line 96)
- `backend/plugins/sales_api/src/modules/sales/@types/deal.ts` — `IDeal` interface (line 66 `priority?: string`)
- `backend/plugins/sales_api/src/modules/sales/graphql/schemas/deal.ts` — full GraphQL surface: `type Deal`, `queryParams`, `mutationParams` (priority at lines 43, 103, 214)
- `backend/plugins/sales_api/src/modules/sales/db/models/Deals.ts` — `createDeal` and `updateDeal` (the writes that accept the new field)
- `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/queries/deals.ts` — `generateFilter` (only if the field is filterable)

Frontend — always:
- `frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/DealsMutations.ts` — `commonFields`, `commonMutationVariables`, `commonMutationParams` (priority at lines 75, 164, 186)
- `frontend/plugins/sales_ui/src/modules/deals/graphql/queries/DealsQueries.ts` — `commonParams`, `commonParamDefs`, `commonListFields`
- `frontend/plugins/sales_ui/src/modules/deals/types/deals.ts` — the TS type the Apollo cache uses

Frontend — detail-sheet edit surface (when SPEC says "editable from the deal detail sheet"):
- `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail/overview/SalesFormFields.tsx` — where `SelectDealPriority` mounts (line 119-128 area)
- `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectPriority.tsx` — variant-aware picker
- `frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectDealPriority.tsx` — `useDealsEdit` wrapper

Frontend — kanban-card display surface (when SPEC says "show on card"):
- `frontend/plugins/sales_ui/src/modules/deals/boards/components/DealsBoardCard.tsx` — where `SelectDealPriority` renders (line 156)

Frontend — action-bar filter surface (when SPEC says "filterable"):
- `frontend/plugins/sales_ui/src/modules/deals/actionBar/components/SalesFilter.tsx` — 5 spots wired for each filter
- `frontend/plugins/sales_ui/src/modules/deals/actionBar/constants/Filters.ts` — filter registry
- `frontend/plugins/sales_ui/src/modules/deals/actionBar/types/actionBarTypes.ts` — `SalesFilterState`
- `frontend/plugins/sales_ui/src/modules/deals/components/common/filters/SelectPriority.tsx` — the separate filter picker

Frontend — add-deal sheet surface (when SPEC says "set on create"):
- `frontend/plugins/sales_ui/src/modules/deals/constants/formSchema.ts` — `salesFormSchema` (Zod)
- `frontend/plugins/sales_ui/src/modules/deals/cards/components/AddCardForm.tsx` — `<Form.Field>` rendering. **Caveat:** no existing numeric Form.Field exists in this form — first such wish does a clean deviation with `<Input type="number" min={X} max={Y}>` (mirror structure of the `name` Input).

Why: every layer needs the field. Skip one and either the write silently drops it or the read silently omits it. See [`../../rules/40-safety.md`](../../rules/40-safety.md) "It compiles but data doesn't appear."

## Phase 4 — PLAN

Atomic commits, ordered (rename `<field>` to your wish's field name):

1. **add `<field>` to Mongoose deal schema** — files: `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts`
2. **add `<field>` to `IDeal` TS interface** — files: `backend/plugins/sales_api/src/modules/sales/@types/deal.ts`
3. **add `<field>` to GraphQL `type Deal` and `mutationParams`** — files: `backend/plugins/sales_api/src/modules/sales/graphql/schemas/deal.ts`
4. **expose `<field>` in the UI mutation fragment + variables** — files: `frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/DealsMutations.ts`, `frontend/plugins/sales_ui/src/modules/deals/types/deals.ts`
5. **add `<field>` to the Zod form schema + AddCardForm** — files: `frontend/plugins/sales_ui/src/modules/deals/constants/formSchema.ts`, `frontend/plugins/sales_ui/src/modules/deals/cards/components/AddCardForm.tsx`
6. **playwright spec asserts field is present + persists** — files: `.agents/plugins/sales/tests/deals.spec.ts`

Each commit ≤ ~50 LOC. After commits 1–3 the backend compiles standalone; after commit 4 the UI compiles standalone.

## Phase 5 — IMPLEMENT (step-by-step)

For each commit:

1. **Mongoose schema (`deals.ts`)** — copy the `priority` line (line 96) and adapt. Pick `String`, `Number`, `Boolean`, `Date`, `[String]`, or `Schema.Types.Mixed`. Use `optional: true` unless the field is required. Add `index: true` only if you'll filter on it. Add `esType:` only if it needs to be searchable via segments.
2. **`@types/deal.ts`** — add the field to `interface IDeal`. Mark optional (`?`) unless you wire a not-null guard in `createDeal`.
3. **`schemas/deal.ts`** — add the field three times: inside `type Deal`, inside `mutationParams`, and (only if filterable) inside `queryParams`. The GraphQL types are `String`, `Float`, `Boolean`, `Date`, `[String]`, `JSON`.
4. **`DealsMutations.ts`** — add to `commonFields` (so the mutation returns it), `commonMutationVariables` (`$<field>: <Type>`), and `commonMutationParams` (`<field>: $<field>`). Mirror exactly how `priority` appears in lines 75/164/186.
5. **`types/deals.ts`** — add `<field>?: <ts-type>` to the `IDeal` (or equivalent) shape so Apollo cache types stay tight.
6. **`formSchema.ts` + `AddCardForm.tsx`** — extend `salesFormSchema` with a Zod entry, add a matching `defaultValues` key in `useForm`, add a `<Form.Field>` rendering the right input (`Input`, `SelectMember`, `Editor`, …). Use existing components from `erxes-ui` and `ui-modules` — don't invent.
7. After each commit, run `.agents/evals/run.sh sales`. Backend-only commits (1–3): pass `--backend-only`.

## Phase 6 — VERIFY

Open SPEC.md's Test-coverage matrix. Each criterion is either **wiring** (provable without seeded data) or **behavior** (requires seeded data). Write the test in the matching form per [WORKFLOW.md Phase 6](../../WORKFLOW.md#phase-6--verify):

- **Wiring tests** (live-gated on `AGENT_TEST_LIVE=1`) — for "menu item exists," "URL param updates," "input has `min`/`max` attribute," "field appears in `commonListFields`."
- **Behavior tests** (seed in `test.beforeAll`) — for "save round-trips the value," "filter actually hides deals," "Mongoose rejects out-of-range writes." See [`../../docs/sales/playwright-fixtures.md`](../../docs/sales/playwright-fixtures.md) for the canonical seed pattern.

**Behavior-coverage floor:** at least one behavior-bucket criterion must be non-skipped and pass. If the entire behavior surface is skipped against the same blocking wish, STOP — the wish has discovered an infra gap and is not shippable in its current form.

Run: `cd .agents && AGENT_TEST_LIVE=1 pnpm test plugins/sales/tests/deals.spec.ts`

If the wish makes the field segment-filterable, also follow [`./add-sales-segment-field.md`](./add-sales-segment-field.md) — adding a Mongoose path alone does **not** make the field appear in the segment builder.

## Pitfalls (specific to this skill)

- The field must appear in **`DealsMutations.ts` `commonFields`** — otherwise `dealsEdit` returns it as `undefined` and the Apollo cache wipes the value the user just saved.
- For arrays, the GraphQL declaration is `[String]` but the Mongoose declaration is `[String]` *inside* the schema definition — `type: [String]`, not `type: String, multi: true`.
- For enums, sales tends to model "controlled string" as `type: String` + a frontend `selectOptions` constant rather than a Mongoose `enum:`. Check the `priority` precedent — `priority` has no enum constraint at the schema level; valid values are enforced by the UI.
- Sister features like `priority` already populate `queryParams` — only add to `queryParams` if the wish includes filtering. Adding it "just in case" is slop ([`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md) "just-in-case parameters").
- `models.Deals.createDeal` and `updateDeal` accept the whole `IDeal` — no resolver change is needed if you stick to the spread pattern. If you added validation, it goes in `Deals.ts` static methods, not in the resolver.
- Multi-tenancy: schema and types are subdomain-agnostic, but **never** test against a hard-coded subdomain — see [`../../rules/30-multi-tenancy.md`](../../rules/30-multi-tenancy.md).

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No comment restating "// new field for X" — git log carries that
- [ ] No `try/catch` around `createDeal` / `updateDeal`
- [ ] No new helper for a single caller
- [ ] No `as any` around the new field's type
- [ ] If field is not filterable, `queryParams` was not touched
