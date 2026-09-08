# `hrm_ui` Plugin Guide

## Identity

- **Plugin:** `hrm`
- **Project:** `hrm_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/hrm_ui`
- **Last synchronized:** `2026-09-07`

## Scope

### Owns

- HRM frontend remote configuration, navigation, route composition, and HRM-owned settings UI.
- Payroll foundation settings screens for system config, contribution profiles, grades, seniority rules, and skills.

### Does not own

- Backend persistence, payroll calculation, or GraphQL schema definitions.
- Core users, branches, departments, positions, and movement UI.
- Accounting settings or accounting transaction screens.

## Current Capabilities

- Registers the `hrm_ui` Module Federation remote and exposes `./config`, `./hrm`, and `./hrmSettings`.
- Adds an HRM navigation group with a simple main page.
- Adds one core settings navigation entry for HRM settings under `/settings/hrm/config`.
- Displays and updates HRM main payroll configuration values.
- Displays contribution profiles, grades, seniority rules, and skills in `RecordTable` lists with row actions, checkbox selection, bulk archive command bar, and sheet forms.
- Uses React Hook Form and Zod validation for HRM settings forms.
- Refetches list and count queries after create, update, or archive mutations.

## Architecture

| Area              | Path                              | Responsibility                                            |
| ----------------- | --------------------------------- | --------------------------------------------------------- |
| Runtime           | `src/main.ts`                     | Boots the HRM UI remote.                                  |
| Plugin config     | `src/config.tsx`                  | Registers HRM navigation, modules, and settings nav.      |
| Route composition | `src/modules/HrmMain.tsx`         | Wires HRM main routes.                                    |
| Settings routes   | `src/modules/HrmSettingsMain.tsx` | Wires HRM settings routes.                                |
| Settings UI       | `src/modules/settings`            | Owns HRM settings pages, sheets, GraphQL docs, and types. |
| Pages             | `src/pages`                       | Exposes route-level HRM page components.                  |

## Contracts

### Provides

- Module Federation expose `./config` from `src/config.tsx`.
- Module Federation expose `./hrm` from `src/modules/HrmMain.tsx`.
- Module Federation expose `./hrmSettings` from `src/modules/HrmSettingsMain.tsx`.
- HRM settings routes under `/settings/hrm/config`, `/settings/hrm/config/contribution-profiles`, `/settings/hrm/config/grades`, `/settings/hrm/config/seniority-rules`, and `/settings/hrm/config/skills`.

### Consumes

- HRM API GraphQL config contract `hrmConfigsByCode` and `hrmConfigsUpdateByCode`.
- HRM API GraphQL contribution profile list/create/update/archive contracts.
- HRM API GraphQL grade list/create/update/archive contracts.
- HRM API GraphQL seniority rule list/create/update/archive contracts.
- HRM API GraphQL skill list/create/update/archive contracts.
- UI primitives, tables, sheets, form controls, navigation helpers, spinner, and toast feedback from `erxes-ui`.

## Data and State

- Apollo Client owns HRM settings server state and mutation refreshes.
- React Hook Form owns editable HRM config and reference sheet form state.
- Local React state owns sheet visibility, active edited record, and search input.

## Local Invariants

- HRM UI GraphQL operation names must stay prefixed with `hrm`.
- Create, update, and archive mutations must show toast feedback, refresh visible list/count data, and preserve the `RecordTable` check/action interaction pattern.
- HRM settings routes must remain under `/settings/hrm/config`.
- Settings reference sheets must keep validation in React Hook Form with Zod.
- Module Federation exposes and named exports must stay aligned.
- HRM UI must not import accounting UI implementation details or core UI internals.

## Validation

- `pnpm nx build hrm_ui`
- `pnpm exec tsc -p frontend/plugins/hrm_ui/tsconfig.app.json --noEmit --pretty false`
- Smoke scenario: open `/settings/hrm/config`, update main payroll config values, then navigate to each reference list and create/edit/archive a record without manual refresh.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-07` — `HRM Settings Record Tables`

- **Summary:** Removed duplicated HRM reference entries from the core settings sidebar and moved reference lists plus edit forms to the standard `RecordTable` check/action and side-sheet structure.
- **Affected areas:** `src/modules/settings/components/HrmSettingsNavigation.tsx`, `src/modules/settings/components/ReferenceSettingsPage.tsx`, `src/modules/settings/components/ReferenceFormSheet.tsx`, `src/assets/.gitkeep`.
- **Contracts changed:** None.

### `2026-09-07` — `HRM Settings UI Foundation`

- **Summary:** Added HRM settings navigation, main config form, and list/sheet CRUD surfaces for contribution profiles, grades, seniority rules, and skills.
- **Affected areas:** `src/config.tsx`, `module-federation.config.ts`, `src/modules/HrmMain.tsx`, `src/modules/HrmSettingsMain.tsx`, `src/modules/settings`, `src/pages`.
- **Contracts changed:** Consumes HRM settings GraphQL contracts for configs, contribution profiles, grades, seniority rules, and skills.
