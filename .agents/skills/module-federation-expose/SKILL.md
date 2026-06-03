---
name: module-federation-expose
description: Add or change erxes frontend Module Federation exposes, shared dependencies, widgets, and host-facing plugin entry points.
---

# Skill: Module Federation Expose

## Workflow

1. Open the plugin's `module-federation.config.ts` and identify current exposes
   and shared dependencies.
2. Confirm whether the new surface should be a route module, config, widget,
   relation widget, settings page, or plugin-local component.
3. Add exposes only when the module must be loaded by the host or another
   Module Federation boundary.
4. Keep exposed entry points stable and small. Put feature internals under
   `src/modules`, `src/pages`, or plugin-local shared folders.
5. Update host references, plugin config, route registration, or widget config
   when an expose name or path changes.
6. Keep shared dependency behavior consistent with nearby plugin configs.
7. Run `pnpm nx build <plugin>` and `pnpm nx lint <plugin>` for frontend plugin
   changes.

## Important

- Do not move or rename exposes without updating all host references.
- Do not put general feature UI in `src/widgets`; reserve it for widget
  exports and widget-specific UI.
- Do not add shared plugin UI to `frontend/core-ui`; move truly shared frontend
  UI to `erxes-ui` or `ui-modules` only when reuse is clear.
- Avoid adding dependencies for an expose unless the existing repo cannot
  reasonably cover the need.
