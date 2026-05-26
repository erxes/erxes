# add mongolian mutation

> **When to use:** the wish needs a new GraphQL **write** on a mongolian entity that the existing `ebarimtsAdd` / `ebarimtsEdit` / `ebarimtsChange` / `ebarimtsArchive` / `ebarimtsRemove` set doesn't cover — e.g., `ebarimtsBulkArchive(_ids)`, `ebarimtsAssignBatch(_ids, userId)`, `ebarimtsConvertToTemplate(_id)`.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters:

| Sister | Shape | Why |
|---|---|---|
| `ebarimtsArchive(stageId, processId)` | bulk write returning a JSON/string acknowledgement | best mirror for any "operate on many" mutation |
| `ebarimtsAdd(...)` | create single, return `Ebarimt` | mirror for any "create" |
| `ebarimtsWatch(_id, isAdd)` | mutate a single ebarimt field, return `Ebarimt` | mirror for a targeted toggle/update |

**Read these files in full** before writing any code:

- `backend/plugins/mongolian_api/src/modules/ebarimt/graphql/schemas/ebarimt.ts` — `mutationParams` and `mutations` (lines 201–240). See exactly how each mutation declares its variables.
- `backend/plugins/mongolian_api/src/modules/mongolian/graphql/resolvers/mutations/ebarimts.ts` — the `ebarimtMutations` object. Note the `checkPermission` call at the top of every method (e.g., line 30 `await checkPermission('ebarimtsAdd')`).
- `backend/plugins/mongolian_api/src/modules/mongolian/graphql/resolvers/mutations/utils.ts` — `addEbarimt`, `editEbarimt`, `processStageChangeScoreCampaigns` — shared business logic the resolvers delegate to.
- `backend/plugins/mongolian_api/src/modules/ebarimt/db/models/Ebarimts.ts` — static methods (`createEbarimt` at line 41, `updateEbarimt` at line 70, `removeEbarimts` at line 116). Mutations should delegate writes here.
- `backend/plugins/mongolian_api/src/apollo/resolvers/mutations.ts` — how `ebarimtMutations` is merged
- `backend/plugins/mongolian_api/src/modules/mongolian/meta/activity-log/` — every CRUD generates an entry. New mutation = new activity-log builder (see [`../../docs/mongolian/data-model.md`](../../docs/mongolian/data-model.md) "Activity log").
- `backend/plugins/mongolian_api/src/meta/permissions.ts` — RBAC declaration
- `frontend/plugins/mongolian_ui/src/graphql/mutations.ts` — UI mutation document. Reuse `commonFields` + `commonMutationParams` for shape.

## Phase 4 — PLAN

Default plan (rename to your wish):

1. **declare mutation in GraphQL schema** — files: `backend/plugins/mongolian_api/src/modules/ebarimt/graphql/schemas/ebarimt.ts`
2. **add resolver to `ebarimtMutations`** — files: `backend/plugins/mongolian_api/src/modules/mongolian/graphql/resolvers/mutations/ebarimts.ts`
3. **(if shared logic) extract to `mutations/utils.ts`** — only if a second caller exists ([`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md))
4. **add permission entry** — files: `backend/plugins/mongolian_api/src/meta/permissions.ts`
5. **add activity-log builder** — files: `backend/plugins/mongolian_api/src/modules/mongolian/meta/activity-log/<entity>.ts`
6. **add UI mutation document + hook** — files: `frontend/plugins/mongolian_ui/src/graphql/mutations.ts`, `frontend/plugins/mongolian_ui/src/modules/ebarimts/cards/hooks/useEbarimts.tsx`
7. **playwright spec exercises the new write end-to-end** — files: `.agents/plugins/mongolian/tests/ebarimts.spec.ts`

## Phase 5 — IMPLEMENT (step-by-step)

1. **`schemas/ebarimt.ts`** — extend `export const mutations`. Pick a return type that matches the shape: `Ebarimt` for single-entity, `String`/`JSON` for bulk acks (like `ebarimtsArchive`), or a new typed payload if the wish demands it (declare under `types`).
2. **`resolvers/mutations/ebarimts.ts`** — add a new property to `ebarimtMutations: Record<string, Resolver>`. **First line of body:** `await checkPermission('<yourMutationName>')`. Destructure `{ user, models, subdomain, checkPermission }: IContext`.
3. Push the write into `models.Ebarimts.*` static methods — they handle change-stream publishing, activity log, and indexed updates. Do not call `await models.Ebarimts.collection.updateMany(...)` from the resolver.
4. **`meta/permissions.ts`** — append the new permission name to the matrix.
5. **`meta/activity-log/<entity>.ts`** — add a builder that takes the changed doc + actor and emits an activity-log entry. Mirror the existing `generateEbarimt*ActivityLog`.
6. Run `.agents/evals/run.sh mongolian --backend-only`. Exit 0.
7. **UI mutation + hook** — add `gql` mutation to `EbarimtsMutations.ts`. In `cards/hooks/useEbarimts.tsx`, wire a `useMutation(...)` hook with `refetchQueries` or `update` for cache consistency.
8. Hook the action into the UI surface (an action-bar button, a context menu, a confirmation dialog). Don't add a button that does nothing.
9. Run `.agents/evals/run.sh mongolian`. Exit 0.

## Phase 6 — VERIFY

Add to `.agents/plugins/mongolian/tests/ebarimts.spec.ts`:

- a test that locates the new control (button / menu item) and asserts it's present
- a test that triggers it (with seeded data) and asserts the user-visible side effect (toast, list refresh, deleted row, status change)

Run: `cd .agents && pnpm test plugins/mongolian/tests/ebarimts.spec.ts`

## Pitfalls (specific to this skill)

- Forgetting the activity-log builder means the audit trail silently misses your mutation — caught by no automated test, hated by the customer the moment they need to reconstruct what happened. See [`../../docs/mongolian/data-model.md`](../../docs/mongolian/data-model.md) "Activity log".
- Bulk mutations that loop over IDs and call `models.Ebarimts.removeEbarimts([id])` per iteration cause N writes + N pubsub publishes. Pass arrays into the static method and let it batch.
- Forgetting `checkPermission` is a security hole. Use [`../../rules/40-safety.md`](../../rules/40-safety.md) and the sister `ebarimtsAdd` line 30 as the canonical example.
- If the mutation moves a ebarimt between stages, `stageChangedDate` and the order-rebalance logic in `ebarimtsChange` matters — read that mutation in full before writing a substitute.
- Do not forget the **subscription publish** if you're mutating something the kanban watches. The sister mutations call `subscriptionWrapper` in `resolvers/utils.ts` (or it's done inside `models.Ebarimts.*`).

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No `try/catch` swallowing `checkPermission`
- [ ] No business logic in the resolver — it belongs in `models.Ebarimts.*` or `mutations/utils.ts` (only if a second caller exists)
- [ ] No new activity-log shape that doesn't match `meta/activity-log/`
- [ ] No UI "loading…" button with no actual mutation wired
- [ ] No `// TODO: emit pubsub later` — emit it now or don't merge
