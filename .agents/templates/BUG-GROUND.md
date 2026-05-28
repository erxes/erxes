# BUG-GROUND: <bug title>

**Wish:** [`./WISH.md`](./WISH.md) | **Bug-Spec:** [`./BUG-SPEC.md`](./BUG-SPEC.md)

## Original feature implementation

Before fixing any bug, understand **what the code was supposed to do**. Read the original feature, not just the broken line.

### Original feature / commit

- **Feature name:** `<the feature this bug lives inside>`
- **Introduced by:** `<git log the file — find the commit/PR that introduced or last modified the broken logic>`
- **Original wish (if exists):** `<link to .agents/wishes/<id>/WISH.md if available>`

### Intended design

<one paragraph: how the feature is *supposed* to work, derived from reading the code and any available SPEC.>

## Files read in full

(Mandatory. Phase 3 gate: Read-tool call count must equal this list size.)

- [ ] `<file>` — <why this file matters for understanding the bug>
- [ ] `<file>` — <the file containing the broken logic>
- [ ] `<file>` — <a related file that shows the correct pattern>
- ...

## Causality chain

Trace the bug from user action to wrong outcome:

```
User action: <what the user does>
  → calls: <function/component/API>
    → which: <does X correctly / does Y incorrectly>
      → because: <root cause>
        → user sees: <wrong behavior>
```

## Similar bugs / patterns

Has a similar bug been fixed before in this codebase?

- [ ] Searched `memory/lessons.md` for related entries
- [ ] Searched git log for related fixes: `git log --all --oneline --grep="<keyword>"`
- [ ] Checked `SLOP-CHECKLIST.md` for matching anti-pattern

**Similar precedent found:**
- `<lesson entry or commit>` — <how it's similar, what we can learn>

(Or: "No similar precedent found.")

## Fix strategy

| Approach | Pros | Cons |
|---|---|---|
| `<approach A>` | <pro> | <con> |
| `<approach B>` | <pro> | <con> |

**Chosen approach:** `<A or B>` — <one sentence why>

## Cross-plugin impact

Does this bug or fix cross plugin boundaries?
- [ ] No (single plugin only)
- [ ] Yes — affects: `<plugin>` via `<federation | tRPC | pubsub>`. See [`../../rules/20-architecture-boundaries.md`](../../rules/20-architecture-boundaries.md).

## Approval

- [ ] All listed files read in full
- [ ] Original feature understood
- [ ] Causality chain documented
- [ ] Similar bugs searched
- [ ] Fix strategy chosen
- [ ] Cross-plugin impact assessed
