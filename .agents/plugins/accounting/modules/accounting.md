# Accounting Module

**Backend root:** `backend/plugins/accounting_api/src/modules/accounting/`
**Frontend root:** `frontend/plugins/accounting_ui/src/`

The core double-entry ledger.

## Entities

### Account
A ledger account in the chart of accounts (e.g., "1001 Cash", "4001 Sales Revenue").
- **File:** `db/models/Accounts.ts`
- **Fields:** `code`, `name`, `type` (asset, liability, equity, revenue, expense), `currency`

### AccountCategory
Groups of accounts for reporting (Balance Sheet, P&L groupings).
- **File:** `db/models/AccountCategories.ts`

### Transaction
A journal entry representing financial movement. Double-entry is enforced.
- **File:** `db/models/Transactions.ts`
- **Fields:** `date`, `description`, `entries` (array of debits and credits balancing to 0), `currency`
- **Mechanics:** `entries` array contains `{ accountId, credit, debit, customerId, companyId, branchId, departmentId }`. This allows extremely granular P&L reporting.

### Tax Rows (VAT/CTAX)
Records for Mongolian Ebarimt or corporate tax compliance.
- **Files:** `VatRows.ts`, `CtaxRows.ts`

## GraphQL
Provides `accounts`, `transactions`, `balanceSheet`, `incomeStatement` queries. Mutations strictly enforce double-entry (total debits == total credits).
