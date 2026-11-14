<!--
Title: <type>(<scope>): <summary>, e.g. fix(sales): keep deal stage after drag
Keep one PR to one outcome. Delete any section that does not apply.
-->

Closes #

## Why

<!-- The problem for the user or operator, in 1-3 sentences. Bots summarize what changed; you explain why. -->

## Start reviewing here

<!-- 1-3 links to the lines that carry the real decision, with one line each on what to check. -->

- `path/to/file.ts:42` —

## What I checked myself

<!-- Commands you ran and scenarios you clicked through. Include failure, empty and permission cases you touched. -->

- [ ] `pnpm nx lint <project>`
- [ ] `pnpm nx build <project>`
- [ ] `pnpm nx test <project>` (if the project has tests)
- [ ] Manual:

## Screenshots or recording

<!-- Required for visible UI changes: before and after, or a short video of the flow. Do not paste screenshots of code. -->

| Before | After |
| ------ | ----- |
|        |       |

## Risk and deploy notes

<!-- Migrations, env vars, permissions, GraphQL contract changes, breaking behavior, or "None". -->

## AI use

<!-- Pick exactly one. -->

- [ ] No AI tools were used.
- [ ] AI tools were used (name them: ). I read every changed line, can explain it in review, and verified it as described above.

## Checklist

- [ ] The change stays inside its owning project; no cross-plugin imports.
- [ ] Every new button, form and mutation has a handler, validation, feedback and an immediate UI update.
- [ ] No secrets, debug logs, commented-out code or unrelated edits.
- [ ] The plugin `AGENTS.md` is updated if plugin code changed.
