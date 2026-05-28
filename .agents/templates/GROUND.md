# GROUND: <wish title>

**Wish:** [`./WISH.md`](./WISH.md) | **Spec:** [`./SPEC.md`](./SPEC.md)

## Sister features

Pick 1–2 existing features in the target plugin that are closest in shape to what we're building.

### Sister 1: `<feature name>`
**Why chosen:** <one sentence — same data type, same UI surface, same federation contract, etc.>
**Implemented in:**
- `<file>` — what it does
- `<file>` — what it does

### Sister 2: `<feature name>` (if applicable)
**Why chosen:** <one sentence>
**Implemented in:**
- `<file>`
- `<file>`

## Files I read in full

(Mandatory. Phase 3 gate: Read-tool call count must equal this list size.)

- [ ] `<file>`
- [ ] `<file>`
- [ ] `<file>`
- ...

## Files to edit (mapped from sisters)

| File | Why | Sister equivalent |
|---|---|---|
| `<file>` | <change> | `<sister's file>` |
| ... | ... | ... |

## Files to create

| File | Why | Closest existing analogue |
|---|---|---|
| `<file>` | <purpose> | `<existing file with same shape>` |

(Often empty for feature additions. Most edits mirror existing files.)

## Deviations from sister

If anything in our change deviates from the sister, note it:

- **What's different:** <specific>
- **Why we deviate:** <reason — usually because the wish requires something the sister doesn't have>
- **Risk:** <what could go wrong because of the deviation>

(Empty if our change mirrors the sister 1:1.)

## Cross-plugin impact

Does this change cross plugin boundaries?
- [ ] No (single plugin only)
- [ ] Yes — affects: `<plugin>` via `<federation | tRPC | pubsub>`. See [`../../rules/20-architecture-boundaries.md`](../../rules/20-architecture-boundaries.md).

## Approval

- [ ] All listed files read in full
- [ ] Sister features confirmed appropriate
- [ ] Deviations documented
- [ ] Cross-plugin impact assessed
