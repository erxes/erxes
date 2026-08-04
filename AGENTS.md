# erxes — Agent & Contributor Guide

Operating rules and codebase reference for anyone (human or AI) changing code in
this repository. Preserve existing architecture, local patterns, and product
behavior. Keep changes small and scoped to the request.

## Instruction Scope and Nested `AGENTS.md` Files

This root file is the repository-wide entry point. It delegates local details
to nested `AGENTS.md` files when a directory needs stricter or more specific
rules.

Before changing any file:

1. Identify the exact target path and owning project.
2. Read this root `AGENTS.md`.
3. Walk from the repository root to the target directory and read every
   `AGENTS.md` on that path.
4. Apply all of those files together while working in that subtree.

The closest `AGENTS.md` to a changed file governs local implementation details.
It may add constraints or choose among repository-approved patterns, but it may
not weaken the root non-negotiable rules, plugin scope boundary, security
requirements, or tenant isolation. All non-conflicting root and intermediate
rules still apply.

Plugins keep local guides at `backend/plugins/<name>_api/AGENTS.md` and
`frontend/plugins/<name>_ui/AGENTS.md`. A plugin guide is loaded on demand:
read it whenever that plugin is in scope, and do not load guides for unrelated
plugins. Every plugin implementation change must create the applicable guide if
it is absent and update it before delivery. Beyond the bounded recent-change
metadata required below, keep only durable facts and rules in a
plugin guide; never use it as a task journal or backlog.

---

## Working Principles

- Search for a similar implementation before writing new code.
- Reuse existing components, hooks, GraphQL documents, utilities, and state
  patterns before adding new ones.
- Keep changes minimal and scoped. Do not refactor unrelated files.
- Do not add dependencies unless the task explicitly requires it.
- Prefer repository consistency over personal preference.
- When unsure whether a change violates a rule below, **ask** rather than guess.

### Priority order when deciding

1. Existing repository patterns
2. Local plugin consistency
3. Minimal changes
4. Clear behavior and maintainability
5. Reusability
6. Performance
7. Personal preference

---

## Non-Negotiable Rules

These must hold in any new or modified code.

1. **UI components** — In frontend code, use components from `erxes-ui` (and
   `ui-modules`). Do not import `@radix-ui/*` directly or hand-roll new UI
   primitives. Prefer composed components (`Form.Field`, `RecordTable.Provider`,
   `Sheet.Content`, …).
2. **Real-time data** — After any create/update/delete mutation, the UI must
   update immediately via Apollo cache update, refetch, or `subscribeToMore`.
   Never require a manual refresh.
3. **Completeness** — No button without a handler, no page without content or an
   empty state, no form without validation, no mutation without success/error
   feedback, no list without loading state, no placeholder ("Coming soon") code.
4. **Exports** — Use named exports in application code. A default export is
   allowed only in a tool configuration where Nx, Rspack, or another external
   tool contract requires it.
5. **Type safety** — No `any` in new or modified code. No `as any` / unnecessary
   casts except at unavoidable external-library boundaries. Type all props and
   hook returns.
6. **GraphQL** — Operation names must be unique repo-wide, never anonymous, and
   prefixed with the plugin/module (`cmsPageList`, `salesDealCreate`). Keep
   operations near the feature they serve.
7. **Backend schema** — Do not introduce new `schemaWrapper` usage. Define
   schemas with `new Schema(...)` and explicit fields. Never modify backend
   contracts from a frontend-only task.
8. **Plugin isolation and scope** — A plugin change must stay inside that
   plugin. No cross-plugin imports and no edits to core, shared libraries, or
   another plugin to make the feature work. Shared code may be consumed only
   through existing public interfaces in `erxes-ui`, `ui-modules` (frontend),
   or `erxes-api-shared` (backend).
9. **Code quality** — No leftover `console.log`/`debugger`, no commented-out
   dead code, no unused imports/variables, no untracked `TODO`s.

### Before declaring a task done

- `pnpm nx lint <project>` passes
- `pnpm nx build <project>` passes
- `pnpm nx test <project>` passes (when tests exist or are touched)
- TypeScript compiles with no errors and no new lint/Sonar warnings
- The diff contains no unrelated edits

### Forbidden

- Introducing a new UI system or replacing existing patterns with preferences.
- Renaming public APIs, GraphQL operation names, routes, or Module Federation
  exposes casually.
- Large refactors without an explicit request.
- Moving Module Federation exposes without updating host references.
- Changing core, shared libraries, root infrastructure, or another plugin as an
  implicit part of plugin development.

---

## Architecture & Stack

**erxes** is a self-hosted Experience Operating System: an Nx-powered pnpm
monorepo of microservices (backend) and Module Federation micro-frontends
(frontend), licensed AGPLv3 (core) with Enterprise plugins.

- **Package manager:** pnpm ≥ 8 (required) · **Node:** 22 in CI · **TS:** 5.7.3
- **Build:** Nx 20 with caching and affected-graph task orchestration

### Backend

- Node.js + TypeScript on Express; Apollo Server v4 with Apollo Federation
  (`@apollo/subgraph`); tRPC v11 for type-safe service-to-service calls
- MongoDB + Mongoose; Redis (ioredis) + BullMQ; Elasticsearch 7
- GraphQL subscriptions over Redis; JWT / WorkOS auth
- API Gateway (Apollo Router) on **4000**; Core API on **3300**; plugin APIs on
  **3305+**. Plugins register with the gateway via Redis service discovery.

### Frontend

- React 18 bundled with Rspack; `@module-federation/enhanced`
- TailwindCSS v4 + Radix-based `erxes-ui` design system
- State: Jotai (atomic) + Apollo Client; React Router v7; React Hook Form + Zod;
  `react-i18next`
- Core UI host on **3001**; plugin UIs on **3002–3011**

---

## Repository Structure

```text
backend/
  gateway/             API gateway (4000)
  core-api/            Core business logic (3300): apollo/, trpc/, modules/, meta/
  erxes-api-shared/    Shared lib: utils/, core-types/, core-modules/
  plugins/<name>_api/  Plugin microservices
  services/            Background services (automations, logs)
frontend/
  core-ui/             Module Federation host (3001)
  libs/erxes-ui/       Core UI primitives + state
  libs/ui-modules/     Reusable business/UI modules
  plugins/<name>_ui/   Plugin remotes: config.tsx, modules/, pages/, widgets/
apps/                  Standalone apps (client-portal, posclient-front, widgets)
scripts/               Dev scripts (create-plugin.js, start-*-dev.js)
.github/workflows/     CI/CD pipelines
```

### Path aliases

Frontend plugins: `~/*` → `src`, `@/*` → `src/modules`, plus `erxes-ui`,
`ui-modules`. Backend services: `~/*` → `src`, `@/*` → `src/modules`,
`erxes-api-shared/*` → the shared lib. Do not import across frontend plugins.

---

## Development Workflow

```bash
pnpm install                 # MUST use pnpm
cp .env.sample .env          # then edit

pnpm dev:core-api            # Gateway + Core API
pnpm dev:apis                # all backend services in ENABLED_PLUGINS
pnpm dev:uis                 # all frontend plugins

pnpm nx serve <project>      # run one service/plugin (e.g. sales_api, sales_ui)
pnpm nx build <project>
pnpm nx test  <project>
pnpm nx affected --target=build   # only changed projects
```

Key env vars: `MONGO_URL`, `REDIS_HOST`/`REDIS_PORT`, `ENABLED_PLUGINS`,
`DOMAIN`, `REACT_APP_API_URL`. Backend shared lib must be rebuilt
(`pnpm nx build erxes-api-shared`) after changing `erxes-api-shared`.

---

## Plugin Development

Backend plugins are independently deployable microservices registered with the
gateway through Redis. Frontend plugins are independently buildable Module
Federation remotes. A complete plugin may own both of these paired projects:

- `backend/plugins/<name>_api`
- `frontend/plugins/<name>_ui`

### Hard scope boundary

Plugin development must stay inside the plugin being changed.

- A backend-only task may write only under
  `backend/plugins/<name>_api/**`.
- A frontend-only task may write only under
  `frontend/plugins/<name>_ui/**`.
- A full-stack plugin task may write only under those two matching plugin
  directories.
- Never edit `core-api`, `core-ui`, another plugin, a shared library, or root
  infrastructure to make a plugin feature work.
- Never import source code, models, state, or components from another plugin.
- Consume shared packages and platform contracts through their existing public
  APIs; do not alter those APIs as an implicit part of plugin work.
- If the requested behavior cannot be implemented within the plugin boundary,
  stop and report the missing platform capability. A shared or core change is a
  separate task requiring explicit scope.

Files outside the plugin may change only when the user explicitly names that
repository-level work, such as a shared contract or CI change. Do not infer it
from a plugin request. Local `.env` activation is setup, not plugin source code.

This boundary is architectural, not organizational. A plugin must remain
functional, buildable, testable, deployable, and removable without requiring
private implementation details from another plugin.

### Mandatory plugin guide maintenance

Every change to plugin source, configuration, schema, migration, dependency,
test, route, or user-visible behavior must update the `AGENTS.md` at the root of
each changed plugin project.

- Backend changes update `backend/plugins/<name>_api/AGENTS.md`.
- Frontend changes update `frontend/plugins/<name>_ui/AGENTS.md`.
- Full-stack changes update both files with side-specific facts.
- If the applicable file does not exist, create it as part of the change.
- Do not update another plugin's guide.
- A change only to a plugin's `AGENTS.md` does not recursively require another
  maintenance edit.

The guide is a compact current-state contract with only a bounded recent-change
history. Before implementation, read it. Before delivery, synchronize paths,
capabilities, contracts, invariants, validation commands, and the
`Recent Changes` section with the final code. Add the newest entry first, keep
at most ten entries, and remove the oldest entry when adding an eleventh.

Use this exact section order:

```markdown
# `<project-name>` Plugin Guide

## Identity

- **Plugin:** `<plugin-name>`
- **Project:** `<project-name>`
- **Layer:** `<Backend API | Frontend UI>`
- **Path:** `<repository-relative plugin root>`
- **Last synchronized:** `<YYYY-MM-DD>`

## Scope

### Owns

- `<business capabilities and data or UI surfaces owned here>`

### Does not own

- `<explicit boundaries that prevent scope leakage>`

## Current Capabilities

- `<behaviors that are implemented and usable now>`

## Architecture

| Area     | Path                         | Responsibility             |
| -------- | ---------------------------- | -------------------------- |
| `<area>` | `<repository-relative path>` | `<current responsibility>` |

## Contracts

### Provides

- `<GraphQL, tRPC, HTTP, event, federation, route, or widget contract>`

### Consumes

- `<public platform contract or shared package API>`

## Data and State

- `<tenant-owned collections, migrations, Apollo cache, atoms, or local state>`

## Local Invariants

- `<plugin-specific rule that must remain true after future changes>`

## Validation

- `pnpm nx lint <project-name>`
- `pnpm nx build <project-name>`
- `pnpm nx test <project-name>` (when `project.json` defines a test target)
- `<plugin-specific smoke scenario>`

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `<YYYY-MM-DD>` — `<short title>`

- **Summary:** `<one sentence describing the delivered behavior>`
- **Affected areas:** `<paths or capabilities>`
- **Contracts changed:** `<None | exact contract changes>`
```

Replace every placeholder with a verified fact. Use `None` only when it is
factually correct. Keep each recent-change entry concise, prepend exactly one
entry per delivered plugin change, and delete all entries beyond the newest ten.
Do not expand entries into task logs. Remove stale current-state facts instead
of preserving them as history. Validation commands must match targets that
actually exist in the plugin's `project.json`.

### Creating a plugin

Before generating code, choose:

1. A unique plugin name describing the business capability.
2. The first module owned by that plugin.
3. Whether the request needs the backend, frontend, or both.
4. Unique backend and frontend development ports.

From the repository root, run the interactive generator:

```bash
pnpm create-plugin
```

For a repeatable non-interactive run:

```bash
pnpm create-plugin --plugin-name=inventory --module-name=items
```

Names must begin with a letter and contain only letters and numbers. The
generator creates:

- `backend/plugins/inventory_api`
- `frontend/plugins/inventory_ui`

It also creates Nx projects named `inventory_api` and `inventory_ui`. Enable
the plugin locally through `ENABLED_PLUGINS` in `.env`.

The generator always creates both projects. If the approved plugin is
intentionally backend-only or frontend-only, remove the unused generated
project immediately; never retain an inactive project or placeholder surface.

Before adding feature behavior, compare the generated projects with one current
plugin that has the same shape. Reuse its local structure and public platform
integration patterns without importing its source.

### The scaffold is not a deliverable

Generated code is only a directory and configuration starting point. Review
every generated file before treating the plugin as usable.

At minimum:

- Replace sample pages, widgets, models, schemas, resolvers, and placeholder
  text with complete behavior or remove them.
- Replace hard-coded generated ports with unused plugin-specific ports.
- Make the plugin name, module name, routes, navigation paths, and Module
  Federation exposes consistent.
- Ensure each `config.tsx` path maps to a real route and each expose maps to a
  real named export.
- Remove unused generated files and imports.
- Fix generated types, validation, loading states, empty states, error states,
  and mutation feedback.
- Use named exports, except where a tool configuration has an unavoidable
  external default-export contract.
- Add only dependencies owned by the plugin, and do not add a dependency when
  an existing public platform package already provides the capability.

Do not describe generated boilerplate as an MVP, scaffold, foundation, or
follow-up when the request expects a working plugin.

### Backend plugin requirements

The backend project owns its runtime, data model, API, permissions, and
plugin-specific integrations.

- Start through `startPlugin({...})` with a unique plugin name and port.
- Generate models from the request `subdomain`; preserve tenant isolation in
  every resolver, service, model operation, worker, and route.
- Keep GraphQL schema and resolvers inside the plugin. Prefix every operation
  with the plugin or module name and keep operation names unique repository-wide.
- Check authentication and permissions before sensitive reads or mutations.
- Define Mongoose schemas with `new Schema(...)` and explicit fields. Do not
  introduce `schemaWrapper`.
- Validate inputs at the API boundary and return actionable errors.
- Keep resolvers thin; place business rules in the plugin's established service
  or model layer.
- Register plugin-owned automation, segment, import/export, notification, and
  subscription behavior through the platform extension points exposed to the
  plugin.
- Own plugin migrations inside the plugin. Never read or mutate another
  plugin's collections directly.
- Communicate with platform or plugin services only through published GraphQL,
  tRPC, HTTP, event, or federation contracts. Never import another service's
  implementation.

### Frontend plugin requirements

The frontend project owns its routes, navigation, pages, widgets, GraphQL
documents, state, translations, and user feedback.

- Use `erxes-ui` and `ui-modules`; do not import Radix primitives directly or
  build a competing UI system.
- Keep GraphQL documents next to the feature and prefix operation names with
  the plugin or module.
- Use Apollo Client for server state, Jotai only for plugin-wide client state,
  and local React state for component-local behavior.
- Use React Hook Form with Zod validation for forms.
- Provide loading, empty, success, and error states. Every button must have a
  working handler.
- After create, update, or delete mutations, update Apollo cache, refetch the
  affected query, or subscribe to changes so the UI never requires a manual
  refresh.
- Lazy-load exposed modules and wrap them in `Suspense`.
- Keep Module Federation exposes, `config.tsx` paths, and actual routes exactly
  aligned.
- Keep plugin-specific assets, translations, components, hooks, and utilities
  inside the plugin.
- Use only public types and components from shared packages. Never import from
  another plugin or from an internal path inside a shared package.

### Independence check

Before considering plugin work complete, verify:

- The plugin builds and tests without another optional plugin's source.
- Disabling the plugin does not break core or other plugins.
- Removing another optional plugin does not break this plugin.
- Backend data access remains tenant-scoped and owned by this plugin.
- Frontend imports resolve only within the plugin or through public shared
  packages.
- All routes and federation exposes load directly.
- All create, update, and delete flows update the UI immediately.
- No source changes escaped the plugin's allowed directories.

Run focused validation for every side changed:

```bash
pnpm nx lint <name>_api
pnpm nx build <name>_api
pnpm nx test <name>_api

pnpm nx lint <name>_ui
pnpm nx build <name>_ui
pnpm nx test <name>_ui
```

Run only targets defined by the project, but never skip its build or relevant
tests before delivery.

---

## Conventions

- **Formatting:** match the touched project — 2-space indent, single quotes,
  trailing commas. Let local lint/Prettier/TS settings win.
- **Naming:** PascalCase React components, camelCase functions/vars,
  `UPPER_SNAKE_CASE` global constants, kebab-case config files. `IUser`-style
  interface prefixes and class-based Mongoose models follow local convention.
- **GraphQL:** `type` PascalCase; queries/mutations/subscriptions named
  `{plugin}{Resolver}{Purpose}` in camelCase. Resolvers receive
  `(_, args, { models, subdomain, user })`; check permissions before mutating.
- **Multi-tenancy:** every request carries a `subdomain`; models are scoped to
  it. Always honor subdomain context for data access.
- **State:** `useState` local, Jotai global, Apollo for server data, React Hook
  Form + Zod for forms.

### Tests

Co-locate under `__tests__/`. Backend service/model tests use
`generateModels('test')` with cleanup in `afterEach`. Frontend tests use
`@testing-library/react` with Apollo `MockedProvider`. Run via
`pnpm nx test <project>` (or `pnpm nx affected --target=test`).

---

## Git

- Branch prefixes: `feat/`, `fix/`, `docs/`. Reference issues in commits.
- Keep commits focused; run affected lint/build/test before pushing.
- See `CONTRIBUTING.md` and https://erxes.io/docs for more.
