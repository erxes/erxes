# Payment plugin

**Backend:** `backend/plugins/payment_api/`
**Frontend:** `frontend/plugins/payment_ui/`

Handles invoices, transactions, and integrations with payment gateways (QPay, SocialPay, Golomt, Stripe, etc.).

## Modules

| Module | Doc | Backend root | Frontend root |
|---|---|---|---|
| **payment** | [modules/payment.md](modules/payment.md) | `backend/plugins/payment_api/src/modules/payment/` | `frontend/plugins/payment_ui/src/` |

## External surfaces

### GraphQL
Provides standalone Queries and Mutations for managing invoices and checking transactions. Does not extend core types directly; instead, other plugins store `invoiceId`s.

### REST Routes
Payment gateways typically hit webhooks.
- `GET /pl:payment/check-*` routes for polling/redirect callbacks from banks.
- Webhooks update `Transaction` and `Invoice` statuses, then dispatch events to other plugins.

### Cross-plugin integration
- **Sales:** When a POS deal is checked out, it creates an invoice in `payment_api`. When the invoice is paid via a webhook, `payment_api` fires a message/RPC to `sales_api` to mark the Deal as paid and update its stage.
- **Tourism:** Tour bookings generate invoices.
- **Accounting:** Syncs completed transactions to accounting ledger.
