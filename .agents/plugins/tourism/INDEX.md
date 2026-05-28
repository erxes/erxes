# Tourism plugin

**Backend:** `backend/plugins/tourism_api/`
**Frontend:** `frontend/plugins/tourism_ui/`

Specialized modules for the travel and hospitality industry: Tour bookings, Hotel property management, and online travel portals.

## Modules

| Module | Doc | Backend root | Frontend root |
|---|---|---|---|
| **bms (Tours)** | [modules/bms.md](modules/bms.md) | `backend/plugins/tourism_api/src/modules/bms/` | `frontend/plugins/tourism_ui/src/modules/bms/` |
| **pms (Hotels)**| [modules/pms.md](modules/pms.md) | `backend/plugins/tourism_api/src/modules/pms/` | `frontend/plugins/tourism_ui/src/modules/pms/` |
| **ota (Portal)**| [modules/ota.md](modules/ota.md) | `backend/plugins/tourism_api/src/modules/ota/` | `frontend/plugins/tourism_ui/src/modules/ota/` |

## Integration with other plugins
- **Core:** Core Contacts (Customer/Company) are used for bookings. 
- **Payment:** Tour and hotel bookings generate Invoices in `payment_api`.
- **Sales:** Bookings can be pushed to a Sales Pipeline as Deals for B2B tracking.
