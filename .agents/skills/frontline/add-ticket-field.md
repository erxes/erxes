# add ticket field

> **When to use:** the wish adds a new field on `Ticket` that the user can read and edit — e.g., a `ticketColor` enum, a `urgencyScore` number, etc.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

For this skill, the natural sisters are:

| Sister field | Why it's a good mirror |
|---|---|
| `priority` (number) | already wired through every layer — schema, type, GraphQL type + input, mutation variables, UI fragment |
| `startDate` / `targetDate` (Date) | shows how a non-string scalar threads through the same stack |
| `tagIds[]` (string array) | shows array shape end-to-end |

**Read these files in full** before writing any code:

Backend:
- `backend/plugins/frontline_api/src/modules/ticket/db/definitions/ticket.ts` — Mongoose schema (search for `priority:` at line 29)
- `backend/plugins/frontline_api/src/modules/ticket/@types/ticket.ts` — `ITicket` interface
- `backend/plugins/frontline_api/src/modules/ticket/graphql/schemas/ticket.ts` — full GraphQL surface: `type Ticket`, `createTicketParams`, `updateTicketParams`
- `backend/plugins/frontline_api/src/modules/ticket/db/models/Ticket.ts` — `createTicket` and `updateTicket` (the writes that accept the new field)

Frontend:
- `frontend/plugins/frontline_ui/src/modules/ticket/graphql/mutations/createTicket.ts` — create ticket mutation
- `frontend/plugins/frontline_ui/src/modules/ticket/graphql/mutations/updateTicket.ts` — update ticket mutation
- `frontend/plugins/frontline_ui/src/modules/ticket/types/index.ts` — the TS types frontline ticket uses

## Phase 4 — PLAN

Atomic commits, ordered (rename `<field>` to your wish's field name):

1. **add `<field>` to Mongoose ticket schema** — files: `backend/plugins/frontline_api/src/modules/ticket/db/definitions/ticket.ts`
2. **add `<field>` to `ITicket` TS interface** — files: `backend/plugins/frontline_api/src/modules/ticket/@types/ticket.ts`
3. **add `<field>` to GraphQL `type Ticket` and mutation params** — files: `backend/plugins/frontline_api/src/modules/ticket/graphql/schemas/ticket.ts`
4. **expose `<field>` in the UI mutation variables** — files: `frontend/plugins/frontline_ui/src/modules/ticket/graphql/mutations/{createTicket,updateTicket}.ts`, `frontend/plugins/frontline_ui/src/modules/ticket/types/index.ts`
5. **playwright spec asserts field is present + persists** — files: `.agents/plugins/frontline/tests/ticket.spec.ts`

Each commit ≤ ~50 LOC. After commits 1–3 the backend compiles standalone; after commit 4 the UI compiles standalone.

## Phase 5 — IMPLEMENT (step-by-step)

1. **Mongoose schema (`ticket.ts`)** — copy the `priority` line (line 29) and adapt. Pick `String`, `Number`, `Boolean`, `Date`, `[String]`, or `Schema.Types.Mixed`.
2. **`@types/ticket.ts`** — add the field to `interface ITicket`.
3. **`schemas/ticket.ts`** — add the field inside `type Ticket`, `createTicketParams`, and `updateTicketParams`.
4. **`createTicket.ts`/`updateTicket.ts`** — add to mutation query and variables.
5. After each commit, run `.agents/evals/run.sh frontline`.

## Phase 6 — VERIFY

Add to `.agents/plugins/frontline/tests/ticket.spec.ts`:
- a test that opens the "Add ticket" sheet and asserts the new field is visible.
- run: `cd .agents && pnpm test plugins/frontline/tests/ticket.spec.ts`
