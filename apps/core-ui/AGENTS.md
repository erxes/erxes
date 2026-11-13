# core-ui

The core React app (React 19 with the compiler, Rsbuild, React Query) and the Module Federation host for plugin UIs.

## Layout

- `src/main.tsx` only imports `src/bootstrap.tsx`: that async boundary lets Module Federation agree
  on shared libraries before anything runs.
- `src/modules/<feature>/` holds a feature's pages, components and hooks (`useTags.ts`). Only
  cross-feature parts live in `src/components` and `src/lib`.
- `src/lib/api.ts` is the typed contract client as TanStack Query utils `orpc`, plus
  `isApiError(error, code)`, `errorData(error, schema)` and `messageOf(error)`.
- `src/lib/cursorList.ts` reads keyset lists (`useCursorList`) into `RecordTable.CursorProvider`.
- `src/modules/plugins/usePlugins.ts` loads plugin UIs from the installed plugins' manifests (`ui`,
  `GET /plugins`), plus `PUBLIC_PLUGINS` for development (`<remote>@<remoteEntry url>`,
  comma-separated, parsed in `remotes.ts`; it wins for the same remote).
- `src/bootstrap.tsx` gives erxes-ui the plugin runtime (`setPluginRuntime`): plugin UIs call their
  own API with a per-plugin session token (`pluginFetch`) and hear their live signals
  (`useLiveSignal`, fed by `pluginLive` in `src/lib/live.ts`).

## Rules

- Call core through `orpc` from `~/lib/api`: `useQuery(orpc.tags.list.queryOptions({ input }))`,
  `useMutation(orpc.tags.create.mutationOptions({ onSuccess }))`. Never write a `queryKey` by hand.
  Invalidate with `orpc.<group>.key()` (every query of the group) or `orpc.<group>.<proc>.key()`.
  A lookup used in many places (the active team) is one exported options factory, e.g.
  `activeMembersQuery()` in `src/lib/members.ts`, so it's one request and one cache entry.
- Every query's failure is shown: render through `<QueryState query={…}>` from
  `~/components/QueryState`, or read `isError` yourself. A failed request never renders as empty data.
  Every mutation has an error toast or inline message.
- Read error details with `isApiError` and `errorData`, never by casting `error.data`.
- Browser code never imports `@erxes/core-db`, `pg`, `drizzle-orm` or `node:*` (`no-restricted-imports`).
- The UI follows old core-ui: the top bar (`CoreTab`), one `AppLayout` sidebar per app, pages from
  `PageContainer`, `PageHeader`, `Filter` and `RecordTable`. Reuse erxes-ui parts before writing new ones.
- `SHARED` in `rsbuild.config.ts` lists the singletons plugin UIs expect from the host. Plugins
  declare them with `import: false`, so the names stay and the host provides each one. Core has no
  GraphQL, so `@apollo/client` is not shared: a plugin UI that still imports it fails to load.
- A plugin's `./config` exports `CONFIG` (`name`, `path`, `icon`, `modules`). Its first module
  renders under `/<path>/*`.
- React compiler rules run at error: derive state while rendering, reset with a `key`, `void` a
  promise only when nothing waits for it.

## Check

`pnpm check` and `pnpm build`. For a visible change, follow `.agents/skills/verify-feature/SKILL.md`
and say what you saw in the browser.

`pnpm build` fails when a route's gzipped JS goes over its budget in `bundleBudget.ts`, or when a
chunk holds drizzle or a `packages/db` module other than `enums.ts`. That happens when a value comes
from a contract module built on a table: import it from `values.ts` (`packages/contract/AGENTS.md`),
and keep `coreContract` an `import type`; `src/lib/api.ts` passes `coreRoutes` to `OpenAPILink`. erxes-ui is
one shared chunk every route loads, so a heavy part of it loads on first use (`LazyEditor.tsx`).
For a speed change, measure before and after: `pnpm --filter @erxes/core-ui perf:seed` fills an
empty org, and `perf` times interactions and route loads against a production build
(`UI_URL`, `EMAIL`, `PASSWORD`, `CHROME`; see `e2e/perf/measure.ts`).
