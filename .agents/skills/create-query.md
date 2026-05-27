# Skill: Create GraphQL Query

## Workflow

1. Search existing queries
2. Search fragments
3. Search existing hooks
4. Reuse existing GraphQL structure
5. Keep query near feature module
6. Reuse Apollo patterns
7. Preserve typings
8. Run focused validation: `pnpm nx lint <plugin>` and
   `pnpm nx build <plugin>`

## Important

- Avoid duplicate queries
- Reuse fragments/hooks first
- Preserve current API contracts
- Do not change backend GraphQL contracts from frontend work unless explicitly
  requested
