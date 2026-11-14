# ui

The Module Federation remote `__id___ui`. web loads `./config` (`CONFIG`)
and renders `./__id__` (the `__Pascal__` export) under `/__id__/*`.

- `rsbuild.config.ts` declares web's shared singletons with `import: false`,
  reading the list from `erxes-ui/federation`, so it follows the installed
  erxes-ui. A missing name bundles a second copy and breaks at runtime.
- Build pages from `erxes-ui` components and its root export only. The host
  provides React, the router, the query client and erxes-ui; web's CSS
  styles them, so use Tailwind classes web already uses.
- Data goes through `src/orpc.ts`: `useQuery(orpc.items.list.queryOptions(...))`,
  `useMutation(orpc.items.create.mutationOptions(...))`. Types come from
  `api/src/router.ts`; after a mutation, invalidate `orpc.<group>.key()`.
- Text uses `t(key, 'English default')` from `react-i18next`.
- Development: `pnpm dev:ui` serves `http://localhost:__uiPort__/remoteEntry.js`;
  web loads it from the manifest's `UI_ENTRY_URL` or from its own
  `PUBLIC_PLUGINS=__id___ui@http://localhost:__uiPort__/remoteEntry.js`.
