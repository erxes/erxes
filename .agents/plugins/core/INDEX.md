# core plugin (core-api / core-ui)

**Backend:** `backend/core-api/` — port **3300**
**Frontend:** `frontend/core-ui/` — port **3000** (Host app)

The foundational platform layer for erxes. Contains the central gateway registration, monolithic shared entities (contacts, products, tags, properties), and the Module Federation host for the frontend.

## Modules

| Module | Doc | Backend root | Frontend root |
|---|---|---|---|
| **contacts** | [modules/contacts.md](modules/contacts.md) | `backend/core-api/src/modules/contacts/` | `frontend/core-ui/src/modules/contacts/` |
| **products** | [modules/products.md](modules/products.md) | `backend/core-api/src/modules/products/` | `frontend/core-ui/src/modules/products/` |
| **properties** | [modules/properties.md](modules/properties.md) | `backend/core-api/src/modules/properties/` | `frontend/core-ui/src/modules/properties/` |
| **tags & segments** | [modules/tags-segments.md](modules/tags-segments.md) | `backend/core-api/src/modules/{tags,segments}/` | `frontend/core-ui/src/modules/{tags,segments}/` |
| **auth & permissions**| [modules/auth.md](modules/auth.md) | `backend/core-api/src/modules/{auth,permissions}/` | `frontend/core-ui/src/modules/auth/` |
| **organization** | [modules/organization.md](modules/organization.md)| `backend/core-api/src/modules/organization/` | `frontend/core-ui/src/modules/organization/` |

## External surfaces

### GraphQL federation
Exposed via `@key(fields: "_id")`:
- `User`, `Customer`, `Company`
- `Product`, `ProductCategory`
- `Tag`
- `Branch`, `Department`
- `Field`, `Group` (Properties)
- `Segment`

File: `backend/core-api/src/graphql/typeDefs.ts`

### tRPC routers
Merged in `backend/core-api/src/init-trpc.ts`.
Provides cross-plugin access to core data without GraphQL overhead.

### BullMQ queues
Handles automation execution, email/SMS broadcasts, and imports/exports.

### Segments
Core entities (Customer, Company) are segmented here. Other plugins inject their associations to filter core entities (e.g., "Customers with Deal > $10k").

## Cross-plugin consumers
- **Every plugin** consumes `User` and standard CRM entities from `core-api`.
- Plugins inject their specific fields into `Customer` / `Company` via extended properties.

## Cross-plugin dependencies
- None. Core is the bottom of the dependency tree.
