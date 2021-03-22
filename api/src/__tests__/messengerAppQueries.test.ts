import { graphqlRequest } from '../db/connection';
import {
  formFactory,
  integrationFactory,
  knowledgeBaseTopicFactory,
  messengerAppFactory
} from '../db/factories';
import { MessengerApps } from '../db/models';

import './setup.ts';

describe('messengerAppQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await MessengerApps.deleteMany({});
  });

  test('MessengerApps', async () => {
    // Creating test data
    const integration = await integrationFactory();
    const form = await formFactory();
    const kb = await knowledgeBaseTopicFactory();

    await messengerAppFactory({
      kind: 'lead',
      credentials: {
        integrationId: integration._id,
        formCode: form.code || ''
      }
    });
    await messengerAppFactory({
      kind: 'knowledgebase',
      credentials: {
        integrationId: integration._id,
        topicId: kb._id
      }
    });
    await messengerAppFactory({
      kind: 'website',
      credentials: {
        integrationId: integration._id,
        description: 'description',
        buttonText: 'website',
        url: 'https://google.com'
      }
    });

    const qry = `
      query messengerApps($integrationId: String!) {
        messengerApps(integrationId: $integrationId) {
            knowledgebases {
                topicId
            }
            leads{
                formCode
            }
            websites{
                url
                description
                buttonText
            }
        }
      }
    `;

    const response = await graphqlRequest(qry, 'messengerApps', {
      integrationId: integration._id
    });
    const { knowledgebases, leads, websites } = response;

    expect(knowledgebases.length).toBe(1);
    expect(knowledgebases[0].topicId).toBe(kb._id);
    expect(leads.length).toBe(1);
    expect(leads[0].formCode).toBe(form.code);
    expect(websites.length).toBe(1);
    expect(websites[0].url).toBe('https://google.com');
  });
});
