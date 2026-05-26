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
A skip with no path to un-skip is a permanent skip. The acceptance criterion has no proof. Two acceptable forms:

1. **Seed the fixtures yourself** (preferred). The Playwright test creates the board → pipeline → stage → deal via API in `test.beforeAll`, runs the user-visible flow, asserts the outcome, tears down in `test.afterAll`.
2. **Skip with a named blocking wish:** `test.skip(true, 'BLOCKED on wish 2026-06-01-test-auth-fixture')`. The wish must exist as a real `.agents/wishes/<id>/WISH.md`. No wish, no skip.

Phase 6 VERIFY is the **proof**, not a placeholder. Every SPEC acceptance criterion needs a non-skipped test (or a skip pointing at real follow-up work).

### Skipping skill-mandated goals or non-negotiable rules
If a skill (like `create-plugin.md`) lists specific "Non-Negotiable Rules" or "Goal Conditions", skipping even one of them is slop. Your SPEC must list them as acceptance criteria, and your PLAN must include commits to implement them.

### "See it work" section missing or vague in PR body
Every PR must include the "See it work in 60 seconds" section (see WORKFLOW.md Phase 7): a runnable Playwright command, a file pointer for read-only review, AND a manual click path. "Start the stack, open the deals page, exercise the picker" is not a path — it's a hope. Exact URL + exact clicks + exact expected text/color/count.

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
