# Tourism: PMS (Property Management System)

**Backend root:** `backend/plugins/tourism_api/src/modules/pms/`
**Frontend root:** `frontend/plugins/tourism_ui/src/modules/pms/`

Manages hotel or property room operations and housekeeping.

## Entities

### Branch & Cleanings
Maps to physical hotel locations and tracks room maintenance.
- **Files:** `db/models/Branch.ts`, `db/models/Cleaning.ts`, `db/models/CleaningHistory.ts`

## Mechanics
Used by hotel staff to track which rooms need cleaning, are occupied, or are ready for check-in.
