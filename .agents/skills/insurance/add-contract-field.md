# add contract field

> **When to use:** the wish adds a new field on `Contract` that the user can read and edit — e.g., a `contractColor` enum, a `riskScore` number, a `customerLifetimeValue` JSON.

> Heads-up: `priority` already exists across the schema, types, GraphQL, mutation input, and the UI fragment. Do **not** mirror "add `priority`" — read [`../../docs/insurance/data-model.md`](../../docs/insurance/data-model.md) for the canonical Contract shape and pick a field that isn't there yet.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

For this skill, the natural sisters are:

| Sister field | Why it's a good mirror |
|---|---|
| `priority` (string) | already wired through every layer — schema, type, GraphQL type + input, mutation variables, UI fragment |
| `closeDate` / `startDate` (Date) | shows how a non-string scalar threads through the same stack |
| `tagIds[]` (string array) | shows array shape end-to-end |

**Read these files in full** before writing any code:

Backend:
- `backend/plugins/insurance_api/src/modules/insurance/db/definitions/contract.ts` — Mongoose schema (search for `priority:` at line 96)
- `backend/plugins/insurance_api/src/modules/insurance/@types/contract.ts` — `IContract` interface (line 66 `priority?: string`)
- `backend/plugins/insurance_api/src/modules/insurance/graphql/schemas/contract.ts` — full GraphQL surface: `type Contract`, `queryParams`, `mutationParams` (priority at lines 43, 103, 214)
- `backend/plugins/insurance_api/src/modules/insurance/db/models/Contracts.ts` — `createContract` and `updateContract` (the writes that accept the new field)

Frontend:
- `frontend/plugins/insurance_ui/src/graphql/mutations.ts` — `commonFields` fragment, `commonMutationVariables`, `commonMutationParams` (priority at lines 75, 164, 186)
- `frontend/plugins/insurance_ui/src/constants/formSchema.ts` — `insuranceFormSchema` (the Zod schema feeding `AddCardForm`)
- `frontend/plugins/insurance_ui/src/components/AddContractForm.tsx` — how a Zod field becomes a `<Form.Field>` row
- `frontend/plugins/insurance_ui/src/types/contracts.ts` — the TS type the Apollo cache uses

Why: every layer needs the field. Skip one and either the write silently drops it or the read silently omits it. See [`../../rules/40-safety.md`](../../rules/40-safety.md) "It compiles but data doesn't appear."

## Phase 4 — PLAN

Atomic commits, ordered (rename `<field>` to your wish's field name):

1. **add `<field>` to Mongoose contract schema** — files: `backend/plugins/insurance_api/src/modules/insurance/db/definitions/contract.ts`
2. **add `<field>` to `IContract` TS interface** — files: `backend/plugins/insurance_api/src/modules/insurance/@types/contract.ts`
3. **add `<field>` to GraphQL `type Contract` and `mutationParams`** — files: `backend/plugins/insurance_api/src/modules/insurance/graphql/schemas/contract.ts`
4. **expose `<field>` in the UI mutation fragment + variables** — files: `frontend/plugins/insurance_ui/src/graphql/mutations.ts`, `frontend/plugins/insurance_ui/src/types/contracts.ts`
5. **add `<field>` to the Zod form schema + AddCardForm** — files: `frontend/plugins/insurance_ui/src/constants/formSchema.ts`, `frontend/plugins/insurance_ui/src/components/AddContractForm.tsx`
6. **playwright spec asserts field is present + persists** — files: `.agents/plugins/insurance/tests/contracts.spec.ts`

Each commit ≤ ~50 LOC. After commits 1–3 the backend compiles standalone; after commit 4 the UI compiles standalone.

## Phase 5 — IMPLEMENT (step-by-step)

For each commit:

1. **Mongoose schema (`contracts.ts`)** — copy the `priority` line (line 96) and adapt. Pick `String`, `Number`, `Boolean`, `Date`, `[String]`, or `Schema.Types.Mixed`. Use `optional: true` unless the field is required. Add `index: true` only if you'll filter on it. Add `esType:` only if it needs to be searchable via segments.
2. **`@types/contract.ts`** — add the field to `interface IContract`. Mark optional (`?`) unless you wire a not-null guard in `createContract`.
3. **`schemas/contract.ts`** — add the field three times: inside `type Contract`, inside `mutationParams`, and (only if filterable) inside `queryParams`. The GraphQL types are `String`, `Float`, `Boolean`, `Date`, `[String]`, `JSON`.
4. **`ContractsMutations.ts`** — add to `commonFields` (so the mutation returns it), `commonMutationVariables` (`$<field>: <Type>`), and `commonMutationParams` (`<field>: $<field>`). Mirror exactly how `priority` appears in lines 75/164/186.
5. **`types/contracts.ts`** — add `<field>?: <ts-type>` to the `IContract` (or equivalent) shape so Apollo cache types stay tight.
6. **`formSchema.ts` + `AddCardForm.tsx`** — extend `insuranceFormSchema` with a Zod entry, add a matching `defaultValues` key in `useForm`, add a `<Form.Field>` rendering the right input (`Input`, `SelectMember`, `Editor`, …). Use existing components from `erxes-ui` and `ui-modules` — don't invent.
7. After each commit, run `.agents/evals/run.sh insurance`. Backend-only commits (1–3): pass `--backend-only`.

## Phase 6 — VERIFY

Add to `.agents/plugins/insurance/tests/contracts.spec.ts`:

- a test that opens the "Add contract" sheet and asserts the new field's label/input is visible
- a test that fills the field, submits, and (when a seeded board/pipeline exists) asserts the saved contract exposes the field on reload

Run: `cd .agents && pnpm test plugins/insurance/tests/contracts.spec.ts`

If the wish makes the field segment-filterable, also follow [`./add-insurance-segment-field.md`](./add-insurance-segment-field.md) — adding a Mongoose path alone does **not** make the field appear in the segment builder.

## Pitfalls (specific to this skill)

- The field must appear in **`ContractsMutations.ts` `commonFields`** — otherwise `contractsEdit` returns it as `undefined` and the Apollo cache wipes the value the user just saved.
- For arrays, the GraphQL declaration is `[String]` but the Mongoose declaration is `[String]` *inside* the schema definition — `type: [String]`, not `type: String, multi: true`.
- For enums, insurance tends to model "controlled string" as `type: String` + a frontend `selectOptions` constant rather than a Mongoose `enum:`. Check the `priority` precedent — `priority` has no enum constraint at the schema level; valid values are enforced by the UI.
- Sister features like `priority` already populate `queryParams` — only add to `queryParams` if the wish includes filtering. Adding it "just in case" is slop ([`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md) "just-in-case parameters").
- `models.Contracts.createContract` and `updateContract` accept the whole `IContract` — no resolver change is needed if you stick to the spread pattern. If you added validation, it goes in `Contracts.ts` static methods, not in the resolver.
- Multi-tenancy: schema and types are subdomain-agnostic, but **never** test against a hard-coded subdomain — see [`../../rules/30-multi-tenancy.md`](../../rules/30-multi-tenancy.md).

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No comment restating "// new field for X" — git log carries that
- [ ] No `try/catch` around `createContract` / `updateContract`
- [ ] No new helper for a single caller
- [ ] No `as any` around the new field's type
- [ ] If field is not filterable, `queryParams` was not touched
