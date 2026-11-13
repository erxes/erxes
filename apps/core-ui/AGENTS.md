# core-ui

The core React app (React 19 with the compiler, Rsbuild, React Query) and the Module Federation host for plugin UIs.

- `src/modules/<feature>/` holds a feature's pages, components and hooks (`useTags.ts`). Only
  cross-feature parts live in `src/components` and `src/lib`.
- `src/main.tsx` only imports `src/bootstrap.tsx`: that async boundary lets Module Federation agree
  on shared libraries before anything runs.
- Call core through `orpc` from `~/lib/api`: `useQuery(orpc.tags.list.queryOptions({ input }))`,
  `useMutation(orpc.tags.create.mutationOptions({ onSuccess }))`. The contract makes every query
  key: invalidate with `orpc.<group>.key()` or `orpc.<group>.<proc>.key()`. A lookup used in many
  places is one exported options factory (`activeMembersQuery()` in `src/lib/members.ts`).
- Keyset lists read through `useCursorList` (`src/lib/cursorList.ts`) into `RecordTable.CursorProvider`.
- Every query's failure is shown: render through `<QueryState query={…}>` from
  `~/components/QueryState`, or read `isError`. Every mutation has an error toast or inline message.
- Read error details with `isApiError(error, code)` and `errorData(error, schema)` from `~/lib/api`.
- The UI follows old core-ui: the top bar (`CoreTab`), one `AppLayout` sidebar per app, pages from
  `PageContainer`, `PageHeader`, `Filter` and `RecordTable`. Reuse erxes-ui parts before writing new ones.
- `pnpm build` fails on a route over its JS budget or a server module in a browser chunk; the
  message says the fix. For a visible change, follow `.agents/skills/verify-feature/SKILL.md`.
