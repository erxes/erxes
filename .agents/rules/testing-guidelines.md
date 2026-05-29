# Testing Guidelines

## Test Tools

- Jest is the primary test runner through Nx.
- React Testing Library is available for frontend component tests.
- Storybook exists for shared UI libraries and frontend components.
- Backend tests should follow the touched service's existing Jest setup.

## Test Strategy

- Add or update tests when behavior changes, especially shared utilities,
  hooks, GraphQL resolvers, model methods, permissions, pagination, and forms.
- Keep tests focused on the changed behavior.
- Prefer user-visible behavior in component tests: roles, text, labels, and
  interactions over implementation details.
- Keep mocks local and explicit.
- Do not add broad snapshot tests unless the surrounding project already uses
  them for that kind of output.

## Validation Commands

Use the touched project's Nx targets:

```bash
pnpm nx lint <project>
pnpm nx test <project>
pnpm nx build <project>
```

Examples:

```bash
pnpm nx lint content_ui
pnpm nx build content_ui
pnpm nx test content_ui
pnpm nx build core-api
```

For frontend plugins:

1. Run `pnpm nx lint <plugin>`.
2. Run `pnpm nx build <plugin>`.
3. Run `pnpm nx test <plugin>` when tests, test setup, or tested behavior were
   touched.

For documentation-only edits, do not run full builds by default. Verify paths,
commands, and stale references instead.

## Review Checklist

- Tests cover the changed behavior or the absence of tests is low risk.
- Assertions describe user or API behavior.
- Async code is awaited.
- Mocks are reset between tests when reused.
- No debug output remains.
