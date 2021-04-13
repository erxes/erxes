import { graphqlRequest } from '../db/connection';
import {
  channelFactory,
  integrationFactory,
  userFactory
} from '../db/factories';
import { Channels, Integrations, Users } from '../db/models';
import { set } from '../inmemoryStorage';

import './setup.ts';

describe('channelQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Channels.deleteMany({});
    await Users.deleteMany({});
  });

  test('Channels by members', async () => {
    const user = await userFactory({});

    await channelFactory({ userId: user._id });
    await channelFactory({ userId: user._id });
    await channelFactory();

    const qry = `
      query channelsByMembers($memberIds: [String]) {
        channelsByMembers(memberIds: $memberIds) {
          _id
        }
      }
    `;

    set('erxes_channels', JSON.stringify(await Channels.find()));

    // channels response by memberIds =====
    const memberIds = [user._id];

    const responseFromCache = await graphqlRequest(qry, 'channelsByMembers', {
      memberIds
    });

    expect(responseFromCache.length).toBe(2);
  });

  test('Channels', async () => {
    const user = await userFactory({});

    await channelFactory({ userId: user._id });
    await channelFactory({ userId: user._id });
    await channelFactory();
    await channelFactory();
    await channelFactory();
    await channelFactory();

    const qry = `
      query channels($memberIds: [String]) {
        channels(memberIds: $memberIds) {
          _id
        }
      }
    `;

    // channels response ==================
    let responses = await graphqlRequest(qry, 'channels');

    expect(responses.length).toBe(6);

    // channels response by memberIds =====
    const memberIds = [user._id];

    responses = await graphqlRequest(qry, 'channels', { memberIds });

    expect(responses.length).toBe(2);
  });

  test('Channel details', async () => {
    // Create test data
    const user = await userFactory({});
    const inActiveUser = await userFactory({ isActive: false });

    const integration = await integrationFactory({});
    const inActiveIntegration = await integrationFactory({ isActive: false });

    const channel = await channelFactory({
      memberIds: [user._id, inActiveUser._id],
      integrationIds: [integration._id, inActiveIntegration._id]
    });

    const qry = `
      query channelDetail($_id: String!) {
        channelDetail(_id: $_id) {
          _id
          name
          description
          integrationIds
          memberIds
          createdAt
          userId
          conversationCount
          openConversationCount
          integrations { _id }
          members { _id }
        }
      }
    `;

    set('erxes_users', JSON.stringify(await Users.find()));
    set('erxes_integrations', JSON.stringify(await Integrations.find()));

    const responseFromCache = await graphqlRequest(qry, 'channelDetail', {
      _id: channel._id
    });

    expect(responseFromCache._id).toBe(channel._id);

    expect(responseFromCache.members).toHaveLength(1);
    expect(responseFromCache.members[0]._id).toBe(user._id);

    expect(responseFromCache.integrations).toHaveLength(1);
    expect(responseFromCache.integrations[0]._id).toBe(integration._id);
  });

  test('Get channel total count', async () => {
    // Create test data
    await channelFactory();
    await channelFactory();
    await channelFactory();

    const qry = `
      query channelsTotalCount {
        channelsTotalCount
      }
    `;

    const responses = await graphqlRequest(qry, 'channelsTotalCount');

    expect(responses).toBe(3);
  });

  test('Get last channel', async () => {
    // Create test data
    const channel = await channelFactory();

    const qry = `
      query channelsGetLast {
        channelsGetLast {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'channelsGetLast');

    expect(response._id).toBe(channel._id);
  });
});
