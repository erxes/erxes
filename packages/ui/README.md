# erxes-ui

The design system core-ui and plugin UIs share: UI primitives, layout, record tables, filters,
the block editor, hooks and shared state. In the workspace `exports` point at `src/` and
`apps/core-ui` compiles it. `pnpm build` (tsdown) writes the publishable `dist/`, one module and
`.d.ts` per source file, and checks the packed package with publint and attw; `publishConfig`
holds the `exports` a published copy uses.

## Who imports it

- `apps/core-ui` imports `erxes-ui` and, for a few files, `erxes-ui/<path>` (the `./*` export).
- Plugin UIs get `erxes-ui` from the host as a Module Federation singleton and import only the
  root, `src/index.ts`. A removed export breaks them at runtime, not at build time.

## What `src/index.ts` exports

Only what something uses:

- what core-ui imports,
- what plugin UIs import (the HR plugin is the first consumer),
- the plugin API in the plugin skills: `getPluginRuntime`, `pluginFetch`, `pluginJson`,
  `useLiveSignal`, `RecordTimeline`, `getPluginAssetsUrl` and the `IUIConfig` types,
- the design-system primitives in `src/components` (Accordion, Card, Slider …), even unused,
  because plugins build on them.

Anything else is removed, not kept "in case". Before you remove an export, check the HR plugin
UI and `.agents/skills/plugin-contract/SKILL.md`.

## Styles

`styles.css` builds Tailwind from this package's sources and imports `theme.css` (tokens) and
`base.css` (page defaults, light and dark theme). `fonts.css` loads Inter and Roboto Mono for an
app not hosted by core-ui.
