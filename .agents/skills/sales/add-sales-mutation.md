# add sales mutation

> **When to use:** the wish needs a new GraphQL **write** on a sales entity that the existing `dealsAdd` / `dealsEdit` / `dealsChange` / `dealsArchive` / `dealsRemove` set doesn't cover — e.g., `dealsBulkArchive(_ids)`, `dealsAssignBatch(_ids, userId)`, `dealsConvertToTemplate(_id)`.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters:

| Sister | Shape | Why |
|---|---|---|
| `dealsArchive(stageId, processId)` | bulk write returning a JSON/string acknowledgement | best mirror for any "operate on many" mutation |
| `dealsAdd(...)` | create single, return `Deal` | mirror for any "create" |
| `dealsWatch(_id, isAdd)` | mutate a single deal field, return `Deal` | mirror for a targeted toggle/update |

**Read these files in full** before writing any code:

- `backend/plugins/sales_api/src/modules/sales/graphql/schemas/deal.ts` — `mutationParams` and `mutations` (lines 201–240). See exactly how each mutation declares its variables.
- `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/mutations/deals.ts` — the `dealMutations` object. Note the `checkPermission` call at the top of every method (e.g., line 30 `await checkPermission('dealsAdd')`).
- `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/mutations/utils.ts` — `addDeal`, `editDeal`, `processStageChangeScoreCampaigns` — shared business logic the resolvers delegate to.
- `backend/plugins/sales_api/src/modules/sales/db/models/Deals.ts` — static methods (`createDeal` at line 41, `updateDeal` at line 70, `removeDeals` at line 116). Mutations should delegate writes here.
- `backend/plugins/sales_api/src/apollo/resolvers/mutations.ts` — how `dealMutations` is merged
- `backend/plugins/sales_api/src/modules/sales/meta/activity-log/` — every CRUD generates an entry. New mutation = new activity-log builder (see [`../../docs/sales/data-model.md`](../../docs/sales/data-model.md) "Activity log").
- `backend/plugins/sales_api/src/meta/permissions.ts` — RBAC declaration
- `frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/DealsMutations.ts` — UI mutation document. Reuse `commonFields` + `commonMutationParams` for shape.

## Phase 4 — PLAN

Default plan (rename to your wish):

1. **declare mutation in GraphQL schema** — files: `backend/plugins/sales_api/src/modules/sales/graphql/schemas/deal.ts`
2. **add resolver to `dealMutations`** — files: `backend/plugins/sales_api/src/modules/sales/graphql/resolvers/mutations/deals.ts`
3. **(if shared logic) extract to `mutations/utils.ts`** — only if a second caller exists ([`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md))
4. **add permission entry** — files: `backend/plugins/sales_api/src/meta/permissions.ts`
5. **add activity-log builder** — files: `backend/plugins/sales_api/src/modules/sales/meta/activity-log/<entity>.ts`
6. **add UI mutation document + hook** — files: `frontend/plugins/sales_ui/src/modules/deals/graphql/mutations/DealsMutations.ts`, `frontend/plugins/sales_ui/src/modules/deals/cards/hooks/useDeals.tsx`
7. **playwright spec exercises the new write end-to-end** — files: `.agents/plugins/sales/tests/deals.spec.ts`

## Phase 5 — IMPLEMENT (step-by-step)

1. **`schemas/deal.ts`** — extend `export const mutations`. Pick a return type that matches the shape: `Deal` for single-entity, `String`/`JSON` for bulk acks (like `dealsArchive`), or a new typed payload if the wish demands it (declare under `types`).
2. **`resolvers/mutations/deals.ts`** — add a new property to `dealMutations: Record<string, Resolver>`. **First line of body:** `await checkPermission('<yourMutationName>')`. Destructure `{ user, models, subdomain, checkPermission }: IContext`.
3. Push the write into `models.Deals.*` static methods — they handle change-stream publishing, activity log, and indexed updates. Do not call `await models.Deals.collection.updateMany(...)` from the resolver.
4. **`meta/permissions.ts`** — append the new permission name to the matrix.
5. **`meta/activity-log/<entity>.ts`** — add a builder that takes the changed doc + actor and emits an activity-log entry. Mirror the existing `generateDeal*ActivityLog`.
6. Run `.agents/evals/run.sh sales --backend-only`. Exit 0.
7. **UI mutation + hook** — add `gql` mutation to `DealsMutations.ts`. In `cards/hooks/useDeals.tsx`, wire a `useMutation(...)` hook with `refetchQueries` or `update` for cache consistency.
8. Hook the action into the UI surface (an action-bar button, a context menu, a confirmation dialog). Don't add a button that does nothing.
9. Run `.agents/evals/run.sh sales`. Exit 0.

## Phase 6 — VERIFY

Add to `.agents/plugins/sales/tests/deals.spec.ts`:

- a test that locates the new control (button / menu item) and asserts it's present
- a test that triggers it (with seeded data) and asserts the user-visible side effect (toast, list refresh, deleted row, status change)

Run: `cd .agents && pnpm test plugins/sales/tests/deals.spec.ts`

## Pitfalls (specific to this skill)

- Forgetting the activity-log builder means the audit trail silently misses your mutation — caught by no automated test, hated by the customer the moment they need to reconstruct what happened. See [`../../docs/sales/data-model.md`](../../docs/sales/data-model.md) "Activity log".
- Bulk mutations that loop over IDs and call `models.Deals.removeDeals([id])` per iteration cause N writes + N pubsub publishes. Pass arrays into the static method and let it batch.
- Forgetting `checkPermission` is a security hole. Use [`../../rules/40-safety.md`](../../rules/40-safety.md) and the sister `dealsAdd` line 30 as the canonical example.
- If the mutation moves a deal between stages, `stageChangedDate` and the order-rebalance logic in `dealsChange` matters — read that mutation in full before writing a substitute.
- Do not forget the **subscription publish** if you're mutating something the kanban watches. The sister mutations call `subscriptionWrapper` in `resolvers/utils.ts` (or it's done inside `models.Deals.*`).

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No `try/catch` swallowing `checkPermission`
- [ ] No business logic in the resolver — it belongs in `models.Deals.*` or `mutations/utils.ts` (only if a second caller exists)
- [ ] No new activity-log shape that doesn't match `meta/activity-log/`
- [ ] No UI "loading…" button with no actual mutation wired
- [ ] No `// TODO: emit pubsub later` — emit it now or don't merge
