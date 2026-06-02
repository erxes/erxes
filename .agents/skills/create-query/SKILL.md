---
name: create-query
description: Add or reuse erxes frontend GraphQL queries, mutations, fragments, subscriptions, and Apollo hooks. Use for frontend data-fetching changes.
---

# Skill: Create GraphQL Query

## Workflow

1. Search existing queries
2. Search fragments
3. Search existing hooks
4. Reuse existing GraphQL structure
5. Name new operations with the plugin or module prefix plus purpose, such as
   `operationTaskList` or `cmsPageList`
6. Keep query near feature module
7. Reuse Apollo patterns
8. For mutations or subscriptions, ensure affected visible data updates without
   a browser refresh through cache updates, refetching, or `subscribeToMore`
9. Preserve typings
10. Run focused validation: `pnpm nx lint <plugin>` and
   `pnpm nx build <plugin>`

## Important

- Avoid duplicate queries
- Keep operation names unique
- Reuse fragments/hooks first
- Do not leave stale lists, counters, details, or selectors after a mutation
- Preserve current API contracts
- Do not change backend GraphQL contracts from frontend work unless explicitly
  requested
