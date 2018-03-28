/* eslint-env jest */

import { Users, Channels } from '../db/models';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { userFactory, channelFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

const generateData = params => {
  const { n, userId } = params;
  const promises = [];

  let i = 1;

  while (i <= n) {
    promises.push(channelFactory(userId && { userId }));

    i++;
  }

  return Promise.all(promises);
};

describe('channelQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Channels.remove({});
    await Users.remove({});
  });

  test('Channels', async () => {
    const user = await userFactory({});

    const args = {
      page: 1,
      perPage: 10,
      memberIds: [user._id],
    };

    await generateData({ n: 3, userId: user._id });

    const query = `
      query channels($page: Int $perPage: Int $memberIds: [String]) {
        channels(page: $page perPage: $perPage memberIds: $memberIds) {
          _id
        }
      }
    `;

    const responses = await graphqlRequest(query, 'channels', args);

    expect(responses.length).toBe(3);
  });

  test('Channel details', async () => {
    // Create test data
    const channel = await channelFactory();

    const query = `
      query channelDetail($_id: String!) {
        channelDetail(_id: $_id) {
          _id
        }
      }
    `;

    const responses = await graphqlRequest(query, 'channelDetail', { _id: channel._id });

    expect(responses._id).toBe(channel._id);
  });

  test('Get channel total count', async () => {
    // Create test data
    await generateData({ n: 4 });

    const query = `
      query channelsTotalCount {
        channelsTotalCount
      }
    `;

    const responses = await graphqlRequest(query, 'channelsTotalCount');

    expect(responses).toBe(4);
  });

  test('Get last channel', async () => {
    // Create test data
    await generateData({ n: 4 });

    const channel = await channelFactory();

    const query = `
      query channelsGetLast {
        channelsGetLast {
          _id
        }
      }
    `;

    const response = await graphqlRequest(query, 'channelsGetLast');

    expect(response._id).toBe(channel._id);
  });
});
