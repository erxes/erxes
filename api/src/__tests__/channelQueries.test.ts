import { graphqlRequest } from '../db/connection';
import { channelFactory, userFactory } from '../db/factories';
import { Channels, Users } from '../db/models';

import './setup.ts';

describe('channelQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Channels.deleteMany({});
    await Users.deleteMany({});
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
    const channel = await channelFactory();

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

    const responses = await graphqlRequest(qry, 'channelDetail', {
      _id: channel._id
    });

    expect(responses._id).toBe(channel._id);
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
