# Core: Organization

**Backend root:** `backend/core-api/src/modules/organization/`
**Frontend root:** `frontend/core-ui/src/modules/organization/`

Hierarchical team structures.

## Entities

### Branch
Physical or logical branch of the organization.
- **Federation:** `@key(fields: "_id")`

### Department
Logical department within a branch.
- **Federation:** `@key(fields: "_id")`

## Integration
Users belong to departments and branches. Data access can be scoped to branch/department levels depending on permissions.
