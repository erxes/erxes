# add frontline automation

> **When to use:** the wish adds a new automation **trigger** (a frontline event other workflows can react to) or a new automation **action** (a step a workflow can execute on frontline data) — e.g., "trigger when a Ticket hits Won stage," "action: append a checklist when a Ticket moves stage."

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Frontline already registers two triggers and two actions. Mirror the one whose shape matches the wish:

| Sister | What kind | Where |
|---|---|---|
| `frontline:ticket` (default trigger) | event-on-create | `meta/automations/constants.ts` line 4–10 |
| `frontline:ticket` with `relationType: 'probability'` | custom event with extra check | constants line 11–20 + `trigger/checkStageProbalityTrigger.ts` |
| `create` on `frontline:ticket` | action that creates a frontline entity | constants line 23–33 + `action/createAction.ts` |
| `create` on `frontline:checklist` | action variant | constants line 34–42 + `action/createChecklist.ts` |

**Read these files in full** before writing any code:

- `backend/plugins/frontline_api/src/meta/automations.ts` — top-level aggregate (`constants`, `receiveActions`, `checkCustomTrigger`, `setProperties`, `replacePlaceHolders`). Producer-handler pattern via `createCoreModuleProducerHandler`.
- `backend/plugins/frontline_api/src/modules/frontline/meta/automations/constants.ts` — both `triggers[]` and `actions[]`, plus the `isCustom`, `isTargetSource`, `targetSourceType` flags
- `backend/plugins/frontline_api/src/modules/frontline/meta/automations/automationHandlers.ts` — how `checkCustomTrigger` and `receiveActions` dispatch by `collectionType`/`relationType`
- For a custom trigger: `backend/plugins/frontline_api/src/modules/frontline/meta/automations/trigger/checkStageProbalityTrigger.ts` — the full "trigger predicate" pattern
- For an action: `backend/plugins/frontline_api/src/modules/frontline/meta/automations/action/createAction.ts` and `createChecklist.ts` — the receive-actions side
- `backend/plugins/frontline_api/src/modules/frontline/meta/automations/action/getRelatedValue.ts` and `getItems.ts` — placeholder resolution + related-item fetch

UI side (only if the trigger/action needs custom configuration in the automation builder):
- `frontend/plugins/frontline_ui/src/widgets/automations/components/AutomationRemoteEntry.tsx` — federation entry for frontline-side automation widgets
- `frontend/plugins/frontline_ui/src/widgets/automations/modules/frontline/components/FrontlineRemoteEntry.tsx`

## Phase 4 — PLAN

For a new trigger:

1. **register trigger in `constants.ts`** — files: `backend/plugins/frontline_api/src/modules/frontline/meta/automations/constants.ts`
2. **(custom trigger only) add predicate** — files: `backend/plugins/frontline_api/src/modules/frontline/meta/automations/trigger/<your>Trigger.ts`
3. **wire predicate into `automationHandlers.checkCustomTrigger`** — files: `automationHandlers.ts`
4. **(if it needs custom UI config) extend the automations widget remote** — files: `frontend/plugins/frontline_ui/src/widgets/automations/modules/frontline/...`
5. **playwright/automation eval** — files: `.agents/plugins/frontline/tests/tickets.spec.ts` (assert the trigger label appears in the automation picker, if reachable from the UI)

For a new action:

1. **register action in `constants.ts`**
2. **add handler file** — `backend/plugins/frontline_api/src/modules/frontline/meta/automations/action/<your>Action.ts`
3. **wire into `automationHandlers.receiveActions`** — by `collectionType` (and `method` if needed)
4. **(if it needs custom UI config) extend the automations widget remote**
5. **playwright spec exercises the action's user-visible effect**

## Phase 5 — IMPLEMENT (step-by-step)

1. **`constants.ts`** — append your entry to `triggers[]` or `actions[]`. Fields:
   - Triggers: `moduleName: 'frontline'`, `collectionName: 'ticket' | 'checklist'`, `relationType` (only for custom), `icon`, `label`, `description`, `isCustom: true` for predicate-driven triggers.
   - Actions: `moduleName`, `collectionName`, `method: 'create' | ...`, `isTargetSource`, `targetSourceType: 'frontline:frontline.ticket'`, `allowTargetFromActions`, `isAvailable`.
2. **Custom trigger predicate** — copy `checkStageProbalityTrigger.ts`. The function signature is `{ models, target: ITicket, config }`. Return `boolean` or `Promise<boolean>`. Use `models.<X>` (subdomain-scoped) — never global model imports.
3. **Action handler** — copy `createAction.ts` or `createChecklist.ts`. Signature is `(models, execution, action)` for checklist-style or `({ models, subdomain, action, execution, collectionType })` for the unified action. Reuse `replacePlaceHolders` + `getRelatedValue` for any `{{ ticket.name }}`-style template tokens — do **not** roll a custom resolver.
4. **`automationHandlers.ts`** — extend the dispatch. `checkCustomTrigger` keys off `collectionType` + `relationType`; `receiveActions` keys off `collectionType` + (optionally) `method`. Mirror the existing `if (collectionType === 'ticket' && relationType === 'probability')` shape.
5. Run `.agents/evals/run.sh frontline --backend-only`. Exit 0.
6. If custom UI is needed, extend the automation widget federation entry. Most triggers/actions need none.
7. Run `.agents/evals/run.sh frontline`. Exit 0.

## Phase 6 — VERIFY

Add to `.agents/plugins/frontline/tests/tickets.spec.ts` (or a new `automations.spec.ts` if the suite is missing):

- a test that the new trigger/action label appears wherever the automation picker lists frontline options (host-side, but reachable from the frontline UI)
- a behavioral test: with seeded data, fire the trigger condition (or run the action) and assert the side effect — a created ticket, a created checklist item, etc.

Run: `cd .agents && pnpm test plugins/frontline/tests/tickets.spec.ts`

If automations aren't reachable from the frontline UI under test (they often live in the core automations builder), use `test.skip` with a documented reason rather than faking the assertion.

## Pitfalls (specific to this skill)

- A new trigger with `isCustom: true` **requires** a `checkCustomTrigger` predicate. Skipping it makes the trigger fire on every ticket change — silently DOS'es subscribers.
- `replacePlaceHolders` already knows how to resolve `customers.email`, `createdBy.fullName`, `productsData`. Look at `automationHandlers.replacePlaceHolders` line 60–82 before adding a new resolver — most fields work out of the box.
- The action handler runs **asynchronously** inside the automations service. Subdomain comes from the producer context — pass it through, do not reconstruct it. See [`../../rules/30-multi-tenancy.md`](../../rules/30-multi-tenancy.md) "BullMQ jobs".
- Activity log is **not** auto-generated for automation-triggered mutations unless the underlying model method (`models.Tickets.createTicket`, etc.) generates one. Audit by following the call into the model.
- `targetSourceType` strings are sniffed at runtime — typos silently disable the action. Format is exactly `frontline:<moduleName>.<collectionName>` — see `constants.ts` line 31.

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No `try/catch` around the predicate just to swallow errors — let it throw or return `false` explicitly
- [ ] No new placeholder resolver if `replacePlaceHolders` already covers the case
- [ ] No copy-paste of `createAction.ts` if the existing `actionCreate` already handles the new `collectionType` — extend the dispatcher instead
- [ ] No hard-coded test subdomain in the predicate
