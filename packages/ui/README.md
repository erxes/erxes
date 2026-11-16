# @erxes/ui

Published as `@erxes/ui` under the `v2-next` dist-tag and imported as `erxes-ui`: plugins install
`"erxes-ui": "npm:@erxes/ui@v2-next"`, `apps/web` depends on `"erxes-ui": "workspace:@erxes/ui@*"`,
and the Module Federation shared key is `erxes-ui`. The `latest` and `next` tags belong to old
erxes's 3.x.

The design system web and plugin UIs share: UI primitives, layout, record tables, filters,
the block editor, hooks and shared state. In the workspace `exports` point at `src/` and
`apps/web` compiles it. `pnpm build` (tsdown) writes the publishable `dist/`, one module and
`.d.ts` per source file, and checks the packed package with publint and attw; `publishConfig`
holds the `exports` a published copy uses.

## Who imports it

- `apps/web` imports `erxes-ui` and, for a few files, `erxes-ui/<path>` (the `./*` export).
- Plugin UIs get `erxes-ui` from the host as a Module Federation singleton and import only the
  root, `src/index.ts`. A removed export breaks them at runtime, not at build time.

## What `src/index.ts` exports

Only what something uses:

- what web imports,
- what plugin UIs import (the HR plugin is the first consumer),
- the plugin API in the plugin skills: `getPluginRuntime`, `pluginFetch`, `pluginJson`,
  `useLiveSignal`, `RecordTimeline`, `getPluginAssetsUrl`, `addPluginStyles` and the `IUIConfig` types,
- the design-system primitives in `src/components` (Accordion, Card, Slider …), even unused,
  because plugins build on them,
- the record views plugins build lists from: `RecordTable` and `RecordList` (rows grouped under
  headers that fold away, such as tasks by status; the Operation plugin is the first consumer),
- the pickers in `src/modules/pickers`: `EntityPicker`, and `SelectMember`, `MemberInline` and
  `useMembersById`, which take `memberQueries` from `@erxes/core-contract/client`. They read
  through TanStack query options, so erxes-ui imports nothing from core.
- core's records in `src/modules/records`: `ContactLink` (a customer or company by id, read
  through `contactQueries` from `@erxes/core-contract/client`) and `useOpenRecord`, which open a
  record or a draft in web's side panel through the `RecordOpenerProvider` web mounts, and
  `RecordPage`, a record on its own page.
- the record panel's rows in `src/modules/record-panel`, which web's side panel and the slots
  of a plugin's record types (`IUIConfig.recordTypes`) both fill it with: `PanelSection`,
  `PanelField`, `PanelFormRow`, `PanelFormLayout`, `PanelLabel`, the description field and
  editor, and `usePanelExpanded`. The panel itself (header, tabs, resize) is web's.
- a list's bar in `src/modules/list`: `ViewBar`, `DisplayMenu` with `useListDisplay`, and
  `ListFilter` with `useListFilterParams` and its empty state `ListFilterEmpty`. `ListFilter` draws core's filter bar itself, with or
  without web: its `member` fields pick from `members` (`memberQueries` from
  `@erxes/core-contract/client`) and its `tags` fields from `tags` (a tags query of the record
  type); a plugin outside erxes passes its own. Web's lists and the automation builder use the
  same bar and the condition editor under its advanced filter (`ConditionsEditor`,
  `src/modules/conditions`).
- what the host app provides at startup, rendered through `hostComponent`
  (`src/utils/host-component.tsx`): `setRecordTimeline` and `setRecordPage`. Outside erxes they
  render nothing.

Anything else is removed, not kept "in case". Before you remove an export, check the HR plugin
UI and `.agents/skills/plugin-contract/SKILL.md`.

## Styles

`styles.css` builds Tailwind from this package's sources and imports `theme.css` (tokens) and
`base.css` (page defaults, light and dark theme). `fonts.css` loads Inter and Roboto Mono for an
app not hosted by web.
