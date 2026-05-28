# Playwright Fixtures for Frontline

> How to seed test data inside a Playwright spec so tests run without manual prep. Required by Phase 6 VERIFY.

## Seeding a Ticket end-to-end

Tickets reside in pipelines and boards, similar to Deals, but are linked to Channels and Statuses:

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
  });
  const body = await res.json();
  if (body.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(body.errors)}`);
  }
  return body.data as T;
}

test.describe('Ticket priority', () => {
  let channelId: string;
  let pipelineId: string;
  let statusId: string;
  let ticketId: string;

  test.beforeAll(async ({ request }) => {
    // 1. Create a channel
    const channel = await graphql<{ channelsAdd: { _id: string } }>(
      request,
      `mutation($name: String!) {
         channelsAdd(name: $name) { _id }
       }`,
      { name: 'agent-test-channel' },
    );
    channelId = channel.channelsAdd._id;

    // 2. Create a pipeline
    const pipeline = await graphql<{ pipelinesAdd: { _id: string } }>(
      request,
      `mutation($name: String!, $channelId: String!) {
         pipelinesAdd(name: $name, channelId: $channelId) { _id }
       }`,
      { name: 'agent-test-pipeline', channelId },
    );
    pipelineId = pipeline.pipelinesAdd._id;

    // 3. Create a status
    const status = await graphql<{ statusesAdd: { _id: string } }>(
      request,
      `mutation($name: String!, $pipelineId: String!) {
         statusesAdd(name: $name, pipelineId: $pipelineId) { _id }
       }`,
      { name: 'agent-test-status', pipelineId },
    );
    statusId = status.statusesAdd._id;

    // 4. Create the ticket
    const ticket = await graphql<{ createTicket: { _id: string } }>(
      request,
      `mutation($name: String!, $channelId: String!, $pipelineId: String!, $statusId: String!) {
         createTicket(name: $name, channelId: $channelId, pipelineId: $pipelineId, statusId: $statusId) { _id }
       }`,
      { name: 'agent-test-ticket', channelId, pipelineId, statusId },
    );
    ticketId = ticket.createTicket._id;
  });

  test.afterAll(async ({ request }) => {
    if (ticketId) {
      await graphql(request, `mutation($_id: [String!]!) { removeTicket(_id: $_id) { ok } }`, { _id: [ticketId] });
    }
    // Clean up statuses, pipelines, channels as appropriate
  });
});
```

## Running tests

```bash
cd .agents
pnpm test plugins/frontline/tests/ticket.spec.ts
```
