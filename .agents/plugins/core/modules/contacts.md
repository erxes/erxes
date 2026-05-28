# Core: Contacts Module

**Backend root:** `backend/core-api/src/modules/contacts/`
**Frontend root:** `frontend/core-ui/src/modules/contacts/`

Manages the core CRM entities: Customers and Companies.

## Entities

### Customer
A human contact.
- **File:** `db/models/Customers.ts`
- **Fields:** `firstName`, `lastName`, `primaryEmail`, `primaryPhone`, `visitorId`
- **Dynamic Fields:** Supports customProperties mapping to `Field` entries in the properties module.
- **Federation:** `@key(fields: "_id")`

### Company
A business organization.
- **File:** `db/models/Companies.ts`
- **Fields:** `primaryName`, `size`, `industry`, `plan`, `website`
- **Dynamic Fields:** Supports customProperties.
- **Federation:** `@key(fields: "_id")`

## Integration with other plugins
- **sales:** Deals link to Customers and Companies.
- **frontline:** Conversations link to Customers.
- **operation:** Tasks link to Customers and Companies.

## GraphQL
Exposes standard CRUD queries and mutations for `customer` and `company`.
