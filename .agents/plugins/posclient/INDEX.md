# POS Client plugin

**Backend:** `backend/plugins/posclient_api/`
**Frontend:** `frontend/plugins/posclient_ui/`

An offline-first, local Point-of-Sale client API that syncs data between a local device (iPad/tablet/desktop app) and the main `sales_api` / `core-api`.

## Modules

| Module | Doc | Backend root | Frontend root |
|---|---|---|---|
| **posclient** | [modules/posclient.md](modules/posclient.md) | `backend/plugins/posclient_api/src/modules/posclient/` | `frontend/plugins/posclient_ui/src/` |

## Integration with other plugins
- **Sales:** Syncs configuration from `sales_api` (pos configs, receipt templates).
- **Core:** Caches `Products` and `Categories` locally to allow offline checkout.
- **Payment:** When checking out, `posclient_api` requests `payment_api` to generate QPay/SocialPay QR codes. Once paid, the order is finalized.
- **Accounting / Ebarimt (Mongolian):** Generates tax receipts automatically when an order is finalized.
