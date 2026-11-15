# ui

The Module Federation remote `__id___ui`. web loads `./config` (`CONFIG`)
and renders `./__id__` (the `__Pascal__` export) under `/__id__/*`.

- `rsbuild.config.ts` declares web's shared singletons with `import: false`,
  reading the list from `erxes-ui/federation`, so it follows the installed
  erxes-ui. A missing name bundles a second copy and breaks at runtime.
- Build pages from `erxes-ui` components and its root export. The host provides
  React, the router, the query client and erxes-ui, and web's stylesheet styles
  erxes-ui's components.
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
  `@erxes/core-contract/client`. `src/items/ItemsPage.tsx` has a "Created by"
  column and filter. erxes-ui's `EntityPicker` is the searchable list
  under them, for a picker of the plugin's own records.
- Pages look and behave like core's: follow the `ui-patterns` skill.
- Lists filter the way core's contacts lists do (`src/items/ItemsFilter.tsx`):
  one bar under the header, built from erxes-ui's `Filter`. The filter button
  opens a menu with search and every field. Each applied filter shows as a chip:
  its value reopens that field's menu and ✕ clears it. Filters live in the
  address (search is `searchValue`), so links and reloads keep them. No search
  boxes, toggle tabs or pickers in a row above the table.
- Forms open in the side panel, laid out like core's new-record panel
  (`src/items/ItemSheet.tsx`): an erxes-ui `Sheet`, one row per field with its
  icon and label beside the control, and Cancel and Save at the bottom. Nothing
  saves until Save. A form gets its own page only when it has sections or a live
  preview, such as a product editor. Dialogs are for confirmations, not forms.
- Text uses `t(key, 'English default')` from `react-i18next`.
- Development: `pnpm dev:ui` serves `http://localhost:__uiPort__/remoteEntry.js`;
  web loads it from the manifest's `UI_ENTRY_URL` or from its own
  `PUBLIC_PLUGINS=__id___ui@http://localhost:__uiPort__/remoteEntry.js`.
