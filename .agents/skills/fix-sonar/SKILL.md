---
name: fix-sonar
description: Fix Sonar, lint, or TypeScript issues in erxes with minimal behavior-preserving edits. Use when addressing static-analysis findings.
---

# Skill: Fix Sonar Issues

## Workflow

1. Fix issue with minimal changes
2. Preserve existing behavior
3. Avoid unnecessary refactors
4. Preserve naming consistency
5. Verify TypeScript types
6. Run focused validation for the touched project, usually
   `pnpm nx lint <project>` and `pnpm nx build <project>`

## Important

- Never rewrite working architecture just to satisfy Sonar
- Prefer minimal safe fixes
- Preserve repository patterns
