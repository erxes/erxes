# add frontline trpc procedure

> **When to use:** the wish adds a new backend procedure exposed via tRPC for fast cross-plugin communication or frontend queries (e.g. `inbox.getConversations`, `inbox.changeStatus`).

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters:

| Sister | Router | Where |
|---|---|---|
| `changeStatus` | `conversationsRouter` | `backend/plugins/frontline_api/src/modules/inbox/trpc/inbox.ts` |
| `getConversations` | `inboxTrpcRouter` | `backend/plugins/frontline_api/src/modules/inbox/trpc/inbox.ts` |

**Read these files in full** before writing any code:

- `backend/plugins/frontline_api/src/init-trpc.ts` — appRouter config.
- `backend/plugins/frontline_api/src/modules/inbox/trpc/inbox.ts` — tRPC procedures for inbox.

## Phase 4 — PLAN

1. **define procedure input/output schema** — files: `backend/plugins/frontline_api/src/modules/inbox/trpc/inbox.ts`
2. **add query/mutation handler** — files: `backend/plugins/frontline_api/src/modules/inbox/trpc/inbox.ts`
3. Run verification check.

## Phase 5 — IMPLEMENT (step-by-step)

1. **`inbox.ts`** — add your procedure (e.g. using `t.procedure.input(z.object(...)).query(...)`).
2. Run `.agents/evals/run.sh frontline --backend-only`.
