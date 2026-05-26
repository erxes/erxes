# Tourism: OTA (Online Travel Agency)

**Backend root:** `backend/plugins/tourism_api/src/modules/ota/`
**Frontend root:** `frontend/plugins/tourism_ui/src/modules/ota/`

Consumer-facing booking portal aggregator for both Tours (BMS) and Hotels (PMS).

## Entities

### Tours & Availabilities
Caches or aggregates tour listings and availability for specific dates.
- **Files:** `db/models/Tours.ts`, `db/models/TourAvailabilities.ts`, `db/models/TourCategories.ts`

### Hotels & RoomTypes
Aggregates hotel listings and bookable room types.
- **Files:** `db/models/Hotels.ts`, `db/models/RoomTypes.ts`, `db/models/Availabilities.ts`

### Bookings & Reviews
Customer-facing booking records and user reviews.
- **Files:** `db/models/Bookings.ts`, `db/models/TourBookings.ts`, `db/models/Reviews.ts`

## Mechanics
Provides the GraphQL endpoints necessary for a public-facing booking website to search for tours/hotels, check availability, and place bookings. Integrates heavily with the payment plugin to secure bookings.
