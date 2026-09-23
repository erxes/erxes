# `loyalty_ui` Plugin Guide

## Identity

- **Plugin:** `loyalty`
- **Project:** `loyalty_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/loyalty_ui`
- **Last synchronized:** `2026-09-22`

## Scope

### Owns

- Loyalty and pricing frontend routes, forms, list views, settings, GraphQL
  documents, and Module Federation UI surfaces.

### Does not own

- Backend loyalty calculation contracts, pricing engine behavior, sales pipeline
  data ownership, shared UI libraries, or other plugin UIs.

## Current Capabilities

- Renders pricing list/detail/create/edit UI under `src/modules/pricing` and
  `src/pages/pricing`.
- Pricing detail forms edit general targeting, options, participants, price,
  quantity, repeat, expiry, and rules sections.
- Pricing general edit forms allow selected start and end dates to be cleared.
- Pricing priority selection includes none, public, POS base, and scoped base pricing; POS-base and scoped-base plans hide participant targeting.
- Options detail supports branch, department, board, and pipeline selection.
- Board and pipeline selectors can clear an existing selection; clearing a board
  also clears the dependent pipeline in the options and stage forms.
- Customer and broker targeting render through
  `edit-pricing/components/options/CustomerBrokerConditions.tsx` and round-trip
  through pricing form values.

## Architecture

| Area                 | Path                                                                                          | Responsibility                                      |
| -------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Pricing entry points | `src/modules/pricing/Main.tsx`, `src/pages/pricing`                                           | Pricing route and list/detail composition.          |
| Pricing create form  | `src/modules/pricing/create-pricing/**`                                                       | New pricing plan form and submission mapping.       |
| Pricing edit forms   | `src/modules/pricing/edit-pricing/**`                                                         | Sectioned pricing detail editing UI.                |
| Pricing selectors    | `src/modules/pricing/hooks/useSelectBoard.tsx`, `useSelectPipeline.tsx`, `useSelectStage.tsx` | Sales board, pipeline, and stage comboboxes.        |
| Pricing data hooks   | `src/modules/pricing/hooks/**`                                                                | Apollo query/mutation wrappers for pricing screens. |
| Pricing contracts    | `src/modules/pricing/graphql/**`, `src/modules/pricing/types.ts`                              | GraphQL documents and TypeScript form/API types.    |

## Contracts

### Provides

- Module Federation frontend routes and components configured by this plugin's
  exposed pricing and loyalty UI modules.
- Pricing GraphQL operations including `PricingPlanDetail` and pricing
  create/edit mutations.

### Consumes

- Public components and hooks from `erxes-ui` and `ui-modules`.
- Sales board, pipeline, and stage GraphQL queries exposed through platform
  contracts.
- Loyalty pricing API contracts provided by `backend/plugins/loyalty_api`.

## Data and State

- Uses Apollo Client for pricing plan and sales board/pipeline/stage server
  data.
- Uses React Hook Form local form state in pricing create/edit forms.
- Keeps board, pipeline, and stage selector state local to the owning pricing
  form or detail section.

## Local Invariants

- Pricing UI changes stay inside `frontend/plugins/loyalty_ui`.
- Pricing form save mappings must preserve empty optional selectors as no
  constraint (`null`, `undefined`, or an empty form value as expected by the
  existing mutation path).
- Clearing a pricing start or end date must set its enabled flag to `false` so the backend removes the persisted date.
- Scoped-base priority is handled like POS-base in the edit flow: participant targeting is hidden and the active tab falls back to General if needed.
- Board changes must clear dependent pipeline and stage selections where those
  fields are present.
- Pipeline changes must clear dependent stage selections where those fields are
  present.
- Reuse `erxes-ui` and `ui-modules`; do not import Radix primitives directly.

## Validation

- `pnpm nx build loyalty_ui`
- Pricing detail smoke scenario: open a pricing plan, go to Options, choose a
  board and pipeline, reopen each selector, choose `none`, save, and confirm the
  saved plan no longer has those board/pipeline constraints.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-09-22` — `Scoped base pricing controls`

- **Summary:** Pricing forms expose scoped base pricing, hide participant targeting for those plans, and let users clear optional start and end dates.
- **Affected areas:** Pricing priority types and selectors, edit navigation, general date fields, and save mappings.
- **Contracts changed:** Pricing priority form values include `pipelineBase`.

### `2026-09-13` — Clearable pricing board and pipeline selectors

- **Summary:** Pricing detail board and pipeline comboboxes now include an empty
  `none` selection so users can remove an existing board or pipeline constraint.
- **Affected areas:** `src/modules/pricing/hooks/useSelectBoard.tsx`,
  `src/modules/pricing/hooks/useSelectPipeline.tsx`, pricing Options/Stage
  selector behavior.
- **Contracts changed:** None.

### `2026-09-09` — Bound dev watchers

- **Summary:** Loyalty UI Rspack development serving ignores generated
  dependency, cache, coverage, temp, and output folders to reduce local watcher
  pressure.
- **Affected areas:** `rspack.config.ts`.
- **Contracts changed:** None.
