# Core: Tags & Segments

**Backend root:** `backend/core-api/src/modules/{tags,segments}/`
**Frontend root:** `frontend/core-ui/src/modules/{tags,segments}/`

Filtering and organizational taxonomies.

## Tags
Colored labels that can be attached to entities.
- **Entity:** `Tag` (`db/models/Tags.ts`)
- **Fields:** `name`, `type` (content type it applies to), `colorCode`
- **Integration:** Entities like Customer or Ticket hold an array of `tagIds`.

## Segments
Dynamic, query-based subsets of entities powered by Elasticsearch.
- **Entity:** `Segment` (`db/models/Segments.ts`)
- **Fields:** `name`, `contentType`, `conditions` (JSON array of filters)
- **Integration:** Other plugins register segment associations (e.g., Sales registers `sales:deal` associations so you can segment Customers by Deal value).

## GraphQL
Exposes `tags`, `segments`, and their respective CRUD mutations.
