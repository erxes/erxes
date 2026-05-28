# Core: Auth & Permissions

**Backend root:** `backend/core-api/src/modules/{auth,permissions}/`
**Frontend root:** `frontend/core-ui/src/modules/auth/`

Authentication, OAuth providers, and RBAC.

## Entities

### User
An internal system user (team member).
- **Federation:** Central user entity, exposed to all plugins.

### Permission
RBAC definitions.
- **File:** `db/models/Permissions.ts`
- **Fields:** `module`, `action`, `userId` / `groupId`
- **Mechanics:** Each plugin defines its permissions in `meta/permissions.ts`. Core aggregates them and enforces them via middleware.

### OAuth Apps
For 3rd-party integrations and API access.
- **File:** `db/models/OAuthClientApps.ts`

## GraphQL
Exposes auth token generation, user management, and permission assignments.
