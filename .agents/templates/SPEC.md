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

- **Entity:** `<entity name>`
- **New fields:**
  - `<name>: <type>` — required? default? indexed?
- **Schema definition file:** `backend/plugins/<plugin>_api/src/modules/<module>/db/definitions/<entity>.ts`

## UI changes

- **New / modified components:**
  - `frontend/plugins/<plugin>_ui/src/modules/<module>/<file>.tsx`
- **New forms / schemas (Zod):**
  - `frontend/plugins/<plugin>_ui/src/modules/<module>/schemas/<name>.ts`
- **New routes:**
  - `<path>` → `<component>`
- **Module Federation exposes:** any change to `module-federation.config.ts`? (usually no for field additions)

## Acceptance criteria

Numbered list. Phase 6 (VERIFY) will turn each into at least one test assertion.

1. <user-visible thing 1>
2. <user-visible thing 2>
3. ...

## Out of scope

- <what this SPEC does NOT change>
- <related thing the developer asked to defer>

## Open questions

(Should be empty by the time SPEC is approved. If not, ASK.)

## Approval

- [ ] Developer reviewed acceptance criteria
- [ ] Out-of-scope confirmed
- [ ] No open questions
