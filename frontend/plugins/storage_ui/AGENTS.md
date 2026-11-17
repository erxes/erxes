# `storage_ui` Plugin Guide

## Identity

- **Plugin:** `storage`
- **Project:** `storage_ui`
- **Layer:** Frontend UI
- **Path:** `frontend/plugins/storage_ui`
- **Last synchronized:** `2026-11-17`

## Scope

### Owns

- The RFID warehouse screen: tags and box breaking, count, movements, zone setup.
- The storage settings route.

### Does not own

- Business rules and validation (`storage_api`).
- Stock, cost and accounting screens (`accounting_ui`).
- Shared layout and pickers (`erxes-ui`, `ui-modules`).

## Current Capabilities

- Tags tab: sealed balance by product, register tags (generated or scanned EPCs), break boxes by EPC.
- Count tab: paste reader EPCs, see matched, missing, unknown, opened and other-zone tags; recent sessions.
- Movements tab: accounting status per movement, error message, re-send.
- Zones tab: create, edit and remove zones with account, branch and department for the sealed and open locations.
- Mutation errors are shown in a dismissible banner.

## Architecture

| Area | Path | Responsibility |
| --- | --- | --- |
| Federation | `frontend/plugins/storage_ui/module-federation.config.ts` | Remote name and exposes |
| Plugin config | `frontend/plugins/storage_ui/src/config.tsx` | `IUIConfig` |
| Router | `frontend/plugins/storage_ui/src/modules/StorageMain.tsx` | `AppLayout`, main and settings routes |
| Main page | `frontend/plugins/storage_ui/src/pages/storage/IndexPage.tsx` | All tabs |
| GraphQL | `frontend/plugins/storage_ui/src/modules/storage/graphql/operations.ts` | Handwritten operations |
| Types | `frontend/plugins/storage_ui/src/modules/storage/types.ts` | Result types |
| Utils | `frontend/plugins/storage_ui/src/modules/storage/utils.ts` | `newRequestKey`, `parseEpcList`, labels |

## Contracts

### Provides

- Module Federation exposes: `./config`, `./storage`, `./storageSettings`, `./widgets`.
- Routes: `/storage/storage`, `/storage/settings/storage`.

### Consumes

- `storage_api` GraphQL operations prefixed `storage*`.
- `accounting_api` `accounts(journals: ["inventory"])` query through the gateway, for the zone account picker.
- `ui-modules`: `PageHeader`, `SelectProduct`, `SelectBranches`, `SelectDepartments`; `erxes-ui`: `Badge`, `Button`, `Table`, `Tabs`.

## Data and State

- Apollo cache; queries are refetched after each mutation.
- Local React state: selected zone, form inputs, last scan result, error message.

## Local Invariants

- Box breaking sends a fresh `requestKey` per user action.
- No `any`; results use the interfaces in `types.ts`.
- No imports from `core-ui` or other plugins.

## Validation

- `pnpm nx lint storage_ui`
- `pnpm nx build storage_ui`
- `pnpm nx test storage_ui`
- Smoke: `pnpm dev:uis`, open `/storage/storage`, create a zone, register tags, break a box and check the Movements tab.
