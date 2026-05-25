# add frontline automation

> **When to use:** the wish adds a new automation **trigger** (a frontline event other workflows can react to) or a new automation **action** (a step a workflow can execute on frontline data).

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Frontline registers facebook/instagram triggers and actions:

| Sister | What kind | Where |
|---|---|---|
| Facebook triggers/actions | Facebook automation | `backend/plugins/frontline_api/src/modules/integrations/facebook/meta/automation/` |
| Instagram triggers/actions | Instagram automation | `backend/plugins/frontline_api/src/modules/integrations/instagram/meta/automation/` |

**Read these files in full** before writing any code:

- `backend/plugins/frontline_api/src/meta/automations.ts` — top-level aggregate (`constants`, `receiveActions`, `checkCustomTrigger`). Producer-handler pattern via `createCoreModuleProducerHandler`.
- `backend/plugins/frontline_api/src/modules/integrations/facebook/meta/automation/constants.ts` — actions/triggers definitions.

## Phase 4 — PLAN

1. **register trigger/action in constants** — files: `backend/plugins/frontline_api/src/modules/integrations/<provider>/meta/automation/constants.ts`
2. **add trigger/action worker** — files: `backend/plugins/frontline_api/src/modules/integrations/<provider>/meta/automation/workers.ts`
3. Run verification check.

## Phase 5 — IMPLEMENT (step-by-step)

1. **`constants.ts`** — append your entry to triggers/actions.
2. **`workers.ts`** — implement trigger checker or action runner.
3. Run `.agents/evals/run.sh frontline`.
