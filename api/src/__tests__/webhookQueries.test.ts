import { graphqlRequest } from '../db/connection';
import { webhookFactory } from '../db/factories';
import { Webhooks } from '../db/models';

import './setup.ts';

describe('webhookQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Webhooks.deleteMany({});
  });

  test('get webhooks', async () => {
    // Creating test data
    await webhookFactory({});

    const qry = `
      query webhooks {
        webhooks {
          _id
          url
          token
          actions {
              label
              type
              action
          }
        }
      }
    `;

    const response = await graphqlRequest(qry, 'webhooks');

    expect(response.length).toBe(1);
  });

  test('Webhook detail', async () => {
    const webhook = await webhookFactory({});

    const qry = `
      query webhookDetail($_id: String!) {
        webhookDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'webhookDetail', {
      _id: webhook._id
    });

    expect(response._id).toBe(webhook._id);
  });

  test('Webhook total count', async () => {
    // Creating test data
    await webhookFactory({});

    const qry = `
      query webhooks {
        webhooksTotalCount 
      }
    `;

    const response = await graphqlRequest(qry, 'webhooksTotalCount');

    expect(response).toBe(1);
  });
});
