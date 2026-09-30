# `loyalty_ui` Plugin Guide

## Identity

- **Plugin:** `loyalty`
- **Project:** `loyalty_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/loyalty_ui`
- **Last synchronized:** `2026-09-30`

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
- Pricing list loads filtered plans in 20-record pages as users scroll and
  shows the full filtered record count from the API.

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
- `PricingPlans` queries request `pricingPlansCount` with the same filters as
  the list and page through `page`/`perPage`.

### Consumes

- Public components and hooks from `erxes-ui` and `ui-modules`.
- Sales board, pipeline, and stage GraphQL queries exposed through platform
  contracts.
- Loyalty pricing API contracts provided by `backend/plugins/loyalty_api`.

## Data and State

- Uses Apollo Client for pricing plan and sales board/pipeline/stage server
  data.
- Pricing list pagination appends distinct 20-record `pricingPlans` pages
  through Apollo `fetchMore` and pauses scroll fetching while a request is in
  flight.
- Uses React Hook Form local form state in pricing create/edit forms.
- Keeps board, pipeline, and stage selector state local to the owning pricing
  form or detail section.

## Local Invariants

- Page-level side menus render `Sidebar.Panel` from `erxes-ui`, which keeps its
  own open state (`sidebarPanelOpenState`), separate from the host's context
  column. Never stack two headings: a menu without a heading passes one as
  `label` (header row with the heading, optional `actions` and the collapse
  toggle); a menu that starts with its own heading row (group label, collapsible
  or accordion trigger) omits `label` and ends that row with
  `Sidebar.PanelTrigger`. Keep `<Sidebar collapsible="none">` for sidebars
  inside sheets and dialogs.
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

### `2026-09-29` — Pricing list pagination

- **Summary:** Pricing settings load distinct 20-record pricing plan pages on scroll and display the API-backed filtered total count.
- **Affected areas:** `src/modules/pricing/graphql/queries.ts`, `src/modules/pricing/hooks/usePricing.ts`, `src/modules/pricing/components/PricingRecordTable.tsx`.
- **Contracts changed:** `PricingPlans` now also requests `pricingPlansCount` and sends `page`/`perPage` variables.

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
