# Payment Module

**Backend root:** `backend/plugins/payment_api/src/modules/payment/`
**Frontend root:** `frontend/plugins/payment_ui/src/`

Manages the core payment lifecycle.

## Entities

### Invoice
A request for payment.
- **File:** `db/models/Invoices.ts`
- **Fields:** `amount`, `status` (pending, paid, cancelled), `contentType`, `contentTypeId` (e.g. `sales:deal` and the Deal ID), `paymentIds`
- **Integration:** The `contentType` and `contentTypeId` define what internal entity this invoice belongs to. This is the link back to the calling plugin (e.g. Sales or Tourism).

### Transaction
A confirmed movement of funds.
- **File:** `db/models/Transactions.ts`
- **Fields:** `amount`, `status`, `paymentId`, `invoiceId`, `paymentKind` (qpay, socialpay, cash, card)
- **Integration:** Updated via webhook or manual input.

### Payment
Configuration for a specific payment method.
- **File:** `db/models/Payment.ts`
- **Fields:** `name`, `kind`, `config` (API keys, merchant IDs)

## Mechanics
1. Consumer plugin (e.g., Sales POS) calls `payment_api` (via internal RPC or GraphQL) to create an `Invoice` for a `dealId`.
2. `payment_api` generates QR codes or payment links for active `Payment` methods.
3. User pays via their banking app.
4. Bank sends webhook to `payment_api` REST route.
5. `payment_api` verifies signature, creates `Transaction`, marks `Invoice` as paid.
6. `payment_api` uses `messageBroker` to emit a `payment:invoice:paid` event, or uses an explicit callback to the consumer plugin.
7. Consumer plugin catches the event and updates its own entity (e.g. moves Deal to "Closed Won").
