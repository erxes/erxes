# Nx Guidelines

## Package Manager

Use `pnpm`. The root `package.json` rejects npm and yarn.

```bash
pnpm install
pnpm nx show projects
```

Do not use `npx nx` in docs or rules unless copying a third-party command that
cannot be changed. Prefer `pnpm nx`.

## Project Names

Common projects include:

- Frontend host: `core-ui`
- Frontend libraries: `erxes-ui`, `ui-modules`
- Frontend plugins: `content_ui`, `frontline_ui`, `sales_ui`, `payment_ui`,
  `loyalty_ui`, `operation_ui`, `accounting_ui`, `mongolian_ui`,
  `insurance_ui`, `tourism_ui`
- Backend services: `gateway`, `core-api`, `erxes-api-shared`,
  `automations-service`, `logs-service`
- Backend plugins: `content_api`, `frontline_api`, `sales_api`, `payment_api`,
  `loyalty_api`, `operation_api`, `accounting_api`, `mongolian_api`,
  `insurance_api`, `tourism_api`, `posclient_api`

Use `pnpm nx show projects` for the current list.

## Core Commands

```bash
pnpm nx serve core-ui
pnpm nx serve content_ui
pnpm nx build core-ui
pnpm nx build content_ui
pnpm nx lint content_ui
pnpm nx test content_ui
pnpm nx build core-api
pnpm nx serve core-api
```

Root scripts:

```bash
pnpm dev:core-api
pnpm dev:apis
pnpm dev:uis
pnpm create-plugin
pnpm release
```

## Target Discovery

Project targets may be explicit in `project.json` or inferred by Nx plugins.
Before recommending or running a target, check the touched project's
`project.json`, `jest.config.ts`, ESLint config, and nearby docs when needed.

Use affected commands for broader changes:

```bash
pnpm nx affected --target=build
pnpm nx affected --target=test
pnpm nx graph
```

For narrow plugin work, run the focused project validation first.
