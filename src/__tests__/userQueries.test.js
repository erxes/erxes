/* eslint-env jest */

import { Users, Conversations } from '../db/models';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { userFactory, conversationFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

const generateData = params => {
  const { n, name, args } = params;
  const promises = [];

  let factory;
  let i = 1;

  switch (name) {
    case 'user':
      factory = userFactory;
      break;
    case 'conversation':
      factory = conversationFactory;
      break;
  }

  while (i <= n) {
    promises.push(factory(args));

    i++;
  }

  return Promise.all(promises);
};

describe('userQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
    await Conversations.remove({});
  });

  test('Users', async () => {
    // Creating test data
    await generateData({ n: 3, name: 'user', args: {} });

    const query = `
      query users($page: Int $perPage: Int) {
        users(page: $page perPage: $perPage) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(query, 'users', { page: 1, perPage: 5 });

    // 1 in graphRequest + above 3
    expect(response.length).toBe(4);
  });

  test('User detail', async () => {
    const user = await userFactory({});

    const query = `
      query userDetail($_id: String) {
        userDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(query, 'userDetail', { _id: user._id });

    expect(response._id).toBe(user._id);
  });

  test('Get total count of users', async () => {
    // Creating test data
    await generateData({ n: 3, name: 'user', args: {} });

    const query = `
      query usersTotalCount {
        usersTotalCount
      }
    `;

    const response = await graphqlRequest(query, 'usersTotalCount');

    expect(response).toBe(4);
  });

  test('Current user', async () => {
    const user = await userFactory({});
    const query = `
      query currentUser {
        currentUser {
          _id
        }
      }
    `;

    const response = await graphqlRequest(query, 'currentUser', {}, { user });

    expect(response._id).toBe(user._id);
  });

  test('User conversations', async () => {
    const user = await userFactory({});

    // Creating test data
    await generateData({
      n: 3,
      name: 'conversation',
      args: { participatedUserIds: [user._id] },
    });

    const args = {
      _id: user._id,
      perPage: 5,
    };

    const query = `
      query userConversations($_id: String $perPage: Int) {
        userConversations(_id: $_id perPage: $perPage) {
          list {
            _id
          }
          totalCount
        }
      }
    `;

    const response = await graphqlRequest(query, 'userConversations', args);

    expect(response.list.length).toBe(3);
    expect(response.totalCount).toBe(3);
  });
});
