# `payment_api` Plugin Guide

## Identity

- **Plugin:** `payment`
- **Project:** `payment_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/payment_api`
- **Last synchronized:** `2026-10-28`

## Scope

### Owns

- Payment methods, invoices, and transactions for every supported gateway
  (`src/apis/*`: qpay, qpayQuickqr, socialpay, storepay, monpay, pocket, toki,
  minupay, wechatpay, paypal, stripe, golomt, khanbank, tdb).
- Gateway callback handling and the paid-invoice fan-out (host plugin callback
  job).
- The embeddable payment widget served from `/pl:payment/widget/`.
  Its `package.json` declares `graphql-ws@^6` because `createClient` feeds
  `@apollo/client`'s `GraphQLWsLink`, whose types resolve against the
  graphql-ws version pnpm picks for the peer; an undeclared import resolved
  to v5 and broke the widget build when v6 entered the workspace.

### Does not own

- Email transport, provider credentials, or delivery logging — those live in
  `core` and are reached through the `notifications.sendEmail` tRPC mutation.
- Sales deals, tickets, or any other plugin's records; those are only asked for
  through worker queues.

## Current Capabilities

- Serves gateway callbacks at `GET|POST /callback/<kind>` for all
  `PAYMENTS.ALL` kinds.
- Marks invoices paid from either a gateway callback or the
  `invoicesCheck`/`cpInvoicesCheck` GraphQL mutations; each of those sites
  enqueues the host-plugin `callback` job inline.
- Declares the plugin permission config (`invoice` module with
  `paymentInvoiceView` / `paymentInvoiceEdit`, plus the `payment:admin` and
  `payment:viewer` default groups) and enforces `paymentInvoiceEdit` on the
  `invoiceEdit` mutation.
- The widget renders Pocket payments with a dedicated `PocketForm` that shows
  the QR and, on mobile, a "Pocket апп-аар төлөх" button linking to the
  `deeplink` returned by Pocket's `createInvoice`, which opens the Pocket app.

## Architecture

| Area             | Path                                                  | Responsibility                                                       |
| ---------------- | ----------------------------------------------------- | -------------------------------------------------------------------- |
| Bootstrap        | `src/main.ts`                                         | `startPlugin({ name: 'payment', port: 3310 })`, widget static host   |
| Gateway adapters | `src/apis/`                                           | Per-provider invoice creation, status checks, callback parsing       |
| Callback handler | `src/apis/controller.ts`                              | Verifies gateway callbacks, marks paid, enqueues the host callback job |
| Data model       | `src/modules/payment/db/`                             | `Invoices`, `Transactions`, `PaymentMethods` schemas and models      |
| GraphQL          | `src/modules/payment/graphql/`, `src/apollo/`         | `payment*` queries, mutations, custom resolvers, subscriptions       |
| tRPC             | `src/trpc/`                                           | Service-to-service payment/invoice procedures                        |
| Workers          | `src/workers/payments.ts`                             | BullMQ consumer for this plugin's `payments` queue                   |
| Permissions      | `src/meta/permissions.ts`                             | `invoice` permission module, actions, and default permission groups  |
| Widget Pocket UI | `src/widget/src/components/payments/PocketForm.tsx`   | Pocket QR plus mobile-only deeplink button; chosen in `PaymentDialog` |
## Contracts

### Provides

- HTTP: `GET|POST /pl:payment/callback/<kind>`, widget assets under
  `/pl:payment/widget/`.
- GraphQL: `payment*` queries/mutations/subscriptions (invoices, payments),
  including `invoiceEdit(_id: String!, input: InvoiceEditInput!)` for admin
  invoice corrections (`description`, `amount`, `currency`, `status`).
- Permission actions `paymentInvoiceView` / `paymentInvoiceEdit` and the
  default groups `payment:admin` and `payment:viewer`, published through
  `startPlugin({ meta: { permissions } })`.
- Worker jobs it emits: `callback` on `<contentType plugin>:payments`.

### Consumes

- `sendWorkerQueue` from `erxes-api-shared/utils` for the paid-invoice jobs.
- `splitType` from `erxes-api-shared/core-modules` to route callbacks to the
  invoice's owning plugin.

## Data and State

- Tenant-scoped collections via `generateModels(subdomain)`: invoices,
  transactions, payment methods.

## Local Invariants

- The plugin sends no email of its own; paid-invoice notifications are the
  owning plugin's job via the `callback` worker job.
- Every callback, resolver, and worker path must keep operating on the request
  `subdomain`'s models.
- `invoiceEdit` moving `status` into `paid` stamps `resolvedAt` and publishes
  `invoiceUpdated:<id>`. It deliberately does **not** enqueue the host-plugin
  callback; that stays on the callback/`invoicesCheck` path.
- The host `callback` job is written inline at every paid site
  (`controller.ts`, `invoicesCheck`, `cpInvoicesCheck`); keep them identical
  when changing one.
- Because this plugin now declares permissions, core lists `payment` in
  `pluginsWithPermissions`. Non-owner users need `payment:admin`,
  `payment:viewer`, or an equivalent custom group to see payment surfaces at all.
- In the widget, `kind === 'pocket'` must render `PocketForm`, not the shared
  `QrPayment`: `QrPayment`'s mobile branch shows bank-app `urls`, which Pocket
  does not return, so Pocket users on mobile would see neither a QR nor a way to
  open the app. The deeplink button is shown only when `useIsMobile()` is true
  and `response.deeplink` exists; the QR is always shown as a fallback.
## Validation

- `pnpm nx run payment_api:schema:print` - prints this subgraph's SDL to `generated/schema.graphql` (gitignored) offline, for `gateway:schema:compose`.
- `pnpm nx lint payment_api`
- `pnpm nx build payment_api`
- Smoke: pay a test invoice with a `contentType`, confirm the owning plugin's
  `payments` queue receives one `callback` job with `status: paid`.
- Smoke: call `invoiceEdit` as a user in `payment:admin` (succeeds) and as a
  user in `payment:viewer` (fails with `Permission required`).
- Smoke: edit a pending invoice to `status: paid` and confirm `resolvedAt` is
  set and the `invoiceUpdated` subscription fires.
- Smoke: open a Pocket invoice in the widget on desktop (QR shown, no button),
  then on a phone with Pocket installed (QR plus button; tapping it opens
  Pocket with the correct merchant and amount).