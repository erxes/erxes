# `sales_ui` Plugin Guide

## Identity

- **Plugin:** `sales`
- **Project:** `sales_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/sales_ui`
- **Last synchronized:** `2026-08-12`

## Scope

### Owns

- Deal board/list UI, deal details, pipeline settings, stage forms, product/payment configuration, POS pages, and sales widgets.

### Does not own

- Backend persistence, authentication, tenant isolation, shared UI primitives, or another plugin's source.

## Current Capabilities

- Manages deals, boards, pipelines, stages, payment configuration, and POS surfaces.
- Accepts Unicode letters in custom payment type identifiers.
- Rejects duplicate non-empty stage codes within a pipeline before submission.

## Architecture

| Area | Path | Responsibility |
| --- | --- | --- |
| Registration | `frontend/plugins/sales_ui/src/config.tsx` | Registers routes, navigation, widgets, and search |
| Deals | `frontend/plugins/sales_ui/src/modules/deals` | Owns deal and pipeline UI |
| Validation | `frontend/plugins/sales_ui/src/modules/deals/schemas/pipelineFormSchema.ts` | Validates pipeline, stage, and payment values |
| Payments | `frontend/plugins/sales_ui/src/modules/payments` | Edits platform and custom payment configuration |
| POS | `frontend/plugins/sales_ui/src/modules/pos` | Owns POS UI |

## Contracts

### Provides

- Module Federation sales, settings, POS, automation, relation, and notification surfaces.

### Consumes

- Public `erxes-ui`, `ui-modules`, Apollo GraphQL, React Router, Jotai, React Hook Form, and Zod APIs.

## Data and State

- Apollo owns remote state; URL, Jotai, and local storage hold navigable and local UI state.
- Pipeline forms hold stages, product settings, `paymentIds`, and `paymentTypes`.

## Local Invariants

- Duplicate stage code errors activate the stages tab, expand the affected stage, and point to its code field.
- Custom payment types start with a Unicode letter and contain only letters, numbers, `_`, or `-`.
- Pipeline mutations refresh Apollo-visible data without manual reload.

## Validation

- `pnpm nx build sales_ui`
- No `lint` or `test` target is defined in `frontend/plugins/sales_ui/project.json`.
- Smoke: duplicate two stage codes and confirm the affected stage expands; save `БанкныКарт` as a payment type.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-12` — Validate pipeline identifiers

- **Summary:** Payment types accept Unicode letters, and duplicate stage codes expand the affected stage before submission.
- **Affected areas:** `src/modules/deals/{schemas/pipelineFormSchema.ts,boards/hooks/usePipelineForm.tsx,pipelines/components/PipelineStageItem.tsx}`
- **Contracts changed:** Mutation shapes are unchanged; payment type values and stage-code validation behavior changed.
