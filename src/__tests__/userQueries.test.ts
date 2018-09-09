import { connect, disconnect, graphqlRequest } from '../db/connection';
import { conversationFactory, userFactory } from '../db/factories';
import { Conversations, Users } from '../db/models';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('userQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
    await Conversations.remove({});
  });

  test('Users', async () => {
    // Creating test data
    await userFactory({});
    await userFactory({});
    await userFactory({});
    await userFactory({ isActive: false });

    const qry = `
      query users($page: Int $perPage: Int) {
        users(page: $page perPage: $perPage) {
          _id
          username
          email
          role
          details {
            avatar
            fullName
            position
            location
            description
          }
          links {
            linkedIn
            twitter
            facebook
            github
            youtube
            website
          }
          emailSignatures
          getNotificationByEmail
        }
      }
    `;

    const response = await graphqlRequest(qry, 'users', {
      page: 1,
      perPage: 2,
    });
    // 1 in graphRequest + above 3
    expect(response.length).toBe(2);
  });

  test('User detail', async () => {
    const user = await userFactory({});

    const qry = `
      query userDetail($_id: String) {
        userDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'userDetail', { _id: user._id });

    expect(response._id).toBe(user._id);
  });

  test('Get total count of users', async () => {
    // Creating test data
    await userFactory({});
    await userFactory({});
    await userFactory({ isActive: false });

    const qry = `
      query usersTotalCount {
        usersTotalCount
      }
    `;

    const response = await graphqlRequest(qry, 'usersTotalCount');

    // 1 in graphRequest + above 3
    expect(response).toBe(4);
  });

  test('Current user', async () => {
    const user = await userFactory({});

    const qry = `
      query currentUser {
        currentUser {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'currentUser', {}, { user });

    expect(response._id).toBe(user._id);
  });

  test('User conversations', async () => {
    const user = await userFactory({});

    // Creating test data
    await conversationFactory({ participatedUserIds: [user._id] });
    await conversationFactory({ participatedUserIds: [user._id] });
    await conversationFactory({});

    const args = {
      _id: user._id,
      perPage: 5,
    };

    const qry = `
      query userConversations($_id: String $perPage: Int) {
        userConversations(_id: $_id perPage: $perPage) {
          list {
            _id
          }
          totalCount
        }
      }
    `;

    const response = await graphqlRequest(qry, 'userConversations', args);

    expect(response.list.length).toBe(2);
    expect(response.totalCount).toBe(2);
  });
});
