# Insurance plugin

**Backend:** `backend/plugins/insurance_api/`
**Frontend:** `frontend/plugins/insurance_ui/`

Specialized CRM extension for insurance brokerages and agencies.

## Modules

| Module | Doc | Backend root | Frontend root |
|---|---|---|---|
| **insurance** | [modules/insurance.md](modules/insurance.md) | `backend/plugins/insurance_api/src/modules/` | `frontend/plugins/insurance_ui/src/` |

## Integration with other plugins
- **Core:** Maps `Customer` to insured parties and uses `User` for brokers.
- **Sales:** Uses Deals to track insurance sales pipeline.
- **Payment:** Collects premiums via the payment API.
