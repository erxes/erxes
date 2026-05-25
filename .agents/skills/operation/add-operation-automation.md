# add operation automation

> **When to use:** the wish adds a new automation **trigger** (an operation event other workflows can react to) or a new automation **action** (a step a workflow can execute on operation data).

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Currently, operation features don't register custom automation triggers directly. Look at how sales implements `create` action triggers.

**Read these files in full** before writing any code:

- `backend/plugins/operation_api/src/main.ts` — top-level aggregate.
- Refer to `sales` or `frontline` plugin automations if you need to build custom workers.

## Phase 4 — PLAN

1. **register trigger/action in main.ts** — files: `backend/plugins/operation_api/src/main.ts`
2. **add trigger/action worker** — if custom workers are needed.
3. Run verification check.

## Phase 5 — IMPLEMENT (step-by-step)

1. **`main.ts`** — register automations.
2. Run `.agents/evals/run.sh operation`.
