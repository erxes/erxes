import { graphqlRequest } from '../db/connection';
import { integrationFactory } from '../db/factories';
import { MessengerApps } from '../db/models';
import { KIND_CHOICES } from '../db/models/definitions/constants';

import './setup.ts';

describe('mutations', () => {
  afterEach(async () => {
    // Clearing test data
    await MessengerApps.deleteMany({});
  });

  test('Save messenger app', async () => {
    const integration = await integrationFactory({
      kind: KIND_CHOICES.MESSENGER
    });

    const mutation = `
      mutation messengerAppSave($integrationId: String!, $messengerApps: MessengerAppsInput) {
        messengerAppSave(integrationId: $integrationId, messengerApps: $messengerApps)
      }
    `;

    const args: any = {
      integrationId: integration._id,
      messengerApps: {
        websites: [{ description: 'description' }],
        knowledgebases: [{ topicId: 'topicId' }],
        leads: [{ formCode: 'formCode' }]
      }
    };

    let response = await graphqlRequest(mutation, 'messengerAppSave', args);

    expect(response).toBe('success');

    args.messengerApps = {};

    response = await graphqlRequest(mutation, 'messengerAppSave', args);

    expect(response).toBe('success');
  });
});
