# `content_ui` Plugin Guide

## Identity

- **Plugin:** `content`
- **Project:** `content_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/content_ui`
- **Last synchronized:** `2026-08-03`

## Scope

### Owns

- CMS websites, posts, categories, tags, pages, menus, custom types, custom
  fields, settings, and Web Builder UI.

### Does not own

- Content backend schemas, core navigation internals, or another plugin's UI.

## Current Capabilities

- Provides CMS routes under `/content/cms` and website-scoped content editing.
- Provides Web Builder routes under `/content/web-builder`.
- Provides configurable CMS record tables with persisted column preferences.

## Architecture

| Area | Path | Responsibility |
| --- | --- | --- |
| Federation | `frontend/plugins/content_ui/module-federation.config.ts` | Exposes plugin configuration and the CMS entry point. |
| Routes | `frontend/plugins/content_ui/src/modules/cms/Main.tsx` | Mounts CMS and Web Builder routes. |
| CMS | `frontend/plugins/content_ui/src/modules/cms` | Owns CMS pages, GraphQL documents, state, and components. |
| Web Builder | `frontend/plugins/content_ui/src/modules/web-builder` | Owns visual website-building UI. |

## Contracts

### Provides

- Module Federation exposes `./config` and `./content`.
- Navigation configuration for the `content` plugin and `content/cms` module.

### Consumes

- Public `erxes-ui`, `ui-modules`, Apollo Client, Jotai, and React Router APIs.
- Content GraphQL operations exposed by the backend platform.

## Data and State

- Apollo Client owns server-backed CMS state; Jotai and local React state own
  shared and component-local UI state.
- Record-table column order, visibility, pinning, and sizing persist by stable
  table ID.

## Local Invariants

- Preserve `websiteId` in website-scoped routes, variables, and links.
- Keep CMS GraphQL documents and UI inside this plugin.
- Five-or-more-column `RecordTable` surfaces must expose a column selector and
  use a unique stable table ID.

## Validation

- `pnpm nx lint content_ui`
- `pnpm nx build content_ui`
- Open CMS categories, custom types, menus, pages, posts, and tags and verify
  column visibility and order persist after reload.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-03` — `Standardize CMS table column selectors`

- **Summary:** Added persisted column selectors to every CMS record table with at least five columns.
- **Affected areas:** `src/modules/cms/*/components`
- **Contracts changed:** `None`
