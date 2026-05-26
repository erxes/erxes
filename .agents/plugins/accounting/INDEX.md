# Accounting plugin

**Backend:** `backend/plugins/accounting_api/`
**Frontend:** `frontend/plugins/accounting_ui/`

Double-entry bookkeeping, chart of accounts, transaction journals, tax reporting, and inventory management.

## Modules

| Module | Doc | Backend root | Frontend root |
|---|---|---|---|
| **accounting** | [modules/accounting.md](modules/accounting.md) | `backend/plugins/accounting_api/src/modules/accounting/` | `frontend/plugins/accounting_ui/src/` |
| **inventories** | [modules/inventories.md](modules/inventories.md) | `backend/plugins/accounting_api/src/modules/inventories/` | `frontend/plugins/accounting_ui/src/` |

## Integration with other plugins
- **Core:** Extends `Product` with COGS and inventory accounts. Uses `Company` and `Customer` for receivables/payables.
- **Sales / Ecommerce:** Deal won or POS checkout triggers ledger entries (Sales Revenue, Accounts Receivable, Inventory reduction).
- **Payment:** Paid invoices post to Cash/Bank accounts and clear Accounts Receivable.
