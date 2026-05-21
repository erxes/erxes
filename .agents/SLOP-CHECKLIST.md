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
