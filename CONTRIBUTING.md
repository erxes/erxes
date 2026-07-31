# Contributing to erxes

Thank you for helping improve erxes. Contributions of code, documentation,
tests, bug reports, and product feedback are welcome.

This guide describes how to propose a change, work within the repository, and
prepare a pull request that can be reviewed and merged safely.

## Before You Start

- Search [existing issues](https://github.com/erxes/erxes/issues) and pull
  requests before opening a duplicate.
- For bugs and scoped improvements, open or select an issue before writing code.
- For large features, architectural changes, or new dependencies, discuss the
  proposal with the maintainers first.
- Use [GitHub Issues](https://github.com/erxes/erxes/issues) for technical
  questions, or join the
  [erxes Discord community](https://discord.com/invite/aaGzy3gQK5).
- Follow the [Code of Conduct](CODE_OF_CONDUCT.md).
- Report vulnerabilities through the process in [SECURITY.md](SECURITY.md), not
  through a public issue.

## Repository Overview

erxes is an Nx-powered pnpm monorepo. Backend services are independent
microservices; frontend features are delivered through Module Federation
micro-frontends.

```text
backend/
  gateway/             API gateway
  core-api/            Core backend modules and GraphQL API
  erxes-api-shared/    Shared backend types and utilities
  plugins/<name>_api/  Backend plugin services
  services/            Background services
frontend/
  core-ui/             Module Federation host
  libs/erxes-ui/       Shared UI primitives
  libs/ui-modules/     Shared business UI modules
  plugins/<name>_ui/   Frontend plugin remotes
apps/                  Standalone applications
scripts/               Development and generation scripts
```

Before adding code, identify which project owns the behavior. Do not move logic
into `core-ui`, a shared library, or another plugin merely because it is
convenient. Shared code belongs in a shared library only when multiple projects
have a real, current need for it.

## Development Requirements

Use the same major toolchain as CI:

- Node.js 22
- pnpm 8 or newer; npm and Yarn are not supported
- MongoDB
- Redis
- Elasticsearch 7 when the affected feature requires search

Follow the [local setup guide](https://erxes.io/docs/local-setup) for service
configuration.

### Initial setup

```bash
git clone https://github.com/<your-github-username>/erxes.git
cd erxes
git remote add upstream https://github.com/erxes/erxes.git
pnpm install
cp .env.sample .env
```

Update `.env` for your local services and enable only the plugins needed for the
change.

### Common development commands

```bash
pnpm dev:core-api            # Gateway and Core API
pnpm dev:apis                # APIs enabled in .env
pnpm dev:uis                 # Enabled frontend plugins

pnpm nx serve <project>
pnpm nx lint <project>
pnpm nx build <project>
pnpm nx test <project>
```

Examples of project names include `core-api`, `sales_api`, and `sales_ui`.
Backend projects that consume `erxes-api-shared` may require the shared library
to be built first:

```bash
pnpm nx build erxes-api-shared
```

## Contribution Workflow

### 1. Choose an issue

Use an [existing issue](https://github.com/erxes/erxes/issues) or
[open a new one](https://github.com/erxes/erxes/issues/new/choose). Describe the
current behavior, expected behavior, and enough context to reproduce or assess
the request.

Keep one pull request focused on one issue or one cohesive outcome. Unrelated
cleanup makes review harder and should be submitted separately.

### 2. Fork and branch

Fork the repository, clone your fork, and create a branch from the latest
upstream `develop` branch.

```bash
git fetch upstream
git switch develop
git pull --ff-only upstream develop
git switch -c <prefix>/<short-description>
```

Use these branch prefixes:

- `feat/` for features
- `fix/` for bug fixes
- `docs/` for documentation

Use a short, descriptive branch name such as `fix/deal-stage-filter`.

### 3. Research before implementing

Search for a similar implementation in the same project before creating a new
pattern. Reuse existing components, hooks, GraphQL documents, utilities, state
patterns, model conventions, and error handling.

Repository consistency takes priority over personal preference. Keep changes
small, avoid unrelated refactors, and do not add a dependency unless the change
requires it and maintainers have agreed to it.

### 4. Implement the complete behavior

A contribution must work end to end. Do not submit placeholder pages, inactive
buttons, forms without validation, lists without loading and empty states, or
mutations without success and error feedback.

Fix the cause rather than hiding an error or suppressing a warning. Remove code
made obsolete by the change; do not leave compatibility aliases, commented-out
implementations, debug logs, or untracked TODOs.

## Engineering Standards

### TypeScript and exports

- Use named exports. Do not introduce default exports.
- Fully type new and modified code. Do not add `any`, `as any`, or unnecessary
  casts.
- Preserve local naming, import aliases, and file organization.
- Use two-space indentation, single quotes, and trailing commas where enforced
  by the touched project.
- Remove unused imports and variables before opening a pull request.

### Frontend

- Use components from `erxes-ui` and `ui-modules`. Do not import Radix packages
  directly or create competing UI primitives.
- Prefer existing composed APIs such as `Form.Field`, `RecordTable.Provider`,
  and `Sheet.Content`.
- Use React Hook Form and Zod for forms, Apollo Client for server data, Jotai for
  shared client state, and local React state for component-local behavior.
- Provide accessible labels, keyboard behavior, loading states, error feedback,
  and meaningful empty states.
- After every create, update, or delete mutation, update the UI immediately
  through the Apollo cache, a targeted refetch, or `subscribeToMore`.
- Lazy-load Module Federation modules and render them inside `Suspense`.
- When changing an exposed module or route, update every matching host,
  navigation, and Module Federation reference.

### Backend

- Preserve tenant isolation. Every request and model operation must honor the
  request subdomain.
- Check authentication and permissions before mutations or sensitive reads.
- Define new Mongoose schemas with `new Schema(...)` and explicit fields. Do not
  introduce new `schemaWrapper` usage.
- Keep resolver methods thin; put reusable business behavior in the module's
  established service or model layer.
- Rebuild `erxes-api-shared` before validating consumers when shared backend
  contracts change.
- Treat migrations and compatibility changes as explicit deliverables. Never
  change stored data assumptions silently.

### GraphQL

- Give every operation a unique, explicit name.
- Prefix operation names with the owning plugin or module, for example
  `cmsPageList` or `salesDealCreate`.
- Keep operations close to the feature that uses them.
- Do not change an existing schema contract as part of a frontend-only change.
- Update affected schema definitions, resolvers, generated types, callers, and
  tests together when a contract intentionally changes.

### Plugin boundaries

Plugins must remain isolated. Do not import source code directly from another
plugin.

Use these shared locations when behavior genuinely belongs across projects:

- `frontend/libs/erxes-ui` for reusable UI primitives
- `frontend/libs/ui-modules` for reusable business UI
- `backend/erxes-api-shared` for shared backend contracts and utilities

When generating a plugin with `pnpm create-plugin`, treat generated output as a
starting point. Replace placeholders, add real types and validation, and make
all exposed behavior production-ready before submitting it.

## Tests and Verification

Choose verification based on the behavior changed:

- Reproduce a bug before fixing it, then confirm the same scenario no longer
  fails.
- Exercise UI changes in the browser, including loading, success, empty, and
  error states that the change affects.
- Run existing tests that cover a changed contract.
- Add a test when the contribution introduces observable behavior that is not
  already protected.
- Keep tests deterministic, isolated, and focused on behavior rather than
  implementation details.

Before opening a pull request, run the focused Nx targets for every affected
project:

```bash
pnpm nx lint <project>
pnpm nx build <project>
pnpm nx test <project>
```

Run tests when the project has tests or when tests were changed. Also confirm
that TypeScript compiles without new errors and that the final change contains
no unrelated files.

For changes spanning multiple projects, Nx can run the affected graph:

```bash
pnpm nx affected --target=lint
pnpm nx affected --target=build
pnpm nx affected --target=test
```

## Commits

Keep commits small, coherent, and reviewable. Each commit should leave the
repository in a meaningful state and explain the reason for the change, not
only the files touched.

Do not include generated output, caches, local environment files, credentials,
or unrelated formatting changes unless the repository explicitly tracks them.

## Pull Requests

Open pull requests against `develop`. Link the issue and include:

- **What:** the behavior or contract changed
- **Why:** the problem being solved
- **How:** the implementation approach and important tradeoffs
- **Verification:** exact commands and manual scenarios exercised
- **Screenshots or recordings:** required for visible UI changes
- **Migration or deployment notes:** required when operators must take action

Before requesting review:

- Rebase or update the branch when necessary and resolve conflicts locally.
- Review the complete change from a user's perspective.
- Confirm every button, form, mutation, route, and state transition works.
- Check that no secret, debug statement, commented-out code, or unrelated edit
  is present.
- Ensure lint, build, and relevant tests pass for each affected project.

Respond to review feedback with either a code change or a clear technical
explanation. Resolve conversations only after the concern has been addressed.

Pull requests are squash-merged. Maintainers create releases from the shared
integration branches; contributors do not need to update release metadata
unless requested.

## Documentation and Translations

Update documentation when a public workflow, configuration value, command,
route, API contract, or operational requirement changes. Keep examples
executable and use paths that exist in the repository.

User-facing text should use the project's translation system rather than being
hard-coded. Existing translations are managed through
[Transifex](https://explore.transifex.com/erxes-inc/erxesxos/).

## Getting Help

If repository behavior or ownership is unclear, ask before implementing a new
pattern:

- [GitHub Issues](https://github.com/erxes/erxes/issues)
- [Official documentation](https://erxes.io/docs/introduction)
- [Discord community](https://discord.com/invite/aaGzy3gQK5)
