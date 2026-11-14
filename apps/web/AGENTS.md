# web

The core React app (React 19 with the compiler, Rsbuild, React Query) and the Module Federation host for plugin UIs.

- `src/modules/<feature>/` holds a feature's pages, components and hooks (`useTags.ts`). Only
  cross-feature parts live in `src/components` and `src/lib`.
- `src/main.tsx` only imports `src/bootstrap.tsx`: that async boundary lets Module Federation agree
  on shared libraries before anything runs.
- Call core through `orpc` from `@erxes/core-contract/client`, the client plugin UIs use too: `useQuery(orpc.tags.list.queryOptions({ input }))`,
  `useMutation(orpc.tags.create.mutationOptions({ onSuccess }))`. The contract makes every query
  key: invalidate with `orpc.<group>.key()` or `orpc.<group>.<proc>.key()`. A lookup used in many
  places is one exported options factory (`memberQueries` in `@erxes/core-contract/client`, which erxes-ui's `SelectMember`, `MemberInline` and `useMembersById` take).
- Keyset lists read through `useCursorList` (`src/lib/cursorList.ts`) into `CursorRecordTable`
  (`src/components`). Record pickers are lists in erxes-ui's `EntityPicker`, empty states are
  erxes-ui's `Empty`, sortable lists take `useSortSensors()`.
- `vp run check` fails on any copy of 80 tokens or more in apps/web or erxes-ui (jscpd,
  `.jscpd.json`): move the shared part into one component or function.
- One way each, enforced by lint: addresses from `paths` (`src/lib/paths.ts`), dates and numbers
  through erxes-ui's `useFormat()`, browser storage through erxes-ui's `stored()`, URL query
  state through nuqs, shortcuts through `usePageHotkey`. The format and storage rules come from
  @erxes/lint, so plugin UIs follow them too.
- Every query's failure is shown: render through `<QueryState query={…}>` from
  `~/components/QueryState`, or read `isError`. Every mutation has an error toast or inline message.
- Branch on an error by its code with `isApiError(error, code)` from `@erxes/core-contract/client`.
  It narrows `error.data` to the shape `ERRORS` declares for the code (`TAKEN` gives
  `error.data.field`), so never match on `message` or `status`.
- The UI follows old core-ui: the top bar (`CoreTab`), one `AppLayout` sidebar per app, pages from
  `PageContainer`, `PageHeader`, `Filter` and `RecordTable`. Reuse erxes-ui parts before writing new ones.
- `pnpm build` fails on a route over its JS budget or a server module in a browser chunk; the
  message says the fix. For a visible change, follow `.agents/skills/verify-feature/SKILL.md`.
