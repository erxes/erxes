---
name: plugin-migrate
description: Port the old erxes plugin this repo was made from onto the new core. Use when working through MIGRATION.md, porting a module, or when someone asks how far the migration is.
---

The port keeps every feature the old plugin had and fixes its architecture.
Port what each feature does, never its code: where the old plugin got
something wrong (a missing check, a race, a workaround for the old core), the
new one does it right.

`MIGRATION.md` lists everything the old plugin did, one section per module.
`migration/inventory.json` holds the raw facts behind it, and
`migration/core-map.ts` says what each old core call becomes. Use synthetic
data only. The inventory reads code, never a database.

1. Read `MIGRATION.md`. Port the module with the fewest unticked items first;
   `Plugin-wide` goes last.
2. Tables. Move the module's tables from `migration/schema-draft.ts` into
   `api/src/db/schema.ts`, then follow the `schema-change` skill. Fix the draft
   types while moving: whole numbers become `integer()`, fixed string sets
   become `text({ enum })`, required ids stay `text().notNull()`, and a value
   the old code kept unique by checking first gets a unique index. Drop
   columns nothing reads. Update the table's entry in
   `migration/import-map.ts` to match.
3. Procedures. One per GraphQL operation listed, following the `endpoint`
   skill and shaped like `api/src/modules/items`. Name it after what it does
   (`tasks.list`, not `getTasks`), and fold operations that only differ by
   filter into one input. A failure the UI acts on gets a typed error. An
   operation the new UI never calls is ticked with no procedure.
4. Core calls. Do what the arrow says: `sdk` is
   `core.forOrg(orgId).<procedure>` in the API with that scope in
   `manifest.scopes`; `contract` is a call from the UI with the member's own
   session; `plugin-owned` lives in this plugin's tables or code.
5. Pages. One per UI route, under `ui/src/<module>/`, built from `erxes-ui`
   the way `ui/src/items/` is. The old `ui-modules` components don't exist
   here: erxes-ui's old-to-new component table, `packages/ui/MIGRATION.md` in
   the erxes repo (branch `postgre`), says what replaces each one.
6. Check parity in the browser, following the `verify` skill: open the old
   page and the new one side by side, and walk the same actions on both.
7. Tick an item once it works on the new core and its old bugs and
   workarounds are gone. When an item needs something core doesn't offer
   (marked **gap**, or one you find), file an issue in the plugin's repo that
   says what the old plugin did and what core would need, tick the item and
   end its line with `(filed <issue url>)`. The feature waits for core.
8. Commit the module: schema, migration, procedures, page and the ticks
   together.
9. Copy data once all modules are in: `pnpm migrate:import` with `MONGO_URL`,
   `DATA_URL` and `ORG_ID` set. Its `Skipped` list must be empty or explained.

Rerun `pnpm migrate:inventory` and `pnpm migrate:checklist` only to pick up
new old-side code; ticks survive the rerun.

Done when every item in `MIGRATION.md` is ticked, each gap with its issue
link, and `vp run check`, `vp run test`, `pnpm check:rls` and `pnpm build` pass.
