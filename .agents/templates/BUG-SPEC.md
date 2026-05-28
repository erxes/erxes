# BUG-SPEC: <bug title>

**Wish:** [`./WISH.md`](./WISH.md)
**Status:** draft / approved / shipped
**Type:** bug-fix

## Bug report summary

<2–4 sentences. What is broken, from the user's perspective? Avoid implementation language.>

Example: "After dragging a deal from Qualification to Proposal stage, the deal card still shows the green color badge from the previous stage. The color only updates after a full page refresh."

## Observed behavior

<exact symptoms — what the user sees. Include error messages, wrong values, or missing elements verbatim.>

- **Where:** <page, component, API endpoint, or CLI command>
- **When:** <trigger — what user action or condition produces the bug>
- **What happens:** <the incorrect outcome>
- **Error/log excerpt:** <if any — paste verbatim, wrapped in code block>

## Expected behavior

<what should happen instead — derived from reading the original feature code and/or its SPEC.>

## Reproduction steps

1. <step>
2. <step>
3. <step>

## Environment (if known)

- **Tenant:** <subdomain or "all">
- **Browser/client:** <if frontend>
- **Plugin version / commit:** <if known>

## Root cause hypothesis

<after code analysis. Where and why does the code produce the wrong behavior?>

- **File(s):** `<path>` — <what's wrong in this file>
- **Mechanism:** <one paragraph explaining the causal chain>

## Files involved

| File | Role in Bug | Change Needed |
|---|---|---|
| `<file>` | <what this file does wrong> | <what to fix> |
| ... | ... | ... |

## Fix acceptance criteria

Numbered list. Phase 6 (VERIFY) will turn each into at least one regression test.

1. <the bug no longer reproduces when following the reproduction steps>
2. <any additional correctness criteria>
3. <no regressions in related features — list them>

## Out of scope

- <what this fix does NOT change — e.g., no refactoring, no new features>
- <related issues the developer asked to defer>

## Open questions

(Should be empty by the time BUG-SPEC is approved. If not, ASK.)

## Approval

- [ ] Developer confirmed observed behavior matches their report
- [ ] Root cause hypothesis reviewed
- [ ] Fix criteria agreed
- [ ] Out-of-scope confirmed
- [ ] No open questions
