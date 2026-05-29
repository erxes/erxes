---
name: create-page
description: Add erxes frontend pages and routes using nearby plugin page, layout, routing, loading, and feature-module structure. Use for route-level page work.
---

# Skill: Create New Page

## Workflow

1. Find similar page
2. Copy existing structure
3. Reuse existing layout/components
4. Add route using existing routing pattern
5. Keep folder structure consistent
6. Reuse existing loading/error states
7. Keep feature internals near the feature under `src/modules`
8. Use `src/pages` for route-level pages only when the plugin already does
9. Run focused validation: `pnpm nx lint <plugin>` and
   `pnpm nx build <plugin>`

## Important

- Do not invent new page structure
- Match nearby modules
- Preserve current UX conventions
