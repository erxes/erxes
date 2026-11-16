---
name: plugin-migrate
description: Port the old erxes plugin this repo was made from onto the new core. Use when working through MIGRATION.md, porting a module, or when someone asks how far the migration is.
---

We're rewriting to fix the architecture. A port that carries over the old
bugs, tech debt and workarounds wasted the rewrite. Once customer data is in,
big changes get hard, so give each table and screen its long-term shape the
first time.

Every old feature stays. Port what it does, never its code. Where the old
plugin got something wrong, such as a missing check, a race or a workaround
for the old core, the new one does it right.

If scaffolding skipped installation, first run `pnpm migrate:inventory -- --from <old-checkout> --plugin <old-plugin> --ref <ref>`
and `pnpm migrate:checklist`. These commands generate the port's working files:

```text
MIGRATION.md                Checklist, one section per old module
migration/inventory.json   Code inventory behind the checklist
migration/schema-draft.ts  Draft tables to port
```

`migration/core-map.ts` says what each old core call becomes. Use synthetic
data only. The inventory reads code, never a database.

## Never carry these over

| Old                                                    | New                                                                                             |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `subdomain` passed around, org filters written by hand | The org comes from the token, and row level security scopes every query.                        |
| Row mappers that reshape query results                 | The procedure's `.output()` picks the row's fields. A value the row lacks comes from the query. |
| String errors the UI matches on                        | A typed oRPC error for each failure the UI acts on.                                             |
| `console` calls                                        | `api/src/logger.ts`, with the facts as fields.                                                  |
| Several writes per action outside one transaction      | One transaction per action.                                                                     |
| Uniqueness checked in code                             | A unique index that includes `org_id`.                                                          |
| Status strings compared across the code                | A `text({ enum })` column and one function that owns the allowed moves.                         |
| Branches on provider kind                              | One adapter interface. Shared code never names a provider.                                      |
| Per-provider copies of core data, such as customers    | Core owns customers and companies. The plugin stores their ids.                                 |
| Secrets in plain text, such as tokens and passwords    | Encrypted at rest, with the key read in `api/src/config.ts`.                                    |

## When core lacks something

Don't build around it. Check `migration/core-map.ts` and `@erxes/core-contract`
first. If core doesn't have it, file an issue in the plugin's repo that says
what the old plugin did and what core would need, and add a `DECISIONS.md`
row. Port the rest of the module. A workaround is never the answer, because
it needs a data migration once core ships the feature.

## Decisions

`DECISIONS.md` gets one row per difference from the old plugin, with Old, New
and Why: a fixed bug, a changed shape, a feature left out or waiting for core.
The row goes in the module's commit.

## Steps

1. Read the checklist. Port the module with the fewest unticked items first;
   `Plugin-wide` goes last.
2. Tables. Move the module's draft tables into
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
   The answer is the table's rows, flat, through the `.output()` the `endpoint` skill builds,
   not the old GraphQL type. Where the old type nested a reference (`contentType` with
   `contentTypeId`, `{ type, id }`), store and return the two columns (`referenceType`,
   `referenceId`). An old field resolver (`createdUser`, `stage`) becomes a join or subquery
   in the `select`, or the UI's own lookup (`MemberInline` for members), never a mapper after
   the query.
4. Core calls. Do what the arrow says: `sdk` is
   `core.forOrg(orgId).<procedure>` in the API with that scope in
   `manifest.scopes`; `contract` is a call from the UI with the member's own
   session, through `orpc` from `@erxes/core-contract/client` (members through
   erxes-ui's `SelectMember` and `MemberInline`, `ui/AGENTS.md`);
   `plugin-owned` lives in this plugin's tables or code; `drop` is left out on
   purpose (segments, the client portal, brands): port none of it, and tick it
   once nothing new calls it. Core has no departments or branches: a plugin
   that used them gets its own `__id___teams` and `__id___team_members`,
   drafted with their import from old core's `departments`, `branches` and the
   members' `departmentIds` and `branchIds`. The ids stay the same, so the old
   records' `departmentIds` still match.
5. Pages. One per UI route, under `ui/src/modules/<module>/`. No old screen
   is copied. The old screen shows what the feature does, and the new one
   follows core's screens through the `ui-patterns` skill and
   `ui/node_modules/erxes-ui/CATALOG.md`. The catalog's Pages table names the
   components and the screen to copy for each kind of page, and its other
   sections list what erxes-ui already has. Import those, never a copy of
   your own. A record with a status gets a list grouped by status,
   erxes-ui's `RecordList`. Member pickers and names become erxes-ui's
   `SelectMember` and `MemberInline`; a picker of other records is
   erxes-ui's `EntityPicker` over the plugin's own query. For erxes-ui
   components whose props changed, see its old-to-new table,
   `packages/ui/MIGRATION.md` in the erxes repo (branch `postgre`). A feature
   that's left out gets a `DECISIONS.md` row.
6. Check feature parity, not layout parity, in the browser with the `verify`
   skill. Every old action, field and filter must be reachable on the
   new page. Run at most 2 parity runs per module. Wording, spacing, order and
   colour go in the PR body as a list, never into another fix round. When the
   same failure happens twice, stop and report it with the output.
7. Tick an item once it works on the new core and its old bugs and
   workarounds are gone. When an item needs something core doesn't offer
   (marked **gap**, or one you find), follow "When core lacks something",
   tick the item and end its line with `(filed <issue url>)`. The feature
   waits for core.
8. Commit the module: schema, migration, procedures, pages, ticks and its
   `DECISIONS.md` rows together.
9. Copy data once all modules are in: `pnpm migrate:import` with `MONGO_URL`,
   `DATA_URL` and `ORG_ID` set. Its `Skipped` list must be empty or explained.

Rerun `pnpm migrate:inventory` and `pnpm migrate:checklist` only to pick up
new old-side code; ticks survive the rerun.

Done when every checklist item is ticked, each gap with its issue link and
decision row, and `vp run check`, `vp run test`, `pnpm check:rls` and
`pnpm build` pass.
