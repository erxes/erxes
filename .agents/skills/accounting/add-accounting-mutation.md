# add accounting mutation

> **When to use:** the wish needs a new GraphQL **write** on a accounting entity that the existing `accountsAdd` / `accountsEdit` / `accountsChange` / `accountsArchive` / `accountsRemove` set doesn't cover — e.g., `accountsBulkArchive(_ids)`, `accountsAssignBatch(_ids, userId)`, `accountsConvertToTemplate(_id)`.

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters:

| Sister | Shape | Why |
|---|---|---|
| `accountsArchive(stageId, processId)` | bulk write returning a JSON/string acknowledgement | best mirror for any "operate on many" mutation |
| `accountsAdd(...)` | create single, return `Account` | mirror for any "create" |
| `accountsWatch(_id, isAdd)` | mutate a single account field, return `Account` | mirror for a targeted toggle/update |

**Read these files in full** before writing any code:

- `backend/plugins/accounting_api/src/modules/accounting/graphql/schemas/account.ts` — `mutationParams` and `mutations` (lines 201–240). See exactly how each mutation declares its variables.
- `backend/plugins/accounting_api/src/modules/accounting/graphql/resolvers/mutations/accounts.ts` — the `accountMutations` object. Note the `checkPermission` call at the top of every method (e.g., line 30 `await checkPermission('accountsAdd')`).
- `backend/plugins/accounting_api/src/modules/accounting/graphql/resolvers/mutations/utils.ts` — `addAccount`, `editAccount`, `processStageChangeScoreCampaigns` — shared business logic the resolvers delegate to.
- `backend/plugins/accounting_api/src/modules/accounting/db/models/Accounts.ts` — static methods (`createAccount` at line 41, `updateAccount` at line 70, `removeAccounts` at line 116). Mutations should delegate writes here.
- `backend/plugins/accounting_api/src/apollo/resolvers/mutations.ts` — how `accountMutations` is merged
- `backend/plugins/accounting_api/src/modules/accounting/meta/activity-log/` — every CRUD generates an entry. New mutation = new activity-log builder (see [`../../docs/accounting/data-model.md`](../../docs/accounting/data-model.md) "Activity log").
- `backend/plugins/accounting_api/src/meta/permissions.ts` — RBAC declaration
- `frontend/plugins/accounting_ui/src/graphql/mutations.ts` — UI mutation document. Reuse `commonFields` + `commonMutationParams` for shape.

## Phase 4 — PLAN

Default plan (rename to your wish):

1. **declare mutation in GraphQL schema** — files: `backend/plugins/accounting_api/src/modules/accounting/graphql/schemas/account.ts`
2. **add resolver to `accountMutations`** — files: `backend/plugins/accounting_api/src/modules/accounting/graphql/resolvers/mutations/accounts.ts`
3. **(if shared logic) extract to `mutations/utils.ts`** — only if a second caller exists ([`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md))
4. **add permission entry** — files: `backend/plugins/accounting_api/src/meta/permissions.ts`
5. **add activity-log builder** — files: `backend/plugins/accounting_api/src/modules/accounting/meta/activity-log/<entity>.ts`
6. **add UI mutation document + hook** — files: `frontend/plugins/accounting_ui/src/graphql/mutations.ts`, `frontend/plugins/accounting_ui/src/modules/accounts/cards/hooks/useAccounts.tsx`
7. **playwright spec exercises the new write end-to-end** — files: `.agents/plugins/accounting/tests/accounts.spec.ts`

## Phase 5 — IMPLEMENT (step-by-step)

1. **`schemas/account.ts`** — extend `export const mutations`. Pick a return type that matches the shape: `Account` for single-entity, `String`/`JSON` for bulk acks (like `accountsArchive`), or a new typed payload if the wish demands it (declare under `types`).
2. **`resolvers/mutations/accounts.ts`** — add a new property to `accountMutations: Record<string, Resolver>`. **First line of body:** `await checkPermission('<yourMutationName>')`. Destructure `{ user, models, subdomain, checkPermission }: IContext`.
3. Push the write into `models.Accounts.*` static methods — they handle change-stream publishing, activity log, and indexed updates. Do not call `await models.Accounts.collection.updateMany(...)` from the resolver.
4. **`meta/permissions.ts`** — append the new permission name to the matrix.
5. **`meta/activity-log/<entity>.ts`** — add a builder that takes the changed doc + actor and emits an activity-log entry. Mirror the existing `generateAccount*ActivityLog`.
6. Run `.agents/evals/run.sh accounting --backend-only`. Exit 0.
7. **UI mutation + hook** — add `gql` mutation to `AccountsMutations.ts`. In `cards/hooks/useAccounts.tsx`, wire a `useMutation(...)` hook with `refetchQueries` or `update` for cache consistency.
8. Hook the action into the UI surface (an action-bar button, a context menu, a confirmation dialog). Don't add a button that does nothing.
9. Run `.agents/evals/run.sh accounting`. Exit 0.

## Phase 6 — VERIFY

Add to `.agents/plugins/accounting/tests/accounts.spec.ts`:

- a test that locates the new control (button / menu item) and asserts it's present
- a test that triggers it (with seeded data) and asserts the user-visible side effect (toast, list refresh, deleted row, status change)

Run: `cd .agents && pnpm test plugins/accounting/tests/accounts.spec.ts`

## Pitfalls (specific to this skill)

- Forgetting the activity-log builder means the audit trail silently misses your mutation — caught by no automated test, hated by the customer the moment they need to reconstruct what happened. See [`../../docs/accounting/data-model.md`](../../docs/accounting/data-model.md) "Activity log".
- Bulk mutations that loop over IDs and call `models.Accounts.removeAccounts([id])` per iteration cause N writes + N pubsub publishes. Pass arrays into the static method and let it batch.
- Forgetting `checkPermission` is a security hole. Use [`../../rules/40-safety.md`](../../rules/40-safety.md) and the sister `accountsAdd` line 30 as the canonical example.
- If the mutation moves a account between stages, `stageChangedDate` and the order-rebalance logic in `accountsChange` matters — read that mutation in full before writing a substitute.
- Do not forget the **subscription publish** if you're mutating something the kanban watches. The sister mutations call `subscriptionWrapper` in `resolvers/utils.ts` (or it's done inside `models.Accounts.*`).

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No `try/catch` swallowing `checkPermission`
- [ ] No business logic in the resolver — it belongs in `models.Accounts.*` or `mutations/utils.ts` (only if a second caller exists)
- [ ] No new activity-log shape that doesn't match `meta/activity-log/`
- [ ] No UI "loading…" button with no actual mutation wired
- [ ] No `// TODO: emit pubsub later` — emit it now or don't merge
