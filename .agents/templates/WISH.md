# Wish: <one-line title>

**ID:** `YYYY-MM-DD-<slug>`
**Created:** YYYY-MM-DD
**Status:** `captured` — see [`../../WORKFLOW.md`](../../WORKFLOW.md#status-state-machine-the-only-legal-status-values) for the legal enum. AI never self-assigns `shipped` (that requires a merge SHA on `main`); `pr-open` requires `SHIP.md` to exist with a verifiable URL.

## Original wish

> <verbatim from `/sales "..."`>

## Clarifying questions (and answers)

1. **Q:** <question>
   **A:** <developer answer>

(Add questions+answers only when ambiguity required them. If the wish was unambiguous, write "None — wish was clear.")

## Disambiguated intent

<one paragraph: what we are building, in concrete terms. No ambiguity. This is what Phase 2 SPEC will define more formally.>

## Routing

**Skill:** `.agents/skills/sales/<skill>.md`
(or)
**Routing decision:** NOVEL — needs new skill / one-off / reshape wish

**Reasoning:** <one sentence why this skill fits, or why it's novel>

## Out-of-scope (developer confirmed)

<things the developer explicitly said are NOT part of this wish, captured to prevent scope creep>

## Notes

<anything else relevant — links to related wishes, prior conversations, etc.>
