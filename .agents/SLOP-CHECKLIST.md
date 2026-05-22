# SLOP-CHECKLIST

> AI: read this before claiming a phase is done. Re-read before opening a PR.

Slop is code that *looks* like it works but adds maintenance debt, hides bugs, or wastes a human reviewer's time. The patterns below are the most common slop tells. **None of them are allowed.**

## Forbidden patterns

### Comments that restate the code
```ts
// ❌ slop
// Increment the counter
counter++;

// ❌ slop
function getUserById(id: string) {
  // Get user by id
  return models.Users.findOne({ _id: id });
}
```
If removing the comment doesn't confuse a future reader, **delete it**. Only write a comment for non-obvious *why*: a hidden constraint, a subtle invariant, a workaround for a specific bug.

### `try/catch` around code that cannot fail
```ts
// ❌ slop
try {
  const id = generateId();
} catch (e) {
  console.error(e);
}
```
If the function can't throw, don't wrap it. If it can throw, handle the specific failure mode meaningfully — don't catch-and-log.

### Helpers extracted for a single caller
```ts
// ❌ slop
function formatDealName(deal: Deal) {
  return `${deal.name}`;
}
// ...used once
```
Three similar lines is better than a premature abstraction. Only extract a helper when there are real, independent callers.

### Backwards-compatibility shims for code that doesn't exist yet
```ts
// ❌ slop
// Renamed from oldFieldName — keeping for back-compat
const newField = oldField ?? newField;
```
If you just wrote `newField`, there's no old code. Just use `newField`.

### `// TODO: implement` instead of finishing
If you can't finish, **stop and ask**. Don't ship a TODO and claim the phase is done.

### Tests that only assert non-throw
```ts
// ❌ slop
test('createDeal works', async () => {
  await models.Deals.createDeal({ ... });
  expect(true).toBe(true);
});
```
Assert the actual contract: the returned document, the side effect, the state change. "Non-throw" is not a test.

### Validation at internal boundaries
```ts
// ❌ slop
function createDeal(doc: DealInput) {
  if (!doc) throw new Error('doc required');
  if (typeof doc.name !== 'string') throw new Error('...');
  // ...
}
```
TypeScript already ensures `doc.name: string`. Don't re-validate framework guarantees. **Only validate at system boundaries** (user input, external APIs).

### "Just in case" parameters with no caller
```ts
// ❌ slop
function listDeals(stageId: string, opts?: { unused?: boolean }) { ... }
```
If no current caller needs it, don't add it. Don't design for hypothetical futures.

### Renaming unused `_var` to keep the function signature
```ts
// ❌ slop
function handler(_req, _res, _next) { ... }   // none used
```
If you don't use the params, delete them. Function signatures should reflect what the function actually does.

### Feature flags / config knobs for code that's not configurable
If you can't name two scenarios where the knob would be set differently, don't add the knob.

### Re-exports without purpose
```ts
// ❌ slop
export { Deal } from './deal';
export type { DealInput } from './deal';
// ...in a file that adds nothing else
```
Re-export only when there's a real shaping/abstraction reason.

### "Defensive" optional chaining where the type is non-null
```ts
// ❌ slop
const id = deal?._id;  // deal is non-null per type
```
Trust the types. If you don't trust the types, fix the type.

### Console logs that survive the PR
Delete `console.log` / `console.warn` before declaring done unless the file's purpose is logging.

### `any` to silence the type checker
If you reach for `any`, **stop**. Either widen the type properly, or fix the underlying issue.

### TS literal-union field without schema-level enum constraint (the type lies)
```ts
// ❌ slop
// IDeal.ts
interface IDeal { riskLevel?: 'low' | 'medium' | 'high' }

// deals.ts (Mongoose)
riskLevel: { type: String, optional: true }  // no enum!
```
The TypeScript layer says only three values are allowed; Mongoose accepts any string. A non-UI write (tRPC, direct Mongo, forged GraphQL) can store `'urgent'`. The type lies. Add `enum: ['low', 'medium', 'high']` to the Mongoose path OR declare a GraphQL `enum` type and resolve it strictly. The runtime guard must match the static type.

### Function names cited but not grep-verified
```markdown
<!-- ❌ slop in a PR body / REVIEW.md / doc -->
> auto-discovered by `generateSalesFields`
```
Before citing a function name in any artifact a human will read, `grep -rn '<name>'` and confirm both location and role. Skill files can be approximations; PR bodies and reviews cannot. Inheriting imprecise quotations is how docs drift.

### Premature flexibility inherited from precedent
Mirroring a sister field that uses `$in:` for filter when only single-value selection exists in the UI? You inherited an unbuilt multi-select. Either build the UI side or simplify the filter to single-value. Document the decision in GROUND.md's "Deviations from sister." Slop from precedent is still slop.

### `test.skip(true, 'pending seeded data')` without a follow-up wish
```ts
// ❌ slop
test.skip(true, 'pending seeded deal');
```
A skip with no path to un-skip is a permanent skip. The acceptance criterion has no proof. Phase 6's [WORKFLOW.md](./WORKFLOW.md#phase-6--verify) classifies criteria into **wiring** (provable without seeded data) and **behavior** (requires seeded data). The acceptable forms, in preference order:

1. **Wiring test gated on `AGENT_TEST_LIVE=1`** — for wiring-bucket criteria. The stack must be running; no seed needed.
2. **Behavior test that seeds its own fixtures** in `test.beforeAll` and tears down in `test.afterAll`. **Preferred for every behavior-bucket criterion.**
3. **`test.skip(true, 'BLOCKED on wish 2026-06-01-test-auth-fixture')`** — only for *individual* behavior criteria that can't be seeded inline today, and **only if at least one other behavior-bucket criterion in the same wish is non-skipped, seeded, passing**. The blocking wish must exist as a real `.agents/wishes/<id>/WISH.md`.

Phase 6 VERIFY is the **proof**, not a placeholder. Every SPEC acceptance criterion needs a non-skipped test (or a skip pointing at real follow-up work).

### Skipping every behavior test against one named blocking wish (the meta-cop-out)
```ts
// ❌ slop — every behavior criterion deferred to one downstream wish
test.skip(true, 'BLOCKED on wish 2026-05-22-test-fixture-seeder');
test.skip(true, 'BLOCKED on wish 2026-05-22-test-fixture-seeder');
test.skip(true, 'BLOCKED on wish 2026-05-22-test-fixture-seeder');
// ...
```
The named-blocking-wish marker is the **exception**, not the default. If every behavior-bucket criterion in the wish points to the same un-built infra wish, the entire behavior surface is unverified and the wish has discovered a blocking infrastructure dependency. **STOP** at Phase 6 — do not ship. Tell the developer the wish needs the seeder to land first, or that the wish needs to be reshaped (e.g., the field is purely display, no behavior bucket exists).

### "See it work" section missing or vague in PR body
Every PR must include the "See it work in 60 seconds" section (see WORKFLOW.md Phase 7): a runnable Playwright command, a file pointer for read-only review, AND a manual click path. "Start the stack, open the deals page, exercise the picker" is not a path — it's a hope. Exact URL + exact clicks + exact expected text/color/count.

### Two files with the same basename in sibling directories (cognitive collision)
```
frontend/plugins/sales_ui/src/modules/deals/components/deal-selects/SelectConfidenceScore.tsx
frontend/plugins/sales_ui/src/modules/deals/components/common/filters/SelectConfidenceScore.tsx
```
Both files exist; both are imported elsewhere; both come up when a reader greps `SelectConfidenceScore`. The reader has to look at the path to know which one is the edit-picker and which one is the action-bar filter. **This is slop even when each file has one clear purpose.**

The right shape — pick one:
- **Distinct basenames per surface**: `SelectConfidenceScore.tsx` (edit) + `FilterConfidenceScore.tsx` (filter), each in its current directory.
- **One file that namespaces both surfaces** via `Object.assign`: a single `SelectConfidenceScore.tsx` exposing `.FormItem`, `.FilterBar`, `.FilterView`, `.FilterItem` — the route lesson `2026-05-22 — Deal filter UIs live in two places` already mentions as acceptable.

What's **not** acceptable: leaving two identically named files in sibling directories. When you mirror a sister that has this shape (e.g., `priority`), do not inherit it — that's "premature flexibility inherited from precedent" applied to filenames. The precedent itself is slop; fix it in the next wish or split the names.

### PR status claimed without artifact backing it
`WISH.md` saying `Status: shipped (awaiting PR open)` is impossible — `shipped` requires a merge SHA on `main`, `pr-open` requires `SHIP.md`. AI never narrates a status that contradicts the artifacts on disk. See WORKFLOW.md's "Status state machine."

## How to use this checklist

At the end of every phase (especially Phase 5 IMPLEMENT and Phase 6 VERIFY):

1. Re-read this file.
2. Run `git diff` against your changes.
3. For each item above, ask: "Is this pattern present in my diff?"
4. If yes, fix it. Do not proceed.

Before opening a PR (Phase 7):

1. Run through this checklist one more time.
2. Confirm in the PR template under "Slop check: re-read".

## If you spot a new slop pattern

Append it to this file. Then add a one-liner to [`memory/lessons.md`](./memory/lessons.md) noting where you saw it.
