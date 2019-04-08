import { graphqlRequest } from '../db/connection';
import { messengerAppFactory } from '../db/factories';
import { MessengerApps } from '../db/models';

describe('Messenger app queries', () => {
  afterEach(async () => {
    // Clearing test data
    await MessengerApps.deleteMany({});
  });

  test('Messenger Apps list', async () => {
    await messengerAppFactory({
      credentials: {
        access_token: '123',
        expiry_date: Date.now(),
        formCode: '123',
        integrationId: '123',
      },
      kind: 'knowledgebase',
    });
    await messengerAppFactory({
      credentials: {
        access_token: '123',
        expiry_date: Date.now(),
        formCode: '123',
        integrationId: '123',
      },
      kind: 'knowledgebase',
    });

    const qry = `
      query messengerApps($kind: String) {
        messengerApps(kind: $kind) {
          _id
        }
      }
    `;

    const responses = await graphqlRequest(qry, 'messengerApps', {
      kind: 'knowledgebase',
    });

    expect(responses.length).toBe(2);
  });

  test('Messenger Apps count', async () => {
    await messengerAppFactory({
      credentials: {
        access_token: '123',
        expiry_date: Date.now(),
        formCode: '123',
        integrationId: '123',
      },
      kind: 'knowledgebase',
    });
    await messengerAppFactory({
      credentials: {
        access_token: '123',
        expiry_date: Date.now(),
        formCode: '123',
        integrationId: '123',
      },
      kind: 'lead',
    });

    const qry = `
      query messengerAppsCount($kind: String) {
        messengerAppsCount(kind: $kind)
      }
    `;

    // customer ===========================
    const response = await graphqlRequest(qry, 'messengerAppsCount', {
      kind: 'knowledgebase',
    });

    expect(response).toBe(1);
  });
});
