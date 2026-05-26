# add insurance automation

> **When to use:** the wish adds a new automation **trigger** (a insurance event other workflows can react to) or a new automation **action** (a step a workflow can execute on insurance data) — e.g., "trigger when a Contract hits Won stage," "action: append a checklist when a Contract moves stage."

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Contracts already registers two triggers and two actions. Mirror the one whose shape matches the wish:

| Sister | What kind | Where |
|---|---|---|
| `insurance:contract` (default trigger) | event-on-create | `meta/automations/constants.ts` line 4–10 |
| `insurance:contract` with `relationType: 'probability'` | custom event with extra check | constants line 11–20 + `trigger/checkStageProbalityTrigger.ts` |
| `create` on `insurance:contract` | action that creates a insurance entity | constants line 23–33 + `action/createAction.ts` |
| `create` on `insurance:checklist` | action variant | constants line 34–42 + `action/createChecklist.ts` |

**Read these files in full** before writing any code:

- `backend/plugins/insurance_api/src/meta/automations.ts` — top-level aggregate (`constants`, `receiveActions`, `checkCustomTrigger`, `setProperties`, `replacePlaceHolders`). Producer-handler pattern via `createCoreModuleProducerHandler`.
- `backend/plugins/insurance_api/src/modules/insurance/meta/automations/constants.ts` — both `triggers[]` and `actions[]`, plus the `isCustom`, `isTargetSource`, `targetSourceType` flags
- `backend/plugins/insurance_api/src/modules/insurance/meta/automations/automationHandlers.ts` — how `checkCustomTrigger` and `receiveActions` dispatch by `collectionType`/`relationType`
- For a custom trigger: `backend/plugins/insurance_api/src/modules/insurance/meta/automations/trigger/checkStageProbalityTrigger.ts` — the full "trigger predicate" pattern
- For an action: `backend/plugins/insurance_api/src/modules/insurance/meta/automations/action/createAction.ts` and `createChecklist.ts` — the receive-actions side
- `backend/plugins/insurance_api/src/modules/insurance/meta/automations/action/getRelatedValue.ts` and `getItems.ts` — placeholder resolution + related-item fetch

UI side (only if the trigger/action needs custom configuration in the automation builder):
- `frontend/plugins/insurance_ui/src/widgets/automations/components/AutomationRemoteEntry.tsx` — federation entry for insurance-side automation widgets
- `frontend/plugins/insurance_ui/src/widgets/automations/modules/insurance/components/ContractsRemoteEntry.tsx`

## Phase 4 — PLAN

For a new trigger:

1. **register trigger in `constants.ts`** — files: `backend/plugins/insurance_api/src/modules/insurance/meta/automations/constants.ts`
2. **(custom trigger only) add predicate** — files: `backend/plugins/insurance_api/src/modules/insurance/meta/automations/trigger/<your>Trigger.ts`
3. **wire predicate into `automationHandlers.checkCustomTrigger`** — files: `automationHandlers.ts`
4. **(if it needs custom UI config) extend the automations widget remote** — files: `frontend/plugins/insurance_ui/src/widgets/automations/modules/insurance/...`
5. **playwright/automation eval** — files: `.agents/plugins/insurance/tests/contracts.spec.ts` (assert the trigger label appears in the automation picker, if reachable from the UI)

For a new action:

1. **register action in `constants.ts`**
2. **add handler file** — `backend/plugins/insurance_api/src/modules/insurance/meta/automations/action/<your>Action.ts`
3. **wire into `automationHandlers.receiveActions`** — by `collectionType` (and `method` if needed)
4. **(if it needs custom UI config) extend the automations widget remote**
5. **playwright spec exercises the action's user-visible effect**

## Phase 5 — IMPLEMENT (step-by-step)

1. **`constants.ts`** — append your entry to `triggers[]` or `actions[]`. Fields:
   - Triggers: `moduleName: 'insurance'`, `collectionName: 'contract' | 'checklist'`, `relationType` (only for custom), `icon`, `label`, `description`, `isCustom: true` for predicate-driven triggers.
   - Actions: `moduleName`, `collectionName`, `method: 'create' | ...`, `isTargetSource`, `targetSourceType: 'insurance:insurance.contract'`, `allowTargetFromActions`, `isAvailable`.
2. **Custom trigger predicate** — copy `checkStageProbalityTrigger.ts`. The function signature is `{ models, target: IContract, config }`. Return `boolean` or `Promise<boolean>`. Use `models.<X>` (subdomain-scoped) — never global model imports.
3. **Action handler** — copy `createAction.ts` or `createChecklist.ts`. Signature is `(models, execution, action)` for checklist-style or `({ models, subdomain, action, execution, collectionType })` for the unified action. Reuse `replacePlaceHolders` + `getRelatedValue` for any `{{ contract.name }}`-style template tokens — do **not** roll a custom resolver.
4. **`automationHandlers.ts`** — extend the dispatch. `checkCustomTrigger` keys off `collectionType` + `relationType`; `receiveActions` keys off `collectionType` + (optionally) `method`. Mirror the existing `if (collectionType === 'contract' && relationType === 'probability')` shape.
5. Run `.agents/evals/run.sh insurance --backend-only`. Exit 0.
6. If custom UI is needed, extend the automation widget federation entry. Most triggers/actions need none.
7. Run `.agents/evals/run.sh insurance`. Exit 0.

## Phase 6 — VERIFY

Add to `.agents/plugins/insurance/tests/contracts.spec.ts` (or a new `automations.spec.ts` if the suite is missing):

- a test that the new trigger/action label appears wherever the automation picker lists insurance options (host-side, but reachable from the insurance UI)
- a behavioral test: with seeded data, fire the trigger condition (or run the action) and assert the side effect — a created contract, a created checklist item, etc.

Run: `cd .agents && pnpm test plugins/insurance/tests/contracts.spec.ts`

If automations aren't reachable from the insurance UI under test (they often live in the core automations builder), use `test.skip` with a documented reason rather than faking the assertion.

## Pitfalls (specific to this skill)

- A new trigger with `isCustom: true` **requires** a `checkCustomTrigger` predicate. Skipping it makes the trigger fire on every contract change — silently DOS'es subscribers.
- `replacePlaceHolders` already knows how to resolve `customers.email`, `createdBy.fullName`, `productsData`. Look at `automationHandlers.replacePlaceHolders` line 60–82 before adding a new resolver — most fields work out of the box.
- The action handler runs **asynchronously** inside the automations service. Subdomain comes from the producer context — pass it through, do not reconstruct it. See [`../../rules/30-multi-tenancy.md`](../../rules/30-multi-tenancy.md) "BullMQ jobs".
- Activity log is **not** auto-generated for automation-triggered mutations unless the underlying model method (`models.Contracts.createContract`, etc.) generates one. Audit by following the call into the model.
- `targetSourceType` strings are sniffed at runtime — typos silently disable the action. Format is exactly `insurance:<moduleName>.<collectionName>` — see `constants.ts` line 31.

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No `try/catch` around the predicate just to swallow errors — let it throw or return `false` explicitly
- [ ] No new placeholder resolver if `replacePlaceHolders` already covers the case
- [ ] No copy-paste of `createAction.ts` if the existing `actionCreate` already handles the new `collectionType` — extend the dispatcher instead
- [ ] No hard-coded test subdomain in the predicate
