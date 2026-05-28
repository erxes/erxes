---
name: plugin-workflow
description: Baseline workflow for erxes plugin contributions. Use for frontend or backend plugin changes to enforce local discovery, minimal scope, validation, and diff review.
---

# Skill: Plugin Contribution Workflow

## Before Coding

1. Read the root `AGENTS.md` and any nested `AGENTS.md` that applies to the
   touched path
2. Understand plugin structure
3. Find similar implementation
4. Reuse existing patterns

## During Coding

1. Keep changes scoped
2. Preserve architecture
3. Preserve UX consistency
4. Avoid unnecessary abstractions
5. Keep components understandable

## After Coding

1. Run `pnpm nx lint <plugin>`
2. Run `pnpm nx build <plugin>`
3. Run `pnpm nx test <plugin>` when tests, test setup, or tested behavior were
   touched
4. Fix introduced warnings
5. Remove debug code
6. Review final diff

## After Pushing / PR

7. **Run `pr-review-loop` skill.** The erxes repo uses AI reviewers (CodeRabbit,
   Sourcery, Claude Code Action, Kimi, SonarCloud). After every commit to a PR,
   you MUST poll for new comments, address every actionable item, wait for CI
   checks to pass, and loop until zero open comments and all checks green.
   Only then is the task done. Do not declare a task complete while PR
   comments are unresolved or CI is failing.

## Engineering Expectations

- Consistency over cleverness
- Reuse over reinvention
- Minimalism over overengineering
- Repository patterns over personal preference
