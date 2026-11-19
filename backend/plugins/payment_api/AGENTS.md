# `payment_api` Plugin Guide

## Identity

- **Plugin:** `payment`
- **Project:** `payment_api`
- **Layer:** `Backend API`
- **Path:** `backend/plugins/payment_api`
- **Last synchronized:** `2026-11-18`
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
- Accepts Golomt's server-to-server push at `/notification/golomt`
  (`apis/golomt/api.ts` `notificationHandler`). The payload is never trusted:
  the transaction is confirmed with Golomt's inquiry API, then the invoice goes
  through `checkInvoiceAndClaim` + `notifyPaidInvoice` like `invoicesCheck`, so
  a push racing the widget or redirect callback cannot notify twice. A
  `contentType` whose plugin is not enabled is logged, not silently dropped.
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
- Toki is one payment method with two flows (`apis/toki/api.ts`):
  - Mini program: the shop page runs inside the Toki app and calls Toki's
    `buy()` bridge (`JSReceiver.buyfromShoppy` / `webkit.messageHandlers.buyfromShoppy`)
    with the `miniProgram` data `createInvoice` returns. Toki POSTs
    `{ orderID, transRequestId, token, amount, ... }` to `/pl:payment/callback/toki`,
    and erxes confirms it with `<apps host>/jump/v1/shoppy/transaction-status`
    using the customer's `token` plus the fixed `im_api_key: shoppy123`. Needs
    only the merchant ID; `tokiEnvironment: 'staging'` switches to Toki's
    staging host and test merchant.
  - Merchant QR: only when both QR username and password are set. Logs in to
    `ms-api.toki.mn/third-party-service` (GET `auth/token`, Basic auth) and
    creates the QR with `payment-request/merchant-qr`. A QR failure is returned
    as `qrError` next to the still-valid `miniProgram` data.
  The widget's `TokiForm` uses the bridge when the Toki app injected it,
  otherwise shows the QR, otherwise tells the customer to open the shop in Toki.

- Settles Khanbank (Corporate Gateway) invoices from the account statement:
  the customer transfers by hand, and `apis/khanbank/api.ts` `checkInvoice`
  looks for the transfer with `StatementsApi.findTransactions`
  (`modules/corporateGateway/khanbank/khanbank/api/statements.ts`). It reads
  every statement page from the transaction's creation day (Ulaanbaatar time)
  to today and matches on the amount plus the words of the invoice
  description, compared lowercased with punctuation removed.

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
| Widget Toki UI   | `src/widget/src/components/payments/TokiForm.tsx`     | Toki app `buy()` bridge inside Toki, QR elsewhere, retry on failure  |
| Paid hand-off    | `src/utils/transactionCallback.ts`                    | Once-per-transaction claim for `transactionCallback`                 |

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
- Khanbank description matching is by whole words, never by prefix or
  substring: the description that reaches the statement can lose characters
  such as "—", and a substring match would let `Installment 1` settle
  `Installment 10`. The sender suffix the bank appends (`<BANK>ААС: <6-digit
  bank code> <sender>`) is cut off first, and the invoice words must appear
  in it in order without gaps, so sender details can never supply a missing
  invoice word.
- One Khanbank statement line settles one transaction. A line is skipped when
  it is older than the transaction (5 minutes of slack), has no readable
  date/time, or is already saved on another transaction of any Khanbank
  payment method on the same account (`response.matched.record`, or the
  legacy `response.record`). A line is then claimed atomically in Redis
  (`payment:khanbank:statement:<account>:<record>`, `SET NX`) before the
  check returns `paid`, so concurrent checks cannot both use it. The match is
  saved on the transaction as `response.matched`.
- The Khanbank access token is cached for its lifetime minus 60 seconds and
  not cached at all when that is not positive; token errors surface the
  bank's `code`/`message`.
- `transactionCallback` goes to the owning plugin at most once per
  transaction: the sender must win `claimTransactionCallback`
  (`payment:transactionCallback:<id>`, `SET NX`) and release it if sending
  fails. Both the callback route and the Golomt notification use it, because
  providers retry callbacks.
- A Toki mini-program payment is paid only after Toki's `transaction-status`
  says `COMPLETED`. The callback `amount` is required and must equal the
  transaction amount, and any order, amount or merchant in Toki's reply must
  match. Toki's documented reply carries only `status`, so it cannot prove
  which order a payment was for; the binding below is what stops reuse.
- One Toki `transRequestId` settles one transaction. `settleMiniProgramPayment`
  is the only place it happens: after Toki confirms and before the
  transaction is marked paid, it claims `toki_mp_claim_<transRequestId>`
  (`SET NX`, 365 days), rejects ids already saved on another transaction, and
  saves `response.tokiTransRequestId`. The callback and status polling both
  go through it; a rejected or still-pending payment claims nothing.
- The Toki customer token stays in Redis (`toki_mp_<transactionId>`, 7 days),
  never in `transaction.response`, which GraphQL can read. An unverified
  callback never overwrites a stored one.
- Toki mini-program callbacks are server-to-server: reply
  `{ status: 'success' }`, never redirect. Toki QR redirects whose payment is
  cancelled, failed or expired record that status on a pending transaction
  (never on a paid one) and land on the widget's payment-failed page.
- A transaction whose `response` has `error` or `qrError` is never reused:
  `findReusableTransaction` excludes it and the widget requests a new one.
- Toki's gateway rejects request bodies containing `localhost` URLs with an
  HTML 403, so Toki QR cannot be created from a local backend; production
  callback URLs are unaffected.

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
- Smoke (Toki): open the shop inside the Toki app (staging), pay 5₮, and
  confirm the transaction turns `paid` and saves `response.tokiTransRequestId`.
  Replaying that callback with another pending transaction's `orderID` must
  fail with "already used for another order". In a normal browser the Toki
  option must show the "open in the Toki app" message, not a QR.
- Smoke (Khanbank): create two invoices with the same amount and a
  description like `TEST — Deposit`, transfer that amount once with the
  description typed as `test deposit`, then run `invoicesCheck` on both:
  exactly one is `paid`, the other stays `pending`.
