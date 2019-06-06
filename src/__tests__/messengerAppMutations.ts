import { graphqlRequest } from '../db/connection';
import { formFactory, messengerAppFactory, userFactory } from '../db/factories';
import { MessengerApps, Users } from '../db/models';

import './setup.ts';

describe('mutations', () => {
  let _user;
  let context;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await MessengerApps.deleteMany({});
    await Users.deleteMany({});
  });

  test('Add google meet', async () => {
    const args = {
      name: 'google meet',
      accountId: Math.random().toString(),
    };

    const mutation = `
      mutation messengerAppsAddGoogleMeet($name: String!, $accountId: String!) {
        messengerAppsAddGoogleMeet(name: $name, accountId: $accountId) {
          name
          kind
          showInInbox
          accountId
        }
      }
    `;

    const app = await graphqlRequest(mutation, 'messengerAppsAddGoogleMeet', args, context);

    expect(app.kind).toBe('googleMeet');
    expect(app.showInInbox).toBe(true);
    expect(app.name).toBe(args.name);
    expect(app.accountId).toBe(args.accountId);
  });

  test('Add knowledgebase', async () => {
    const args = {
      name: 'knowledgebase',
      integrationId: 'integrationId',
      topicId: 'topicId',
    };

    const mutation = `
      mutation messengerAppsAddKnowledgebase($name: String!, $integrationId: String!, $topicId: String!) {
        messengerAppsAddKnowledgebase(name: $name, integrationId: $integrationId, topicId: $topicId) {
          name
          kind
          showInInbox
          credentials
        }
      }
    `;

    const app = await graphqlRequest(mutation, 'messengerAppsAddKnowledgebase', args, context);

    expect(app.kind).toBe('knowledgebase');
    expect(app.showInInbox).toBe(false);
    expect(app.name).toBe(args.name);
    expect(app.credentials).toEqual({
      integrationId: args.integrationId,
      topicId: args.topicId,
    });
  });

  test('Add lead', async () => {
    const form = await formFactory({});

    const args = {
      name: 'lead',
      integrationId: 'integrationId',
      formId: form._id,
    };

    const mutation = `
      mutation messengerAppsAddLead($name: String!, $integrationId: String!, $formId: String!) {
        messengerAppsAddLead(name: $name, integrationId: $integrationId, formId: $formId) {
          name
          kind
          showInInbox
          credentials
        }
      }
    `;

    const app = await graphqlRequest(mutation, 'messengerAppsAddLead', args, context);

    expect(app.kind).toBe('lead');
    expect(app.showInInbox).toBe(false);
    expect(app.name).toBe(args.name);
    expect(app.credentials).toEqual({
      integrationId: args.integrationId,
      formCode: form.code,
    });
  });

  test('Remove', async () => {
    const app = await messengerAppFactory({ credentials: { integrationId: '_id', formCode: 'code' } });

    const mutation = `
      mutation messengerAppsRemove($_id: String!) {
        messengerAppsRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'messengerAppsRemove', { _id: app._id }, context);

    const count = await MessengerApps.find().countDocuments();

    expect(count).toBe(0);
  });
});
