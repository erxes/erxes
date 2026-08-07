# `payment_api` Plugin Guide

## Identity

- **Plugin:** `payment`
- **Project:** `payment_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/payment_api`
- **Last synchronized:** `2026-08-06`

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
- Redeems ticket codes with per-code scan state.
- Optionally enqueues a sales deal for the paid invoice when the payment
  method's `dealConfig.enabled` is set.

## Architecture

| Area             | Path                                                  | Responsibility                                                      |
| ---------------- | ----------------------------------------------------- | ------------------------------------------------------------------- |
| Bootstrap        | `src/main.ts`                                         | `startPlugin({ name: 'payment', port: 3310 })`, widget static host  |
| Gateway adapters | `src/apis/`                                           | Per-provider invoice creation, status checks, callback parsing      |
| Callback handler | `src/apis/controller.ts`                              | Verifies gateway callbacks, marks paid, calls the paid fan-out      |
| Paid fan-out     | `src/modules/payment/services/paidInvoiceCallback.ts` | Resolves the payment method, enqueues jobs, triggers the QR email   |
| QR ticket email  | `src/modules/payment/services/invoiceQrEmail.ts`      | Claims `qrEmailSentAt`, generates ticket codes, sends the PDF email |
| Ticket PDF       | `src/modules/payment/services/ticketsPdf.ts`          | Renders the QR ticket PDF buffer                                    |
| Data model       | `src/modules/payment/db/`                             | `Invoices`, `Transactions`, `PaymentMethods` schemas and models     |
| GraphQL          | `src/modules/payment/graphql/`, `src/apollo/`         | `payment*` queries, mutations, custom resolvers, subscriptions      |
| tRPC             | `src/trpc/`                                           | Service-to-service payment/invoice procedures                       |
| Workers          | `src/workers/payments.ts`                             | BullMQ consumer for this plugin's `payments` queue                  |

## Contracts

### Provides

- HTTP: `GET|POST /pl:payment/callback/<kind>`, widget assets under
  `/pl:payment/widget/`.
- GraphQL: `payment*` queries/mutations/subscriptions (invoices, payments,
  ticket redemption).
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
- Every callback, resolver, and worker path must keep operating on the request
  `subdomain`'s models.

## Validation

- `pnpm nx lint payment_api`
- `pnpm nx build payment_api`
- Smoke: pay a test invoice that has `email` and `data.quantity`, confirm one
  QR PDF email arrives, then re-run `paymentInvoiceCheck` and confirm the
  `Skipped invoice …: QR email already sent` log instead of a second email.

## Recent Changes

<!-- Newest first. Keep at most 10 entries. -->

### `2026-08-06` — `Fix QR ticket email attachment on SendGrid deployments`

- **Summary:** The ticket PDF is now attached as base64 `content` instead of a
  `data:` URI in `path`, which failed on SendGrid/SaaS while working locally on
  SMTP/SES.
- **Affected areas:** `src/modules/payment/services/invoiceQrEmail.ts`
- **Contracts changed:** `None`
