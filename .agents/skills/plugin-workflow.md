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

## Engineering Expectations

- Consistency over cleverness
- Reuse over reinvention
- Minimalism over overengineering
- Repository patterns over personal preference
