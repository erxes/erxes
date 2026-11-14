# `payment_api` Plugin Guide

## Identity

- **Plugin:** `payment`
- **Project:** `payment_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/payment_api`
- **Last synchronized:** `2026-11-12`
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
- Filters `invoices` / `cpInvoices` / `invoicesTotalCount` by `kind` with an indexed match on the
  invoice's `paymentKinds` field (`buildKindQuery` in `graphql/resolvers/queries/invoices.ts`).
- Keeps `Invoice.paymentKinds` (distinct `paymentKind` of the invoice's own transactions) in sync
  through `services/invoicePaymentKinds.ts`, and backfills invoices missing the field in batches
  from the invoice re-check worker, at most hourly per org and only for orgs taking payments.
- Re-checks invoices whose provider callback may be lost: `Transactions.createTransaction` queues
  a delayed `payment-invoice-recheck` job for its invoice (`services/invoiceRecheckQueue.ts`,
  2m → 8h, ~16h total, job id deduped by invoice and attempt). `workers/invoiceRecheck.ts` checks
  the invoice with its provider (`checkInvoiceAndClaim`), sends the paid notification
  (`notifyPaidInvoice`), and queues the next check while it is pending or its notification fails.
  There is no per-org scan and nothing runs at startup; on SaaS a job that walks every org builds
  every tenant's models and runs the plugin out of memory.
- Declares the plugin permission config (`invoice` module with
  `paymentInvoiceView` / `paymentInvoiceEdit`, plus the `payment:admin` and
  `payment:viewer` default groups) and enforces `paymentInvoiceEdit` on the
  `invoiceEdit` mutation.
- The widget renders Pocket payments with a dedicated `PocketForm`. On phones
  it opens the Pocket app automatically through the `deeplink` returned by
  Pocket's `createInvoice`; desktops and tablets get the QR only.

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
| Invoice re-check | `src/workers/invoiceRecheck.ts`                       | Per-invoice delayed provider re-checks and paid-notification retries |
| Permissions      | `src/meta/permissions.ts`                             | `invoice` permission module, actions, and default permission groups  |
| Widget Pocket UI | `src/widget/src/components/payments/PocketForm.tsx`   | Pocket QR; phone-only deeplink auto-open with fallback buttons       |

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
- The invoice `kind` filter matches an invoice only when a transaction of that `paymentKind`
  exists for it (any status). Methods merely offered via `paymentIds` must not match, or the
  filtered list shows invoices paid with other methods; `payment_ui`'s Payment Method column
  relies on this rule.
- The kind filter reads `Invoice.paymentKinds`, never a `distinct` over transactions: an unbounded
  id list can exceed MongoDB's 16 MB result limit. Every path that creates or deletes transactions
  (`createTransaction`, `cancelTransaction`, `removeTransactions`) must call
  `markInvoicePaymentKindsStale` **before** the change and `syncMarkedInvoicePaymentKinds` after
  it. The mark (unset field + version bump) is what makes recovery durable: if the sync fails,
  the backfill recomputes the invoice. The sync in `createTransaction` runs after the gateway
  try/catch so a sync failure never deletes a created transaction.
- `paymentKinds` writes go only through `syncInvoicePaymentKinds`, which serializes concurrent
  syncs with a compare-and-set on `paymentKindsVersion` (read the version, aggregate, write only
  if unchanged, retry otherwise). Never `$set` `paymentKinds` directly: an unguarded write can
  replace a newer snapshot with an older one. A sync that keeps losing unsets the field so the
  backfill recomputes it.
- In the widget, `kind === 'pocket'` must render `PocketForm`, not the shared
  `QrPayment`: `QrPayment`'s mobile branch shows bank-app `urls`, which Pocket
  does not return. On phones only (user agent check: iPhone/iPod, Android with
  "Mobile", HarmonyOS phones, or `userAgentData.mobile`), when
  `response.deeplink` exists `PocketForm` opens the Pocket app automatically
  once, and shows "Pocket апп-аар төлөх" / "QR кодоор төлөх" as a fallback.
  iPads, Android tablets, desktops, and responses without a deeplink show the
  QR only, so POS tablets never try to launch the app.
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
- Smoke: choose Pocket on a phone with Pocket installed and confirm the app
  opens automatically with the correct merchant and amount, and that returning
  to the browser shows the fallback buttons. On desktop, an iPad, and an
  Android tablet, confirm only the QR is shown and no deeplink launch is
  attempted.