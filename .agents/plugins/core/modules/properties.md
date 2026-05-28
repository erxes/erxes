# Core: Properties Module

**Backend root:** `backend/core-api/src/modules/properties/`
**Frontend root:** `frontend/core-ui/src/modules/properties/`

Dynamic field engine for erxes. Allows admins to add custom fields to core entities without schema migrations.

## Entities

### Field
A custom field definition.
- **File:** `db/models/Field.ts`
- **Fields:** `contentType` (e.g., "core:customer", "sales:deal"), `type` (string, number, date, select), `text`, `validation`, `options`
- **Federation:** `@key(fields: "_id")`

### Group
A logical grouping of fields (e.g., "Social Links" group containing Facebook, Twitter fields).
- **File:** `db/models/Group.ts`
- **Fields:** `name`, `contentType`, `order`

## Mechanics
When an entity (like Deal or Customer) is saved with dynamic properties, the values are stored in a `customFieldsData` (or similar) JSON array/object, keyed by the `Field`'s ID.

## GraphQL
Exposes `fields`, `fieldsGroups` queries and mutations.
