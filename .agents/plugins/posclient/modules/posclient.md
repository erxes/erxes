# POS Client Module

**Backend root:** `backend/plugins/posclient_api/src/modules/posclient/`
**Frontend root:** `frontend/plugins/posclient_ui/src/`

Offline-capable local cache and order management.

## Entities

### Order & OrderItems
The local cart and receipt generation data.
- **Files:** `db/models/Orders.ts`, `db/models/OrderItems.ts`
- **Fields:** `status`, `totalAmount`, `items`, `customerId`, `paymentType`
- **Sync:** Once payment succeeds, `posclient` "Puts" the order to `sales_api`, which converts it into a `Deal` in the POS pipeline.

### Covers
Cash drawer tracking (open shift, close shift).
- **File:** `db/models/Covers.ts`
- **Mechanics:** Tracks starting cash, added cash, and expected ending cash for a cashier's shift.

### PutResponse & PutData
Sync state tracking.
- **File:** `db/models/PutResponses.ts`, `db/models/PutData.ts`
- **Mechanics:** Because the POS might be offline when a transaction occurs, data is saved locally. Background workers attempt to `PUT` data to the cloud (`sales_api` / `payment_api`). These models track sync success/failure.

### Cached Core Data
- **Products:** `db/models/Products.ts`
- **Configs:** `db/models/Configs.ts`
- **PosUsers:** `db/models/PosUsers.ts` (Cashier PIN logins)

## Mechanics
1. On boot, `posclient_ui` triggers a sync. `posclient_api` fetches the latest products and configs from the cloud gateway.
2. Cashier works locally. Orders are saved to local MongoDB.
3. On checkout, if online, QR codes are requested. If offline, only cash is accepted.
4. Finished orders are synced to `sales_api` as Deals.
