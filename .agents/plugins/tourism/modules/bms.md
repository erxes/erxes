# Tourism: BMS (Booking Management System)

**Backend root:** `backend/plugins/tourism_api/src/modules/bms/`
**Frontend root:** `frontend/plugins/tourism_ui/src/modules/bms/`

Manages tour packages, itineraries, and tour operations.

## Entities

### Tour
A bookable tour package.
- **Files:** `db/models/Tour.ts`, `db/models/TourTranslation.ts`

### Itinerary & Element
The day-by-day schedule of a tour and its individual components (transport, meals, activities).
- **Files:** `db/models/Itinerary.ts`, `db/models/Element.ts`

### Order
A booking order for a tour.
- **Files:** `db/models/Order.ts`

## Mechanics
Allows tour operators to build complex multi-day tours with specific elements, price them, and track incoming orders. Integrates with translations to serve multi-lingual OTA portals.
