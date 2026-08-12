# `sales_ui` Plugin Guide

## Identity

- **Plugin:** `sales`
- **Project:** `sales_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/sales_ui`
- **Last synchronized:** `2026-08-12`

## Scope

### Owns

- Sales boards, pipelines, stages, deals, products, payments, and deal detail UI.

### Does not own

- Sales persistence or GraphQL resolvers; those live in `sales_api`.
- Core property definitions and shared UI primitives.

## Current Capabilities

- Runs as the sales Module Federation remote.
- Pipeline create/edit supports general settings, stages, product configuration,
  and grouped selection of Core `sales:deal` properties.
- Deal detail renders only the properties selected on the deal's pipeline.
  Legacy pipelines continue showing all deal properties until their selection
  is saved for the first time.

## Architecture

| Area            | Path                                                                  | Responsibility                                                |
| --------------- | --------------------------------------------------------------------- | ------------------------------------------------------------- |
| Registration    | `frontend/plugins/sales_ui/src/config.tsx`                            | Sales routes, navigation, and remote registration             |
| Pipeline editor | `frontend/plugins/sales_ui/src/modules/deals/pipelines`               | Pipeline form, stages, product config, and property selection |
| Deal detail     | `frontend/plugins/sales_ui/src/modules/deals/cards/components/detail` | Deal overview, properties, activity, and products             |
| GraphQL         | `frontend/plugins/sales_ui/src/modules/deals/graphql`                 | Sales client operations                                       |

## Contracts

### Provides

- Sales routes and Module Federation UI entries registered by `src/config.tsx`.

### Consumes

- `sales_api` GraphQL pipeline and deal contracts.
- Core properties through public `ui-modules` property hooks with
  `contentType: 'sales:deal'`.
- `erxes-ui` and `ui-modules` public components.

## Data and State

- Apollo Client owns pipeline/deal server state; React Hook Form owns pipeline
  editor state.
- `propertyIds` is submitted with pipeline create/edit and reloaded from
  `salesPipelineDetail`.

## Local Invariants

- Property choices must come only from Core `sales:deal` fields.
- Deal property detail must filter by the deal's `pipelineId` selection.
- Pipeline mutations must refresh or update Apollo state immediately.

## Validation

- `pnpm nx lint sales_ui`
- `pnpm nx build sales_ui`
- Open a pipeline editor, check properties from multiple groups, save, and
  verify a deal in that pipeline shows only those fields.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-12` — Pipeline-scoped deal properties

- **Summary:** Sales pipelines now choose grouped Core deal properties; legacy
  pipelines retain show-all behavior until first save, then deal detail renders
  only the chosen fields.
- **Affected areas:** `src/modules/deals/{pipelines,cards,graphql,types,schemas}`.
- **Contracts changed:** Pipeline GraphQL reads and mutations now include
  `propertyIds`.
