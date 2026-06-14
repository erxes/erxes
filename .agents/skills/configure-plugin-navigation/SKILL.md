---
name: configure-plugin-navigation
description: Configure erxes frontend plugin navigation, settings navigation, icons, module entries, widget declarations, and config paths. Use when changing src/config.tsx or plugin navigation surfaces.
---

# Skill: Configure Plugin Navigation

## Workflow

1. Open the plugin's `src/config.tsx` and nearby plugin config files.
2. Reuse the plugin's existing `IUIConfig` shape: `name`, `path`, `icon`,
   `navigationGroup`, `modules`, and `widgets` when present.
3. Use icons from `@tabler/icons-react` and keep icon naming consistent with
   nearby config files.
4. Add module entries only when the module should appear in app navigation or
   settings navigation.
5. Add `relationWidgets` or floating widgets only when the plugin exposes and
   implements those widget surfaces.
6. Keep paths aligned with route registration and Module Federation exposes.
7. Run `pnpm nx lint <plugin>` and `pnpm nx build <plugin>` for code changes.

## Important

- Do not add plugin-specific navigation or widgets in `frontend/core-ui`.
- Do not use `IconSandbox` as a final icon unless the surrounding plugin is
  intentionally still placeholder-quality.
- Check `module-federation.config.ts` before adding widget or module config
  that depends on a remote expose.
- Preserve `hasSettings`, relation widget, and floating widget behavior used by
  nearby plugin config files.
