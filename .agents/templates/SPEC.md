# SPEC: <wish title>

**Wish:** [`./WISH.md`](./WISH.md)
**Status:** draft / approved / shipped

## User-visible behavior

<2–4 sentences. What does the end user see and do? Avoid implementation language.>

Example: "Sales managers can set a priority on every Deal (low / medium / high). The priority shows as a colored dot on the deal card in board view. They can change it from the deal detail sheet."

## API contract changes

### GraphQL
- New field on type: `<type>.<field>: <type>`
- New input field: `<input>.<field>`
- New query: `<name>(args): <returnType>`
- New mutation: `<name>(args): <returnType>`
- New subscription: `<name>(args): <returnType>`

### tRPC
- New procedure: `<router>.<procedure>(input): <output>`

### REST (Express)
- New route: `<METHOD> <path>` → `<response shape>`

(Delete sections that don't apply. If no change in a category, write "None.")

## Data model changes

- **Entity:** `<Deal | Stage | ...>`
- **New fields:**
  - `<name>: <type>` — required? default? indexed?
- **Schema definition file:** `backend/plugins/sales_api/src/modules/sales/db/definitions/<entity>.ts`

## UI changes

- **New / modified components:**
  - `frontend/plugins/sales_ui/src/modules/<module>/<file>.tsx`
- **New forms / schemas (Zod):**
  - `frontend/plugins/sales_ui/src/modules/<module>/schemas/<name>.ts`
- **New routes:**
  - `<path>` → `<component>`
- **Module Federation exposes:** any change to `module-federation.config.ts`? (usually no for field additions)

## Acceptance criteria

Numbered list. Phase 6 (VERIFY) will turn each into at least one test assertion.

1. <user-visible thing 1>
2. <user-visible thing 2>
3. ...

## Test-coverage matrix (filled in this SPEC, enforced in Phase 6)

Classify every acceptance criterion above. **Wiring** = provable without seeded data (menu item exists, URL param updates, input has `min`/`max` attribute, network call fires with right variables). **Behavior** = requires seeded data ("the saved deal exposes the value," "the filter actually hides deals").

| # | Criterion (short) | Bucket | Plan |
|---|---|---|---|
| 1 | <criterion 1> | wiring \| behavior | live-gated test \| seed in beforeAll \| BLOCKED on wish <id> |
| 2 | <criterion 2> | wiring \| behavior | ... |

**Phase 6 floor:** at least one behavior-bucket criterion must be non-skipped (i.e., its test seeds its own fixtures and passes against a live stack). If every behavior criterion points at the same blocking wish, the wish has discovered an infra dependency — Phase 6 halts.

## Out of scope

- <what this SPEC does NOT change>
- <related thing the developer asked to defer>

## Open questions

(Should be empty by the time SPEC is approved. If not, ASK.)

## Approval

- [ ] Developer reviewed acceptance criteria
- [ ] Out-of-scope confirmed
- [ ] No open questions
