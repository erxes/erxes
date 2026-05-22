# Wish: Build test-fixture seeder for Playwright specs

**ID:** `2026-05-22-test-fixture-seeder`
**Created:** 2026-05-22
**Status:** captured (blocking other wishes; not yet planned)

## Original wish

> Build the test-fixture infrastructure that `.agents/plugins/sales/tests/*.spec.ts` need in order to seed boards / pipelines / stages / deals via the GraphQL API and tear them down idempotently. Without this, every Sales acceptance test that requires real data must be `test.skip(true, '<reason>')` — which is exactly the slop pattern logged in `memory/lessons.md` (`2026-05-22 — Phase 6 VERIFY allowed test.skip cop-outs`).

## Clarifying questions (and answers)

This wish was discovered during Phase 6 of `2026-05-22-deal-confidence-score`. It is **captured but not yet routed/planned**.

Open questions (to be resolved when this wish is picked up):

1. **Admin credentials for tests.** How does a Playwright spec authenticate? Options:
   - Seed a deterministic test user via a one-shot Mongo script in a global setup file
   - Hard-code dev-only credentials (env vars), with the dev/CI environment pre-provisioning the user
   - Add a test-only auth bypass (e.g. `AGENT_TEST_AUTH=token` header that mints a session for a fixed test user) — only enabled in non-production builds
2. **Multi-tenancy in test environment.** How does the test pick a subdomain? `generateModels(subdomain)` is the contract; the dev environment likely defaults to one tenant but this needs to be confirmed.
3. **Endpoint URL.** Gateway is `http://localhost:4000/graphql`. Direct plugin calls aren't authenticated against the gateway's RBAC, so all writes must go through the gateway.
4. **Teardown strategy.** Per-test `afterAll` cleanup vs a shared cleanup script. Sales doesn't have a "remove board recursively" mutation — `salesBoardRemove` and friends may exist but cascade behavior must be verified.

## Disambiguated intent

Build a `.agents/test-utils/` (name TBD) module exporting:

- `authenticateAdmin()` → returns a session cookie / token usable on every subsequent request
- `graphql<T>(query, variables)` → minimal GraphQL client (no Apollo dependency)
- `seedBoardPipelineStage()` → returns `{ boardId, pipelineId, stageId }`, idempotent
- `seedDeal({ stageId, ...overrides })` → returns `{ dealId, ...fields }`
- `teardownBoard(boardId)` → recursively archives/removes everything created

Then update every existing `test.skip(true, 'requires seeded ...')` in `.agents/plugins/sales/tests/*.spec.ts` to use the seeder, dropping the skip.

## Routing

_To be filled when this wish is picked up._

## Out-of-scope (for the blocking wish referencing this)

This wish itself defines what's in scope. **This wish is currently in "captured" status only — its existence unblocks the named-skip references in other specs but does not commit to a delivery date.**

## Notes

- **Why this is its own wish:** discovered during `2026-05-22-deal-confidence-score` Phase 6. Building it inline would have ballooned that wish from ~190 LOC of production code to 500-700 LOC including test infrastructure — and would have required credentials/env data the developer didn't have at hand.
- **Lesson reference:** `memory/lessons.md` § `2026-05-22 — Phase 6 VERIFY allowed test.skip cop-outs` — the existence of *this* wish is what makes the named-skip escape hatch in `WORKFLOW.md` Phase 6 legitimate rather than a cop-out.
- **What "BLOCKED on wish 2026-05-22-test-fixture-seeder" means in other specs:** an acceptance criterion requires a seeded board/pipeline/stage/deal. The test is intentionally skipped today; un-skipping is the entire deliverable of this wish.
