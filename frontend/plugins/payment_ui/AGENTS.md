# `payment_ui` Plugin Guide

## Identity

- **Plugin:** `payment`
- **Project:** `payment_ui`
- **Layer:** `Frontend UI`
- **Path:** `frontend/plugins/payment_ui`
- **Last synchronized:** `2026-10-28`

## Scope

### Owns

- Payment method (gateway) settings CRUD surface: list, add sheet, edit sheet, command bar.
- Per-kind payment configuration forms (QuickQR, Khanbank, and the generic field-driven kinds).
- Invoice list page, invoice filters, and invoice counts state.
- Corporate gateway surfaces for Khanbank, Golomt, and TDB (configs, accounts, transactions).
- The `invoices` relation widget contributed to other record detail views.

### Does not own

- Payment/invoice persistence, gateway calls, or callbacks — those live in `payment_api`.
- Translation files: `payment` namespace JSON lives in `backend/gateway/src/locales/*/payment.json`.

## Current Capabilities

- Create, edit, and remove payment methods with kind-specific Zod validation and toast feedback.
- Browse invoices with kind/status filters and total-count state.
- Edit an invoice's description, amount, and status either inline in the table cells or through
  the row's **more → Edit** sheet form; both surfaces require the `paymentInvoiceEdit` action and
  disappear/fall back to read-only without it.
- Manage corporate gateway configurations, accounts, and transactions per bank.
- Development Rspack serving ignores generated dependency/cache/output folders to keep local file watchers bounded.

## Architecture

| Area              | Path                                                    | Responsibility                                                 |
| ----------------- | ------------------------------------------------------- | -------------------------------------------------------------- |
| Federation config | `src/config.tsx`                                        | `IUIConfig`: `navigationGroup` (Payment app tab) + `invoices` relation widget |
| Dev server config | `rspack.config.ts`                                      | Module Federation development serving and watch ignore rules    |
| Pages             | `src/pages/payment`                                     | Invoices, payment settings, corporate gateway route entries    |
| Payment module    | `src/modules/payment`                                   | Payment/invoice GraphQL documents, hooks, types, Jotai state   |
| Invoice cells     | `src/modules/payment/components/InvoiceInlineCells.tsx` | Permission-aware inline editors for the invoice table          |
| Settings module   | `src/modules/settings/payment/components`               | Payment method table, sheets, and all configuration forms      |
| Corporate gateway | `src/modules/corporateGateway/<bank>`                   | Bank-specific configs, accounts, and transaction containers    |
| Widgets           | `src/widgets`                                           | Exposed widget entries, including the invoices relation widget |

## Contracts

### Provides

- Module Federation exposes: `./config`, `./payment`, `./widgets`, `./relationWidget`.
- Payment is an app (`./payment` → `src/modules/payment/Main.tsx`): `/payment/invoices`
  in its own `AppLayout` (`PaymentSidebar`, `PaymentSidebarFooter`), and its settings
  (payment methods, corporate gateway) at `/payment/settings/*` inside
  `PaymentSettingsLayout` and `PluginSettingsRoutes`.
- Relation widget named `invoices` declared in `CONFIG.widgets.relationWidgets`.
- Dev server port `3010`.

### Consumes

- `erxes-ui` primitives (`Form`, `Sheet`, `RecordTable`, `Combobox`, `Command`, …).
- `ui-modules`: `SettingsHeader`, `IRelationWidgetProps`, `usePermissionCheck`.
- Gateway GraphQL: `payments`, `paymentsTotalCount`, `invoices`, `qpayGetDistricts`,
  `paymentAdd`, `paymentEdit`, `paymentRemove`, `invoiceEdit`.
- Permission action `paymentInvoiceEdit`, declared by `payment_api`.
- `react-i18next` namespace `payment`.

## Data and State

- Server state through Apollo Client; payment mutations refetch/update the payment list so the
  record table never needs a manual refresh.
- Jotai atom in `src/modules/payment/states/invoiceCounts.ts` for invoice counts only.
- Forms use React Hook Form + Zod (`zodResolver`); the schema is selected by payment `kind`.

## Local Invariants

- The settings sidebar starts with a sticky core-style "Exit settings" row
  (`Sidebar.Header` + `Sidebar.MenuButton` `Link`, `sidebar.exit-settings`) to the
  app's main page; the title stays plain text and there is no footer Back link.
- Page header breadcrumbs follow the shared pattern: crumbs are default ghost `Button`s (no `font-semibold`), the first crumb carries a 16px icon in the default text color, crumbs are separated by `Separator.Inline` or `Breadcrumb.Separator`, and settings pages carry no favorite toggle.
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
- Every GraphQL operation name stays prefixed/unique for this plugin.
- Invoice inline editors must fall back to the read-only cell whenever
  `usePermissionCheck()` is still loading or `paymentInvoiceEdit` is missing — never render an
  empty cell while permissions load.
- `invoiceEdit` returns the edited `Invoice` with `_id`, so Apollo's normalized cache refreshes
  the row; do not add a refetch for it.
- The payment settings sheet closes only after the `paymentAdd` / `paymentEdit` mutation
  resolves. `PaymentForm`'s `onSubmit` is `async` and awaits the mutation, so a failure keeps
  the sheet open with the entered values and reports the error through a `destructive` toast.
  Never call `onCancel()` before the awaited mutation.
- Translation keys live outside this plugin (`backend/gateway/src/locales/*/payment.json`), so
  new UI text must reuse existing keys of the `payment` namespace.

## Validation

- `pnpm nx lint payment_ui`
- `pnpm nx build payment_ui`
- Smoke: Payment → Settings (`/payment/settings/methods`) → add/edit a payment method, save,
  and confirm the row updates without a page refresh.
