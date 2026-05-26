# Content: Webbuilder Module

**Backend root:** `backend/plugins/content_api/src/modules/webbuilder/`
**Frontend root:** `frontend/plugins/content_ui/src/modules/webbuilder/`

Visual, drag-and-drop website generator.

## Entities

### Web
A website instance.
- **File:** `db/models/Web.ts`
- **Fields:** `name`, `domain`, `theme`, `pages`

### WebPage
A single page in the web builder.
- **File:** `db/models/WebPage.ts`
- **Fields:** `title`, `slug`, `components` (JSON array of visual components)

## Mechanics
Saves the state of the visual builder canvas (components, styling) to the database, allowing dynamic rendering of websites without code.
