---
name: add-dummy-data
description: Add safe, idempotent erxes dummy, seed, demo, fixture, or sample data for backend plugins, core services, tests, or local development without changing production behavior. Use when Codex needs to create or update data loaders, seed commands, demo records, or test fixtures.
---

# Skill: Add Dummy Data

## Workflow

1. Confirm the data is for local development, demos, QA, tests, or explicitly
   requested sample data. Do not seed production by default.
2. Resolve the owning plugin, service, and module through `ROUTER.md` and
   `.agents/maps/feature-map.yaml`.
3. Search for nearby commands, migrations, tests, fixtures, factories, and
   model/static methods before adding a new data path.
4. Put persistent data scripts in the owner that already manages the data:
   usually `src/commands`, `src/migrations`, a module-local `migrations`
   folder, or `backend/saas-migrations` only when the task targets that runner.
5. Keep generated data small, deterministic, and clearly labeled as demo or
   sample data. Do not add `faker` or another dependency only for dummy data.
6. Avoid real personal data, credentials, tokens, production tenant names, and
   customer-identifying values. Use obviously fake domains like `example.com`.
7. Preserve tenant boundaries. Resolve org, brand, user, branch, department,
   pipeline, or team IDs from explicit env values or safe lookups instead of
   hardcoding production IDs.
8. Make writes idempotent. Prefer stable unique filters with `upsert`,
   `$setOnInsert`, guarded `$addToSet`, or skip-if-exists checks. If a schema
   has no sample marker field, do not add unsupported marker fields casually.
9. Use existing model/service APIs when they enforce business invariants. Use
   raw Mongo `bulkWrite` only when nearby standalone scripts use that pattern.
10. Add a dry-run or explicit write gate for scripts that can touch existing
    databases, such as `DRY_RUN=1` by default or `ADD_DUMMY_DATA=1` before
    writes.
11. For frontend or unit tests, keep fixtures local to the test or feature
    module unless there is an established shared test fixture location.
12. Validate the owning project with focused commands, usually
    `pnpm nx build <api-project>` for backend scripts and tests when fixture
    behavior changed.

## Important

- Dummy data is not a substitute for a missing backend feature. If the data
  shape requires schema or resolver changes, compose with `create-backend-entity`.
- If the script updates existing persisted data or is a one-off repair/backfill,
  compose with `create-backend-migration` and follow migration safety rules.
- Do not expose temporary public GraphQL mutations, routes, or admin UI just to
  insert dummy data.
- Keep cleanup expectations explicit. Either make reruns stable or add a
  scoped cleanup/reset path when the user asks for repeatable demo resets.
- Review the final diff for accidental fixture bloat, unrelated generated
  files, secrets, and production-looking values before finishing.
