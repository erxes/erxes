# `payment_ui` Plugin Guide

## Identity

- **Plugin:** `payment`
- **Project:** `payment_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/payment_ui`
- **Last synchronized:** `2026-08-03`

## Scope

### Owns

- Payment method (gateway) settings CRUD surface: list, add sheet, edit sheet, command bar.
- Per-kind payment configuration forms (QuickQR, Khanbank, and the generic field-driven kinds).
- The "create deal on payment" configuration UI on a payment method.
- Invoice list page, invoice filters, barcode-scan flow, and invoice counts state.
- Corporate gateway surfaces for Khanbank, Golomt, and TDB (configs, accounts, transactions).
- The `invoices` relation widget contributed to other record detail views.

### Does not own

- Payment/invoice persistence, gateway calls, callbacks, or deal creation — those live in `payment_api`.
- Sales boards, pipelines, and stages — consumed through `ui-modules` selectors, never re-implemented.
- Translation files: `payment` namespace JSON lives in `backend/gateway/src/locales/*/payment.json`.

## Current Capabilities

- Create, edit, and remove payment methods with kind-specific Zod validation and toast feedback.
- Configure a payment method to auto-create a sales deal (`dealEnabled` + board/pipeline/stage).
- Browse invoices with kind/status filters, live scan subscription, and total-count state.
- Manage corporate gateway configurations, accounts, and transactions per bank.

## Architecture

| Area                | Path                                       | Responsibility                                                     |
| ------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| Federation config   | `src/config.tsx`                           | `IUIConfig`: settings navigation + `invoices` relation widget       |
| Pages               | `src/pages/payment`                        | Invoices, payment settings, corporate gateway route entries         |
| Payment module      | `src/modules/payment`                      | Payment/invoice GraphQL documents, hooks, types, Jotai state        |
| Settings module     | `src/modules/settings/payment/components`  | Payment method table, sheets, and all configuration forms           |
| Corporate gateway   | `src/modules/corporateGateway/<bank>`      | Bank-specific configs, accounts, and transaction containers         |
| Widgets             | `src/widgets`                              | Exposed widget entries, including the invoices relation widget      |

## Contracts

### Provides

- Module Federation exposes: `./config`, `./paymentSettings`, `./widgets`, `./relationWidget`.
- Relation widget named `invoices` declared in `CONFIG.widgets.relationWidgets`.
- Dev server port `3010`.

### Consumes

- `erxes-ui` primitives (`Form`, `Switch`, `Sheet`, `RecordTable`, `Combobox`, `Command`, …).
- `ui-modules`: `SettingsHeader`, `IRelationWidgetProps`, and the sales selectors
  `SelectBoard` / `SelectPipeline` / `SelectStage`.
- Gateway GraphQL: `payments`, `paymentsTotalCount`, `invoices`, `qpayGetDistricts`,
  `paymentAdd`, `paymentEdit`, `paymentRemove`, `invoiceScanBarcode`, `invoiceScanned`.
- `react-i18next` namespace `payment`.

## Data and State

- Server state through Apollo Client; payment mutations refetch/update the payment list so the
  record table never needs a manual refresh.
- Jotai atom in `src/modules/payment/states/invoiceCounts.ts` for invoice counts only.
- Forms use React Hook Form + Zod (`zodResolver`); the schema is selected by payment `kind`.

## Local Invariants

- Sales board/pipeline/stage pickers must come from `ui-modules`. Do not add payment-local
  GraphQL documents for `salesBoards` / `salesPipelines` / `salesStages`.
- **Never deep-import a context-bearing component from `erxes-ui`.** `module-federation.config.ts`
  shares the exact specifier `'erxes-ui'` only; `'erxes-ui/components/form'` fails that check and
  gets bundled as a second copy with its own `FormFieldContext` and `react-hook-form`. Mixing the
  two copies makes `useFormContext()` return `null` and crashes `useFormField` with
  `Cannot read properties of null (reading 'getFieldState')`. Always
  `import { Form } from 'erxes-ui'`.
- Because `Form` is shared, sub-forms must not receive it as a prop. They take only
  `form: UseFormReturn<FieldValues>` and import `Form` themselves.
- Deal config field names are fixed: `dealEnabled`, `dealBoardId`, `dealPipelineId`,
  `dealStageId`. Turning `dealEnabled` off clears the three ids.
- Changing the board clears pipeline and stage; changing the pipeline clears stage.
- Every GraphQL operation name stays prefixed/unique for this plugin.

## Validation

- `pnpm nx lint payment_ui`
- `pnpm nx build payment_ui`
- Smoke: Settings → Payments → add/edit a payment method, toggle **Create deal on payment**,
  pick board → pipeline → stage, save, and confirm the row updates without a page refresh.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-03` — Single shared `Form` instance across payment settings forms

- **Summary:** Replaced the `erxes-ui/components/form` deep import (which produced a second,
  unshared copy of the form context) with `import { Form } from 'erxes-ui'`, and removed the
  `Form` prop from `QuickQrForm` and `KhanbankForm`, fixing the `getFieldState` of `null` crash
  in the payment settings sheet.
- **Affected areas:** `src/modules/settings/payment/components/PaymentForm.tsx`,
  `QuickQrForm.tsx`, `KhanbankForm.tsx`.
- **Contracts changed:** `None`

### `2026-08-03` — Deal config form uses shared sales selectors

- **Summary:** `DealConfigForm` now renders `SelectBoard`/`SelectPipeline`/`SelectStage` from
  `ui-modules`, imports `Form` from `erxes-ui` instead of receiving it as a prop, and adds
  `Form.Message` validation feedback.
- **Affected areas:** `src/modules/settings/payment/components/DealConfigForm.tsx`,
  `src/modules/settings/payment/components/PaymentForm.tsx`; removed
  `src/modules/settings/payment/graphql/salesDeal.ts` and its hand-rolled combobox.
- **Contracts changed:** `None` (dropped the plugin-local `PaymentSalesBoards`,
  `PaymentSalesPipelines`, and `PaymentSalesStages` queries in favour of the shared selectors).
