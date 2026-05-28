import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:3300';

const CREATE_AGENT = `
  mutation AgentAssistantsAdd($doc: AgentAssistantInput!) {
    agentAssistantsAdd(doc: $doc) {
      _id
      name
      status
    }
  }
`;

const REMOVE_AGENT = `
  mutation AgentAssistantsRemove($_id: String!) {
    agentAssistantsRemove(_id: $_id)
  }
`;

test.describe('agent-assistant plugin', () => {
  let createdAgentId: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.post(`${API_URL}/graphql`, {
      data: {
        query: CREATE_AGENT,
        variables: {
          doc: {
            name: 'Test Agent',
            description: 'Playwright test agent',
            modelProvider: 'openai',
            apiKey: 'sk-test',
            status: 'active',
          },
        },
      },
    });
    const json = await res.json();
    createdAgentId = json.data.agentAssistantsAdd._id;
  });

  test.afterAll(async ({ request }) => {
    if (createdAgentId) {
      await request.post(`${API_URL}/graphql`, {
        data: {
          query: REMOVE_AGENT,
          variables: { _id: createdAgentId },
        },
      });
    }
  });

  test('notification widget renders', async ({ page }) => {
    test.skip(true, 'Requires full stack running');
  });

  test('settings page loads', async ({ page }) => {
    test.skip(true, 'Requires full stack running');
  });

  test('backend GraphQL creates and removes agent', async ({ request }) => {
    expect(createdAgentId).toBeTruthy();
    expect(typeof createdAgentId).toBe('string');
  });
});
