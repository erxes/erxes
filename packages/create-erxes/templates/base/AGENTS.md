# __title__

__description__

An erxes plugin for the new core (Postgres). `api/` is the API: Express 5,
oRPC and Drizzle. `ui/` is the Module Federation remote web loads. Read the
`AGENTS.md` in the folder you edit. `api/src/modules/items` and `ui/src/items`
are the reference feature: copy their shape for a new one.

<!-- quality:start -->
<!-- quality:end -->

## This repo

- Gates: `vp run check` (format, lint, types), `vp run test` (real Postgres via
  `DATA_TEST_URL`), `pnpm check:rls`, `pnpm build`. `vp run fix` formats and fixes lint.
- Two checks the section names aren't here yet, so their rules are `[review]`
  in this repo: knip, and `pnpm check:generated` (CI's migration drift check is
  the nearest).
- Core finds the plugin by these names, so they stay fixed: plugin `__id__`,
  remote `__id___ui` exposing `./config` and `./__id__`, pages under `/__id__/*`.
- Every table, index and constraint starts with `__id___`, and every table has
  `org_id` with forced row-level security, or is listed in `tools/no-org-id.sql`
  with the reason. Core and other plugins share the database. [pnpm check:rls]
- `tools/config/`, `tools/test/no-skips.ts` and `tools/check-rls.sql` come from
  core unchanged, as does the quality section above. Change them in core.
- The plugin reaches core only through `@erxes/plugin-sdk` (`api/src/core.ts`)
  and the UI's `pluginFetch`. It never reads `core_*` tables or imports core code.
- Members are signed in by core: the UI sends a session token, the API checks it
  with `verifyPluginSession`. There is no public route yet, because core can't
  tell a public request's organisation.
- Skills in `.agents/skills/`: `endpoint` for a procedure, `schema-change` for a
  table or column, `verify` before calling a change done.__migrationSkill__
- What core promises plugins, and what counts as a breaking change, is core's
  `plugin-contract` skill (erxes repo, branch `postgre`).
