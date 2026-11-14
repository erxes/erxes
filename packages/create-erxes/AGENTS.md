# create-erxes

The plugin CLI, `pnpm create erxes [dir]`. It asks one question first, a new plugin or a migrated
old one, then the name, title and description, and whether to install and `git init`. Every prompt
has a flag (`src/cli.ts`); `-y` takes the defaults.

- `templates/base` is a new plugin; `templates/migrate` is the migration kit laid over it, and its
  `package.json` holds only the scripts and dev dependencies it adds. `src/scaffold.ts` copies a
  layer, fills `__token__`s and renames `_gitignore`-style dotfiles, which npm would drop.
- The templates are not code until the names are filled in, so core's check skips them. The
  generated plugin's own `vp run check` lints them, in the e2e test.
- A plugin takes some files from core unchanged: `tools/check-rls.sql`, `tools/config/rules.ts`,
  `tools/config/budgets.ts`, `tools/test/no-skips.ts`, the quality section of the root `AGENTS.md`
  and the tenant functions from `packages/db/drizzle`. `scripts/templates.ts` copies them into
  `dist/templates` at build time, so `templates/` holds no copy. Change them in core.
- `src/__tests__/e2e.test.ts` packs nothing itself: CI's packages job packs core's packages and
  this one, then runs `vp test run --project create-erxes-e2e` with `CREATE_ERXES_PACKS` set to the
  tarballs. Each flow generates a plugin, points it at the tarballs and runs its `vp run check`,
  `vp run test`, `pnpm check:rls` and `pnpm build`.
