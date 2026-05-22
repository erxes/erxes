---
description: Show detail of one wish — artifact contents + current phase + next step
argument-hint: "<wish-id>"
allowed-tools: Read, Bash, Glob
---

# /wish — wish detail

Wish ID: $ARGUMENTS

## What to do

1. Resolve the wish directory: `.agents/wishes/$ARGUMENTS/`. If $ARGUMENTS is empty or vague, list available wish IDs and ask which one.
2. If the directory doesn't exist, say so and list available wish IDs from `.agents/wishes/`.
3. For each artifact that exists, read it and summarize:
   - `WISH.md` — the original wish + clarifying answers + disambiguated intent + routing decision
   - `SPEC.md` — acceptance criteria + scope (in/out)
   - `GROUND.md` — sister features picked + files-read inventory + deviations
   - `PLAN.md` — atomic commits ordered, LOC budget
   - `REVIEW.md` — slop checklist walkthrough + lessons captured + PR URL
   - `STATUS.md` (if present) — halt reason
4. Determine current phase from highest artifact present.
5. Report:

```
Wish: <id>
Path: .agents/wishes/<id>/
Phase: <current phase or 'halted'>
Last activity: <time>

Artifacts:
  ✓ WISH.md       (captured, <time ago>) — <one-line summary>
  ✓ SPEC.md       (drafted,  <time ago>) — <one-line summary>
  ✓ GROUND.md     (mapped,   <time ago>) — <one-line summary>
  ✗ PLAN.md       —
  ✗ REVIEW.md     —

Next step: <what should happen next>
  e.g. "Phase 4 PLAN not started — re-enter the wish via /sales or open PLAN.md draft."
  e.g. "Halted — see STATUS.md, decide whether to resume or abandon."
  e.g. "Shipped — no action needed."
```

## What NOT to do

- Don't write any files.
- Don't propose code changes.
- Don't dump full artifact contents — summarize each in 1-3 sentences.
