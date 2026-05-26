# Inventories Module

**Backend root:** `backend/plugins/accounting_api/src/modules/inventories/`
**Frontend root:** `frontend/plugins/accounting_ui/src/`

Perpetual inventory tracking and COGS calculation.

## Entities

### SafeRemainder
The current stock level for a product in a specific warehouse/branch.
- **File:** `db/models/SafeRemainders.ts`
- **Fields:** `productId`, `branchId`, `departmentId`, `remainder` (quantity), `cost` (weighted average cost or FIFO value)

### ReserveRem
Inventory reserved for active orders (e.g., an ecommerce cart that hasn't checked out yet, or a Deal in negotiation).
- **File:** `db/models/ReserveRems.ts`
- **Fields:** `productId`, `quantity`, `contentType`, `contentTypeId`

## Mechanics
- When a `Transaction` is posted that sells a product, this module recalculates the `SafeRemainder` and posts the COGS (Cost of Goods Sold) entry to the ledger.
- Provides real-time stock availability checks for POS and Ecommerce.
