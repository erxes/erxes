# Playwright Fixtures for Sales

> How to seed test data inside a Playwright spec so tests run without manual prep. Required by Phase 6 VERIFY — no `test.skip(true, 'pending seeded deal')` cop-outs.

## Why fixtures live in the test, not "somewhere"

A Playwright spec is the **executable contract** for a wish. If it depends on data that someone else has to set up, it's not a contract — it's a hope. The test seeds what it needs, exercises the user-visible flow, asserts the outcome, and tears down. Idempotent. Runnable by anyone with the stack up.

## The minimum stack assumption

The spec assumes:
- `pnpm dev:apis` is running (gateway + core-api + sales_api)
- `pnpm dev:uis` is running (core-ui + sales_ui)
- A test subdomain exists with an authenticated test user

That's it. No seeded boards, pipelines, deals, or anything else.

## Authenticated GraphQL request from a Playwright spec

```ts
import { test, expect, type APIRequestContext } from '@playwright/test';

const GATEWAY = process.env.AGENT_TEST_API_URL ?? 'http://localhost:4000';

async function graphql<T>(
  request: APIRequestContext,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await request.post(`${GATEWAY}/graphql`, {
    data: { query, variables },
    // Cookie-jar auth: storageState in playwright.config provides auth-token
  });
  const body = await res.json();
  if (body.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(body.errors)}`);
  }
  return body.data as T;
}
```

(For auth setup, see the existing `playwright.config.ts` `use.storageState` pattern. If a test absolutely needs login before storageState is wired, that's the one acceptable skip — referencing a blocking wish in the message.)

## Seeding a Deal end-to-end

```ts
test.describe('Deal riskLevel', () => {
  let boardId: string;
  let pipelineId: string;
  let stageId: string;
  let dealId: string;

  test.beforeAll(async ({ request }) => {
    const board = await graphql<{ salesBoardsAdd: { _id: string } }>(
      request,
      `mutation($name: String!, $type: String!) {
         salesBoardsAdd(name: $name, type: $type) { _id }
       }`,
      { name: 'agent-test-board', type: 'deal' },
    );
    boardId = board.salesBoardsAdd._id;

    const pipeline = await graphql<{ salesPipelinesAdd: { _id: string } }>(
      request,
      `mutation($name: String!, $boardId: String!, $type: String!) {
         salesPipelinesAdd(name: $name, boardId: $boardId, type: $type) { _id }
       }`,
      { name: 'agent-test-pipeline', boardId, type: 'deal' },
    );
    pipelineId = pipeline.salesPipelinesAdd._id;

    const stage = await graphql<{ salesStagesAdd: { _id: string } }>(
      request,
      `mutation($name: String!, $pipelineId: String!, $type: String!) {
         salesStagesAdd(name: $name, pipelineId: $pipelineId, type: $type) { _id }
       }`,
      { name: 'agent-test-stage', pipelineId, type: 'deal' },
    );
    stageId = stage.salesStagesAdd._id;

    const deal = await graphql<{ dealsAdd: { _id: string } }>(
      request,
      `mutation($name: String, $stageId: String) {
         dealsAdd(name: $name, stageId: $stageId) { _id }
       }`,
      { name: 'agent-test-deal', stageId },
    );
    dealId = deal.dealsAdd._id;
  });

  test.afterAll(async ({ request }) => {
    if (dealId) {
      await graphql(request, `mutation($_id: String!) { dealsRemove(_id: $_id) { _id } }`, { _id: dealId });
    }
    if (stageId) {
      await graphql(request, `mutation($_id: String!) { salesStagesRemove(_id: $_id) { _id } }`, { _id: stageId });
    }
    if (pipelineId) {
      await graphql(request, `mutation($_id: String!) { salesPipelinesRemove(_id: $_id) { _id } }`, { _id: pipelineId });
    }
    if (boardId) {
      await graphql(request, `mutation($_id: String!) { salesBoardsRemove(_id: $_id) { _id } }`, { _id: boardId });
    }
  });

  test('riskLevel persists after save', async ({ page, request }) => {
    await page.goto(`/sales/deals/board/${boardId}/pipeline/${pipelineId}/${dealId}`);

    await page.getByLabel('Risk level').click();
    await page.getByRole('option', { name: 'high' }).click();

    // Wait for the optimistic update to confirm
    await expect(page.getByLabel('Risk level')).toHaveText('high');

    // Reload and confirm persistence
    await page.reload();
    await expect(page.getByLabel('Risk level')).toHaveText('high');
  });
});
```

## When to extract a fixture helper

If three or more specs need the same seed sequence, extract into `.agents/plugins/sales/tests/fixtures.ts`:

```ts
export async function seedDeal(request: APIRequestContext, opts: {
  boardName?: string;
  dealName?: string;
}): Promise<{ boardId: string; pipelineId: string; stageId: string; dealId: string }>;

export async function cleanupDeal(request: APIRequestContext, ids: {
  boardId: string; pipelineId: string; stageId: string; dealId: string;
}): Promise<void>;
```

**Don't extract for one caller.** That's premature abstraction — see SLOP-CHECKLIST.md.

## What's NOT acceptable

```ts
// ❌ slop
test.skip(true, 'pending seeded deal');
test.skip(true, 'requires manual setup');
test.skip(true, 'TODO: add fixtures');
```

Acceptable only if a blocking wish exists:

```ts
// ✓ acceptable
test.skip(true, 'BLOCKED on wish 2026-06-01-test-auth-fixture — see .agents/wishes/');
```

## Running the spec

```bash
# With local stack
pnpm dev:apis &
pnpm dev:uis &

# From .agents/ (after pnpm install --ignore-workspace)
AGENT_TEST_LIVE=1 pnpm test plugins/sales/tests/deals.spec.ts
```

The `AGENT_TEST_LIVE=1` gate keeps tests that need a live stack from running in CI without one. The default (no env var) skips them with a clear "requires live stack" message — different from "pending seeded deal," because the gate IS the path to un-skip (start the stack).

## Cleanup discipline

Tests must clean up even when they fail mid-run. Use `test.afterAll` with null-guards on every id. A test that leaves orphan boards/pipelines pollutes the next run and the next developer.

## Subdomain isolation

Tests run against the configured test subdomain. Names should include `agent-test-` prefix so it's obvious which records came from automation. Periodically purge with a simple cleanup script targeting that prefix.
