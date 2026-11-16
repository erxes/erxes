# ui

The Module Federation remote `__id___ui`. web loads `./config` (`CONFIG`)
and renders `./__id__` (the `__Pascal__` export) under `/__id__/*`.

- `rsbuild.config.ts` declares web's shared singletons with `import: false`,
  reading the list from `erxes-ui/federation`, so it follows the installed
  erxes-ui. A missing name bundles a second copy and breaks at runtime.
- A feature is a folder in `src/modules` (`src/modules/items`); what features
  share sits in `src`, such as `src/orpc.ts`. A folder's own
  files import as `./`; anything else as `@/<feature>/…` (`src/modules`) or
  `~/…` (`src`), set in `tsconfig.json` and `rsbuild.config.ts`. Lint refuses `../`.
- Build pages from `erxes-ui` components and its root export. The host provides
  React, the router, the query client and erxes-ui, and web's stylesheet styles
  erxes-ui's components.
- Read `node_modules/erxes-ui/CATALOG.md` before writing a component, hook or
  helper. It lists every erxes-ui export with what it is for, and the core screen
  each kind of page copies.
- Any Tailwind class works, on erxes-ui's tokens (`bg-muted`, `text-sm`,
  `md:grid-cols-2`). `src/styles.css` builds the plugin's own utilities, and
  `src/__Pascal__.tsx` passes them to `addPluginStyles`, which adds only the
  classes web's stylesheet lacks. erxes-ui's design rules hold here too (its
  `AGENTS.md`, enforced by `vp run check`): no inline styles or raw colours.
- The plugin's API goes through `src/orpc.ts`:
  `useQuery(orpc.items.list.queryOptions(...))`,
  `useMutation(orpc.items.create.mutationOptions(...))`. Types come from
  `api/src/router.ts`; after a mutation, invalidate `orpc.<group>.key()`.
- Core's API goes through `orpc` from `@erxes/core-contract/client`, the client
  web uses, with the member's own session; import it as `core` beside the
  plugin's `orpc`: `useQuery(core.users.get.queryOptions({ input: { id } }))`.
  It shares web's query cache, and the member needs the core permission the
  procedure asks for (`team.view` for team members).
- Members: `SelectMember.Field`, `SelectMember.InlineCell`, `MemberInline` and
  `useMembersById` from erxes-ui, given `members={memberQueries}` from
  `@erxes/core-contract/client`. `src/modules/items/ItemsPage.tsx` has a member filter
  and a "Created by" column. erxes-ui's `EntityPicker` is the searchable list
  under them, for a picker of the plugin's own records.
- Pages look and behave like core's: follow the `ui-patterns` skill.
- Lists have core's bar (`src/modules/items/ItemsPage.tsx`): erxes-ui's `ViewBar` with
  `ListFilter`, given the list's fields and, for `member` fields, `members={memberQueries}`
  (a `tags` query for `tags` fields). It draws the bar itself, in erxes or on its own. Its conditions and search live in the
  address; `useListFilterParams()` hands them to the list's query, and the API
  applies them (`api/src/modules/items/itemFilter.ts`). No search boxes, toggle
  tabs or pickers in a row above the table. Give both the record type
  (`recordType={ITEM_TYPE}`): in erxes the bar then shows the member's saved
  views as tabs, and the filter offers to save one, as on core's customers.
- Records open in core's side panel, like a customer: core draws the panel and
  `CONFIG.recordTypes` (`src/config.tsx`) fills its slots, the item's `Title`,
  `Detail` and `New` (`src/modules/items/ItemPanel.tsx`). `useOpenRecord()`
  opens them, and `/__id__/:id` renders erxes-ui's `RecordPage` for the expanded
  record. A plugin's records of other records' customers are `relationTabs`
  (the `ui-patterns` skill). Forms are core's
  `PanelFormRow` rows with Cancel and Save at the bottom; nothing saves until
  Save. Dialogs are for confirmations, not forms.
- Text uses `t(key, 'English default')` from `react-i18next`.
- Development: `pnpm dev:ui` serves `http://localhost:__uiPort__/remoteEntry.js`;
  web loads it from the manifest's `UI_ENTRY_URL` or from its own
  `PUBLIC_PLUGINS=__id___ui@http://localhost:__uiPort__/remoteEntry.js`.
