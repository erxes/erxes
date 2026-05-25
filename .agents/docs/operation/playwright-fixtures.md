# Playwright Fixtures for Operation

> How to seed test data inside a Playwright spec so tests run without manual prep. Required by Phase 6 VERIFY.

## Seeding a Task end-to-end

Tasks reside in projects, similar to Deals and Tickets:

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

test.describe('Task priority', () => {
  let projectId: string;
  let taskId: string;

  test.beforeAll(async ({ request }) => {
    // 1. Create a project
    const project = await graphql<{ createProject: { _id: string } }>(
      request,
      `mutation($name: String!, $teamIds: [String!]!) {
         createProject(name: $name, teamIds: $teamIds) { _id }
       }`,
      { name: 'agent-test-project', teamIds: ['agent-team-id'] },
    );
    projectId = project.createProject._id;

    // 2. Create the task
    const task = await graphql<{ createTask: { _id: string } }>(
      request,
      `mutation($name: String!, $teamId: String!, $projectId: String!) {
         createTask(name: $name, teamId: $teamId, projectId: $projectId) { _id }
       }`,
      { name: 'agent-test-task', teamId: 'agent-team-id', projectId },
    );
    taskId = task.createTask._id;
  });

  test.afterAll(async ({ request }) => {
    if (taskId) {
      await graphql(request, `mutation($_id: String!) { removeTask(_id: $_id) { _id } }`, { _id: taskId });
    }
    if (projectId) {
      await graphql(request, `mutation($_id: String!) { removeProject(_id: $_id) }`, { _id: projectId });
    }
  });
});
```

## Running tests

```bash
cd .agents
pnpm test plugins/operation/tests/task.spec.ts
```
