# Content: CMS Module

**Backend root:** `backend/plugins/content_api/src/modules/cms/`
**Frontend root:** `frontend/plugins/content_ui/src/modules/cms/`

A headless Content Management System similar to WordPress.

## Entities

### Post & Page
The core content units.
- **Files:** `db/models/Posts.ts`, `db/models/Page.ts`
- **Fields:** `title`, `content`, `status`, `slug`, `authorId`, `categoryId`

### CustomPostType
Defines new content shapes (e.g. "Testimonials", "Portfolio").
- **File:** `db/models/CustomPostType.ts`

### Taxonomy
- **Categories:** `db/models/Categories.ts`
- **Tags:** `db/models/Tag.ts`
- **Menus:** `db/models/Menu.ts` (Navigation structures)

### FieldGroups
Custom fields attached to posts (ACF equivalent).
- **File:** `db/models/FieldGroups.ts`

## GraphQL
Exposes content queries (`posts`, `postDetail`, `menus`) typically consumed by public-facing Next.js or React apps.
