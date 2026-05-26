# add insurance mutation

> **When to use:** the wish needs a new GraphQL **write** on a insurance entity that the existing `contractsAdd` / `contractsEdit` / `contractsChange` / `contractsArchive` / `contractsRemove` set doesn't cover — e.g., `contractsBulkArchive(_ids)`, `contractsAssignBatch(_ids, userId)`, `contractsConvertToTemplate(_id)`.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters:

| Sister | Shape | Why |
|---|---|---|
| `contractsArchive(stageId, processId)` | bulk write returning a JSON/string acknowledgement | best mirror for any "operate on many" mutation |
| `contractsAdd(...)` | create single, return `Contract` | mirror for any "create" |
| `contractsWatch(_id, isAdd)` | mutate a single contract field, return `Contract` | mirror for a targeted toggle/update |

**Read these files in full** before writing any code:

- `backend/plugins/insurance_api/src/modules/insurance/graphql/schemas/contract.ts` — `mutationParams` and `mutations` (lines 201–240). See exactly how each mutation declares its variables.
- `backend/plugins/insurance_api/src/modules/insurance/graphql/resolvers/mutations/contracts.ts` — the `contractMutations` object. Note the `checkPermission` call at the top of every method (e.g., line 30 `await checkPermission('contractsAdd')`).
- `backend/plugins/insurance_api/src/modules/insurance/graphql/resolvers/mutations/utils.ts` — `addContract`, `editContract`, `processStageChangeScoreCampaigns` — shared business logic the resolvers delegate to.
- `backend/plugins/insurance_api/src/modules/insurance/db/models/Contracts.ts` — static methods (`createContract` at line 41, `updateContract` at line 70, `removeContracts` at line 116). Mutations should delegate writes here.
- `backend/plugins/insurance_api/src/apollo/resolvers/mutations.ts` — how `contractMutations` is merged
- `backend/plugins/insurance_api/src/modules/insurance/meta/activity-log/` — every CRUD generates an entry. New mutation = new activity-log builder (see [`../../docs/insurance/data-model.md`](../../docs/insurance/data-model.md) "Activity log").
- `backend/plugins/insurance_api/src/meta/permissions.ts` — RBAC declaration
- `frontend/plugins/insurance_ui/src/graphql/mutations.ts` — UI mutation document. Reuse `commonFields` + `commonMutationParams` for shape.

## Phase 4 — PLAN

Default plan (rename to your wish):

1. **declare mutation in GraphQL schema** — files: `backend/plugins/insurance_api/src/modules/insurance/graphql/schemas/contract.ts`
2. **add resolver to `contractMutations`** — files: `backend/plugins/insurance_api/src/modules/insurance/graphql/resolvers/mutations/contracts.ts`
3. **(if shared logic) extract to `mutations/utils.ts`** — only if a second caller exists ([`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md))
4. **add permission entry** — files: `backend/plugins/insurance_api/src/meta/permissions.ts`
5. **add activity-log builder** — files: `backend/plugins/insurance_api/src/modules/insurance/meta/activity-log/<entity>.ts`
6. **add UI mutation document + hook** — files: `frontend/plugins/insurance_ui/src/graphql/mutations.ts`, `frontend/plugins/insurance_ui/src/modules/contracts/cards/hooks/useContracts.tsx`
7. **playwright spec exercises the new write end-to-end** — files: `.agents/plugins/insurance/tests/contracts.spec.ts`

## Phase 5 — IMPLEMENT (step-by-step)

1. **`schemas/contract.ts`** — extend `export const mutations`. Pick a return type that matches the shape: `Contract` for single-entity, `String`/`JSON` for bulk acks (like `contractsArchive`), or a new typed payload if the wish demands it (declare under `types`).
2. **`resolvers/mutations/contracts.ts`** — add a new property to `contractMutations: Record<string, Resolver>`. **First line of body:** `await checkPermission('<yourMutationName>')`. Destructure `{ user, models, subdomain, checkPermission }: IContext`.
3. Push the write into `models.Contracts.*` static methods — they handle change-stream publishing, activity log, and indexed updates. Do not call `await models.Contracts.collection.updateMany(...)` from the resolver.
4. **`meta/permissions.ts`** — append the new permission name to the matrix.
5. **`meta/activity-log/<entity>.ts`** — add a builder that takes the changed doc + actor and emits an activity-log entry. Mirror the existing `generateContract*ActivityLog`.
6. Run `.agents/evals/run.sh insurance --backend-only`. Exit 0.
7. **UI mutation + hook** — add `gql` mutation to `ContractsMutations.ts`. In `cards/hooks/useContracts.tsx`, wire a `useMutation(...)` hook with `refetchQueries` or `update` for cache consistency.
8. Hook the action into the UI surface (an action-bar button, a context menu, a confirmation dialog). Don't add a button that does nothing.
9. Run `.agents/evals/run.sh insurance`. Exit 0.

## Phase 6 — VERIFY

Add to `.agents/plugins/insurance/tests/contracts.spec.ts`:

- a test that locates the new control (button / menu item) and asserts it's present
- a test that triggers it (with seeded data) and asserts the user-visible side effect (toast, list refresh, deleted row, status change)

Run: `cd .agents && pnpm test plugins/insurance/tests/contracts.spec.ts`

## Pitfalls (specific to this skill)

- Forgetting the activity-log builder means the audit trail silently misses your mutation — caught by no automated test, hated by the customer the moment they need to reconstruct what happened. See [`../../docs/insurance/data-model.md`](../../docs/insurance/data-model.md) "Activity log".
- Bulk mutations that loop over IDs and call `models.Contracts.removeContracts([id])` per iteration cause N writes + N pubsub publishes. Pass arrays into the static method and let it batch.
- Forgetting `checkPermission` is a security hole. Use [`../../rules/40-safety.md`](../../rules/40-safety.md) and the sister `contractsAdd` line 30 as the canonical example.
- If the mutation moves a contract between stages, `stageChangedDate` and the order-rebalance logic in `contractsChange` matters — read that mutation in full before writing a substitute.
- Do not forget the **subscription publish** if you're mutating something the kanban watches. The sister mutations call `subscriptionWrapper` in `resolvers/utils.ts` (or it's done inside `models.Contracts.*`).

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No `try/catch` swallowing `checkPermission`
- [ ] No business logic in the resolver — it belongs in `models.Contracts.*` or `mutations/utils.ts` (only if a second caller exists)
- [ ] No new activity-log shape that doesn't match `meta/activity-log/`
- [ ] No UI "loading…" button with no actual mutation wired
- [ ] No `// TODO: emit pubsub later` — emit it now or don't merge
