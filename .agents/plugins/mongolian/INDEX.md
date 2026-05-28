# Mongolian plugin

**Backend:** `backend/plugins/mongolian_api/`
**Frontend:** `frontend/plugins/mongolian_ui/`

Local integrations for businesses operating in Mongolia. 

## Modules

| Module | Doc | Backend root | Frontend root |
|---|---|---|---|
| **mongolian** | [modules/mongolian.md](modules/mongolian.md) | `backend/plugins/mongolian_api/src/modules/` | `frontend/plugins/mongolian_ui/src/` |

## Integration with other plugins
- **Core:** Core settings for the organization's registry numbers.
- **Sales / POS / Ecommerce:** When a transaction completes, they call `mongolian_api` to generate Ebarimt tax receipts.
- **Accounting:** Fetches official exchange rates from Mongolbank for multi-currency transactions.
