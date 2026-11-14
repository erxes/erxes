# __title__

__description__

An erxes plugin for the new core (Postgres). `api/` is the API: Express 5,
oRPC and Drizzle. `ui/` is the Module Federation remote web loads. Read the
`AGENTS.md` in the folder you edit. `api/src/modules/items` and `ui/src/items`
are the reference feature: copy their shape for a new one.

<!-- quality:start -->
<!-- quality:end -->

## This repo

- `vp run check` runs the escape guard, format, lint, types, knip, the docs guard
  and `pnpm check:generated`, which compares the migrations with the schema.
- Other gates: `vp run test` on real Postgres via `DATA_TEST_URL`,
  `pnpm check:rls`, `pnpm build`. `vp run fix` formats and fixes lint.
- Core finds the plugin by these names, so they stay fixed: plugin `__id__`,
  remote `__id___ui` exposing `./config` and `./__id__`, pages under `/__id__/*`.
- Every table, index and constraint starts with `__id___`, and every table has
  `org_id` with forced row-level security, or is listed in `tools/no-org-id.sql`
  with the reason. Core and other plugins share the database. [pnpm check:rls]
- The lint rules are `@erxes/lint`'s preset (`vite.config.ts`). It,
  `tools/test/no-skips.ts` and `tools/check-rls.sql` come from core unchanged, as
  does the quality section above. Change them in core.
- The API reaches core through `@erxes/plugin-sdk` (`api/src/core.ts`), the UI
  through `@erxes/core-contract/client` with the member's session. Neither reads
  `core_*` tables or imports core's app code.
- Members are signed in by core: the UI sends a session token, the API checks it
  with `verifyPluginSession`. There is no public route yet, because core can't
  tell a public request's organisation.
- Skills in `.agents/skills/`: `endpoint` for a procedure, `schema-change` for a
  table or column, `verify` before calling a change done.__migrationSkill__
- What core promises plugins, and what counts as a breaking change, is core's
  `plugin-contract` skill (erxes repo, branch `postgre`).
