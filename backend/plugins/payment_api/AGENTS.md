# `payment_api` Plugin Guide

## Identity

- **Plugin:** `payment`
- **Project:** `payment_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/payment_api`
- **Last synchronized:** `2026-08-25`

## Scope

### Owns

- Payment methods, invoices, and transactions for every supported gateway
  (`src/apis/*`: qpay, qpayQuickqr, socialpay, storepay, monpay, pocket, toki,
  minupay, wechatpay, paypal, stripe, golomt, khanbank, tdb).
- Gateway callback handling and the paid-invoice fan-out (host plugin callback
  job, optional sales-deal job, QR ticket email).
- Ticket codes issued per paid invoice, plus their scan/redeem state.
- The embeddable payment widget served from `/pl:payment/widget/`.

### Does not own

- Email transport, provider credentials, or delivery logging — those live in
  `core` and are reached through the `notifications.sendEmail` tRPC mutation.
- Sales deals, tickets, or any other plugin's records; those are only asked for
  through worker queues.

## Current Capabilities

- Serves gateway callbacks at `GET|POST /callback/<kind>` for all
  `PAYMENTS.ALL` kinds.
- Marks invoices paid from either a gateway callback or the
  `paymentInvoiceCheck`/manual-paid GraphQL mutations, then runs one shared
  fan-out through `enqueuePaidInvoiceCallback`.
- Issues one random ticket code per unit of `invoice.data.quantity`, renders
  them into a QR PDF, and emails it once per invoice.
- Redeems ticket codes with per-code scan state and can atomically reject a
  code whose invoice does not match the scanner's expected event slug.
- Optionally enqueues a sales deal for the paid invoice when the payment
  method's `dealConfig.enabled` is set.
- Declares the plugin permission config (`invoice` module with
  `paymentInvoiceView` / `paymentInvoiceEdit`, plus the `payment:admin` and
  `payment:viewer` default groups) and enforces `paymentInvoiceEdit` on the
  `invoiceEdit` mutation.
- The read-only tRPC procedure `payment.getInvoiceWithTransactions` is exposed
  to AI agents through `/agent-tools/manifest` and `/agent-tools/call` via
  `.meta(agentMeta(...))`; every other procedure (invoice/transaction writes,
  gateway status checks, and the raw `invoices.find`) remains invisible.

## Architecture

| Area             | Path                                                  | Responsibility                                                       |
| ---------------- | ----------------------------------------------------- | -------------------------------------------------------------------- |
| Bootstrap        | `src/main.ts`                                         | `startPlugin({ name: 'payment', port: 3310 })`, widget static host   |
| Gateway adapters | `src/apis/`                                           | Per-provider invoice creation, status checks, callback parsing       |
| Callback handler | `src/apis/controller.ts`                              | Verifies gateway callbacks, marks paid, calls the paid fan-out       |
| Paid fan-out     | `src/modules/payment/services/paidInvoiceCallback.ts` | Resolves the payment method, enqueues jobs, `sendPaidInvoiceQrEmail` |
| QR ticket email  | `src/modules/payment/services/invoiceQrEmail.ts`      | Claims `qrEmailSentAt`, generates ticket codes, sends the PDF email  |
| Ticket PDF       | `src/modules/payment/services/ticketsPdf.ts`          | Renders the QR ticket PDF buffer                                     |
| Data model       | `src/modules/payment/db/`                             | `Invoices`, `Transactions`, `PaymentMethods` schemas and models      |
| GraphQL          | `src/modules/payment/graphql/`, `src/apollo/`         | `payment*` queries, mutations, custom resolvers, subscriptions       |
| tRPC             | `src/trpc/`                                           | Service-to-service payment/invoice procedures; agent tool metadata in `src/trpc/agentMeta.ts`                  |
| Workers          | `src/workers/payments.ts`                             | BullMQ consumer for this plugin's `payments` queue                   |
| Permissions      | `src/meta/permissions.ts`                             | `invoice` permission module, actions, and default permission groups  |

## Contracts

### Provides

- HTTP: `GET|POST /pl:payment/callback/<kind>`, widget assets under
  `/pl:payment/widget/`.
- Agent-callable tRPC tool (admit-only via `.meta({ agent })`):
  `payment.getInvoiceWithTransactions` — `paymentInvoiceView`.
- GraphQL: `payment*` queries/mutations/subscriptions (invoices, payments,
  ticket redemption), including
  `invoiceEdit(_id: String!, input: InvoiceEditInput!)` for admin invoice
  corrections (`description`, `amount`, `currency`, `status`) and
  `invoiceScanBarcode(code: String!, eventSlug: String)` for optional
  event-scoped ticket redemption.
- Permission actions `paymentInvoiceView` / `paymentInvoiceEdit` and the
  default groups `payment:admin` and `payment:viewer`, published through
  `startPlugin({ meta: { permissions } })`.
- Worker jobs it emits: `callback` on `<contentType plugin>:payments`, and
  `createDealFromPayment` on `sales:payments` when `dealConfig.enabled`.

### Consumes

- `sendTRPCMessage` → `core` `notifications.sendEmail` for the QR ticket email.
- `sendWorkerQueue` from `erxes-api-shared/utils` for the paid-invoice jobs.
- `splitType` from `erxes-api-shared/core-modules` to route callbacks to the
  invoice's owning plugin.

## Data and State

- Tenant-scoped collections via `generateModels(subdomain)`: invoices,
  transactions, payment methods.
- Invoice ticket fields (`src/modules/payment/db/definitions/invoices.ts`):
  `ticketCodes: [{ code, scannedAt }]`, `qrEmailSentAt`, legacy `scannedAt`.
- `qrEmailSentAt` is the idempotency key for the QR email; ticket codes are
  written in the same atomic claim.

## Local Invariants

- The QR email is claimed with a single
  `findOneAndUpdate({ _id, qrEmailSentAt: null }, { $set: { qrEmailSentAt, ticketCodes } })`.
  The claim is released (`$unset qrEmailSentAt`) only when sending throws, so a
  later paid-check can retry.
- Email attachments must be passed as base64 `content`, never as a `data:` URI
  in `path`. The core SendGrid provider downloads `path` attachments with
  `node-fetch@2`, which rejects non-HTTP protocols; SMTP/SES tolerate data URIs,
  so a data URI silently works locally and fails on SendGrid/SaaS deployments.
- `sendTRPCMessage` swallows transport errors (returns `defaultValue`) and core
  `sendEmail` catches per-recipient send errors, so a `Sent QR email` log line
  from this plugin does **not** prove delivery. Confirm in core-api logs
  (`Email sent successfully:` / `Error sending email:`) or the
  `email_deliveries` collection.
- Ticket codes are unguessable random tokens; never fall back to a predictable
  identifier for newly issued tickets.
- When `invoiceScanBarcode` receives an `eventSlug`, the invoice's
  `data.eventSlug` must match before any per-ticket or legacy scan timestamp is
  written; a mismatch must leave the ticket unused.
- Every callback, resolver, and worker path must keep operating on the request
  `subdomain`'s models.
- `invoiceEdit` moving `status` into `paid` stamps `resolvedAt`, publishes
  `invoiceUpdated:<id>`, and sends the QR ticket email through the shared
  `sendPaidInvoiceQrEmail` helper (so `sendEmailOnPayment`, the missing-email
  skip, and the `qrEmailSentAt` claim all behave exactly as on a gateway
  callback). It deliberately does **not** enqueue the host-plugin callback or
  the sales-deal job — those stay on the callback/`invoicesCheck` path.
- Because this plugin now declares permissions, core lists `payment` in
  `pluginsWithPermissions`. Non-owner users need `payment:admin`,
  `payment:viewer`, or an equivalent custom group to see payment surfaces at all.
- Agent tool annotations are admit-only: never annotate `addInvoice`,
  `addTransaction`, `checkInvoice` (it can flip an invoice to paid and trigger
  the paid fan-out), or the raw unbounded `invoices.find` (its result shape is
  depended on by membership resolvers in other plugins). New procedures are
  agent-invisible unless explicitly annotated.

## Validation

- `pnpm nx lint payment_api`
- `pnpm nx build payment_api`
- Smoke: pay a test invoice that has `email` and `data.quantity`, confirm one
  QR PDF email arrives, then re-run `paymentInvoiceCheck` and confirm the
  `Skipped invoice …: QR email already sent` log instead of a second email.
- Smoke: call `invoiceEdit` as a user in `payment:admin` (succeeds) and as a
  user in `payment:viewer` (fails with `Permission required`).
- Smoke: edit a pending invoice that has `email` to `status: paid` and confirm
  one QR ticket email is sent; repeat on an already-paid invoice and confirm the
  `QR email already sent` skip log instead of a second email.
- Smoke: scan a paid ticket with its matching `eventSlug` (succeeds), then scan
  an unused ticket with a different `eventSlug` and confirm it is rejected and
  remains unused.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-25` — Agent-callable invoice read

- **Summary:** The typed read `payment.getInvoiceWithTransactions` is now
  exposed to AI agents through the platform agent-tools manifest, gated by
  `paymentInvoiceView`; all mutating and raw procedures stay hidden.
- **Affected areas:** `src/trpc/agentMeta.ts` (new local helper mirroring
  core-api), `src/trpc/init-trpc.ts`.
- **Contracts changed:** New agent-tool manifest entry
  `payment.getInvoiceWithTransactions`. No existing GraphQL or tRPC behavior
  changed.

### `2026-08-12` — `Event-scoped ticket redemption`

- **Summary:** Added an optional expected event slug to barcode redemption so
  scanners can reject a ticket for another event without consuming its code.
- **Affected areas:** `src/modules/payment/db/models/Invoices.ts`,
  `src/modules/payment/graphql/schemas/invoices.ts`,
  `src/modules/payment/graphql/resolvers/mutations/invoices.ts`
- **Contracts changed:** `invoiceScanBarcode` now accepts optional
  `eventSlug: String`.

### `2026-08-10` — `Invoice edit permission and mutation`

- **Summary:** Added the plugin permission config with a `payment:admin`
  default group and an `invoiceEdit` mutation that validates and updates an
  invoice's description, amount, currency, and status behind
  `checkPermission('paymentInvoiceEdit')`; editing the status into `paid` sends
  the QR ticket email through the extracted `sendPaidInvoiceQrEmail` helper.
- **Affected areas:** `src/meta/permissions.ts`, `src/main.ts`,
  `src/modules/payment/graphql/schemas/invoices.ts`,
  `src/modules/payment/graphql/resolvers/mutations/invoices.ts`,
  `src/modules/payment/@types/invoices.ts`,
  `src/modules/payment/services/paidInvoiceCallback.ts`
- **Contracts changed:** Added mutation `invoiceEdit` and input
  `InvoiceEditInput`; published permission actions `paymentInvoiceView` /
  `paymentInvoiceEdit` and default groups `payment:admin` / `payment:viewer`.

### `2026-08-06` — `Fix QR ticket email attachment on SendGrid deployments`

- **Summary:** The ticket PDF is now attached as base64 `content` instead of a
  `data:` URI in `path`, which failed on SendGrid/SaaS while working locally on
  SMTP/SES.
- **Affected areas:** `src/modules/payment/services/invoiceQrEmail.ts`
- **Contracts changed:** `None`
