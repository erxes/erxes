# add frontline segment field

> **When to use:** the wish makes an existing Ticket field filterable in the segment builder — e.g., "I want to build a segment of tickets where `priority` is `high`," or "let me filter by `closeDate < today`." The field must already exist (or be added first via [`./add-ticket-field.md`](./add-ticket-field.md)).

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Closest sisters (all in `backend/plugins/frontline_api/src/modules/frontline/meta/segments/`):

| Sister | Shape | Where |
|---|---|---|
| `stageProbability` propertyName extension | shows how a virtual/derived property becomes a filter clause | `segments.ts` lines 48–66 |
| `productsData.productId` / `productsData.categoryId` extension | shows how a nested-array path becomes filterable | `segments.ts` lines 68–84 + `utils.ts` `generateProductsCategoryProductIds` |
| dependent-module associations (`core`, `frontline`, `operation`, `cars`) | two-way segment joins | `segmentConfigs.ts` lines 3–21 |

**Read these files in full** before writing any code:

- `backend/plugins/frontline_api/src/modules/frontline/meta/segments/segmentConfigs.ts` — `dependentModules` + `contentTypes` registry (the static config)
- `backend/plugins/frontline_api/src/modules/frontline/meta/segments/segments.ts` — `propertyConditionExtender`, `associationFilter`, `initialSelector` (the dynamic resolution)
- `backend/plugins/frontline_api/src/modules/frontline/meta/segments/utils.ts` — helpers like `generateConditionStageIds` and `generateProductsCategoryProductIds`
- `backend/plugins/frontline_api/src/modules/frontline/fieldUtils.ts` `generateFrontlineFields()` — how Ticket Mongoose schema paths become the field picker in the segment builder
- `backend/plugins/frontline_api/src/modules/frontline/db/definitions/tickets.ts` — verify the field exists with `esType` for ES-backed filtering
- [`../../docs/frontline/data-model.md`](../../docs/frontline/data-model.md) "Segment content type" — the contract frontline has with the segments service

## Phase 4 — PLAN

Three plan shapes depending on the field's nature. Pick one.

### Plan A — plain scalar already on Ticket (string/number/date) the schema indexes for ES

Most fields are auto-discovered by `generateFrontlineFields` via `models.Tickets.schema`. If the field has `esType:` on its schema definition, **no segments code change is needed** — the field will appear in the picker, and the segments service queries Elasticsearch via the `tickets` index.

1. **add `esType:` to the schema path** if missing — files: `backend/plugins/frontline_api/src/modules/frontline/db/definitions/tickets.ts`
2. **playwright spec asserts the field shows up in the segment picker** — files: `.agents/plugins/frontline/tests/tickets.spec.ts`

### Plan B — derived / virtual property (like `stageProbability`)

The field doesn't live directly on Ticket but is computed from a related entity (Stage, Pipeline, Product, …).

1. **add a branch to `propertyConditionExtender`** — files: `meta/segments/segments.ts`
2. **(if it needs helper data) add helper to `utils.ts`** — files: `meta/segments/utils.ts`
3. **register the property in the segment field picker** — files: `meta/segments/segmentConfigs.ts` or extend `generateFrontlineFields` in `fieldUtils.ts`
4. **playwright spec asserts the field is selectable in the segment builder UI**

### Plan C — nested array path (like `productsData.productId`)

1. **add branch to `propertyConditionExtender`** that builds an ES `bool.should` query — mirror lines 68–84 of `segments.ts`
2. **add helper to `utils.ts`** if extra DB lookups are needed (mirror `generateProductsCategoryProductIds`)
3. **playwright spec**

## Phase 5 — IMPLEMENT (step-by-step)

1. **Audit first.** Open the segment builder UI (`/segments`) and check if the field already appears for the `Ticket` content type. If yes, you're done — segment fields auto-discover from the Mongoose schema via `generateFrontlineFields`. Skip to Phase 6.
2. **If not auto-discovered**, the field probably lacks `esType:` on its schema path. Add `esType: 'keyword'` (strings, enums, IDs), `'number'` (numerics), `'date'` (dates), `'boolean'` (bools). Restart `frontline_api` so the schema is re-indexed in ES on next reindex.
3. **Derived field (Plan B)** — add a `if (condition.propertyName === '<yourField>')` branch to `propertyConditionExtender`. Build an ES `terms` / `range` / `bool` query and return `{ data: { positive, ignoreThisPostiveQuery: true }, status: 'success' }`. The flag tells the segments engine "the framework's default positive query for this property is wrong; use mine."
4. **Nested-array field (Plan C)** — same shape as Plan B but build a `bool.should` of `match` clauses. Mirror lines 68–84 of `segments.ts`.
5. **Make the field discoverable** — `generateFrontlineFields` reads from `models.Tickets.schema`, so derived fields need to be injected somewhere. Pattern: extend the `fields` array in `generateFrontlineFields` (see `fieldUtils.ts` line 178+) with a synthetic descriptor `{ _id, name, label, type, selectOptions? }`. Mirror the `createdByOptions` block at line 236.
6. Run `.agents/evals/run.sh frontline --backend-only`. Exit 0.
7. For Plan A you also need an Elasticsearch reindex of `tickets` if the index pre-dates the new `esType:`. Check with the platform team — this is sometimes a deployment step, not a code change.

## Phase 6 — VERIFY

Add to `.agents/plugins/frontline/tests/tickets.spec.ts` (or `segments.spec.ts` if it exists):

- a test that navigates to the segment builder for frontline:ticket and asserts the new field appears in the field picker
- a test that builds a one-condition segment using the new field and asserts the filtered ticket list reflects the condition (skip with documented reason if seeding isn't wired)

Run: `cd .agents && pnpm test plugins/frontline/tests/tickets.spec.ts`

## Pitfalls (specific to this skill)

- **Adding a field to `tickets.ts` schema is not enough to make it segmentable.** Segments live in Elasticsearch index `tickets`. Without `esType:`, the field isn't indexed and ES filters return empty. See `db/definitions/tickets.ts` lines 70–76 (`closeDate` correctly declares `esType: 'date'`).
- `generateFrontlineFields` ([`fieldUtils.ts`](#) line 178+) walks `models.Tickets.schema.paths`. Nested sub-schemas (`productsData[]`) are walked separately. If your field is `productsData.priority`, it appears as a `productsData.priority` path automatically — you don't need to add it to `segments.ts` for simple terms filters.
- `propertyConditionExtender` returns one positive query at a time. If two conditions exist (e.g., the user filters by both stage and product), the segments engine ANDs them. Do not OR them inside your handler.
- The `ignoreThisPostiveQuery: true` flag is **critical**: without it, the segments engine builds its own default `match` clause on top of yours and the query becomes nonsense.
- ES index lag: after deploying a schema change, existing docs are not re-indexed. New documents reflect the change; old ones don't. Coordinate a reindex.
- For two-way segment associations (e.g., "tickets related to a Task"), update `segmentConfigs.dependentModules` — but that's a different shape than per-field. Use [`./add-frontline-graphql-query.md`](./add-frontline-graphql-query.md) if cross-plugin reads are the real wish.

## Slop check before declaring done

- [ ] Re-read [`../../SLOP-CHECKLIST.md`](../../SLOP-CHECKLIST.md)
- [ ] No new helper file just to wrap one ES query (extend `segments.ts` directly until a real second caller exists)
- [ ] No `esType:` value that contradicts the JS type (`'date'` on a `String`, etc.)
- [ ] No new dependent-module entry in `segmentConfigs.ts` unless the wish is genuinely cross-plugin
- [ ] No swallowed error in `propertyConditionExtender` — let the segments engine see failures so the user gets a real message
