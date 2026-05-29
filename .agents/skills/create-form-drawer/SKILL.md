---
name: create-form-drawer
description: Build erxes drawer, sheet, or dialog forms with local validation, mutations, state, toasts, and close/reset behavior. Use for create and edit flows in frontend plugins.
---

# Skill: Create Form Drawer

## Workflow

1. Find the closest create/edit drawer, sheet, or dialog in the same plugin.
2. Reuse existing `erxes-ui` form, drawer, sheet, dialog, input, button, toast,
   and loading components.
3. Reuse the plugin's existing React Hook Form and Zod patterns when present.
4. Keep form schema, default values, types, mutation hooks, and drawer state
   near the feature unless the plugin already has a shared location.
5. Match nearby submit behavior: loading state, disabled buttons, toast,
   refetch/cache update, close drawer, and form reset.
6. Ensure the affected list/detail/count/selector UI updates after submit
   without a browser refresh, using the nearby Apollo cache, refetch, or
   subscription pattern.
7. Preserve route params and required IDs such as `websiteId`, board IDs,
   pipeline IDs, or plugin-specific IDs.
8. Run focused validation: `pnpm nx lint <plugin>` and
   `pnpm nx build <plugin>`. Run `pnpm nx test <plugin>` when tested behavior
   or test setup changed.

## Important

- Do not create a new form, drawer, modal, validation, or state system.
- Do not duplicate GraphQL mutations without searching existing feature and
  shared GraphQL folders.
- Do not store form values in global atoms unless the nearby feature already
  uses that pattern.
- Do not rely on users refreshing the page to see newly created, updated, or
  removed records.
- Keep empty, error, and loading states consistent with surrounding screens.
