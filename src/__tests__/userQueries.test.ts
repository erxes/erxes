import { graphqlRequest } from '../db/connection';
import { brandFactory, conversationFactory, onboardHistoryFactory, userFactory } from '../db/factories';
import { Conversations, OnboardingHistories, Users } from '../db/models';

import './setup.ts';

describe('userQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Users.deleteMany({});
    await Conversations.deleteMany({});
    await OnboardingHistories.deleteMany({});
  });

  test('Test users()', async () => {
    // Creating test data
    const brand = await brandFactory();
    const user1 = await userFactory({ email: 'example@email.com', brandIds: [brand._id] });
    const user2 = await userFactory();
    const user3 = await userFactory({ isActive: false });
    await userFactory({ registrationToken: 'token' });

    const paramDefs = `
      $page: Int,
      $perPage: Int,
      $searchValue: String,
      $requireUsername: Boolean,
      $isActive: Boolean,
      $ids: [String],
      $status: String,
      $brandIds: [String]
    `;

    const paramValues = `
      page: $page,
      perPage: $perPage,
      searchValue: $searchValue,
      requireUsername: $requireUsername,
      isActive: $isActive,
      ids: $ids,
      status: $status,
      brandIds: $brandIds
    `;

    const qry = `
      query users(${paramDefs}) {
        users(${paramValues}) {
          _id
        }
      }
    `;

    let response = await graphqlRequest(qry, 'users');

    // 1 in graphRequest + above active 3
    expect(response.length).toBe(4);

    response = await graphqlRequest(qry, 'users', { searchValue: 'example@email.com' });

    expect(response[0]._id).toBe(user1._id);

    response = await graphqlRequest(qry, 'users', { requireUsername: true });

    // 3 in graphRequest + above active 3
    expect(response.length).toBe(6);

    response = await graphqlRequest(qry, 'users', { isActive: false });

    expect(response[0]._id).toBe(user3._id);

    response = await graphqlRequest(qry, 'users', { ids: [user1.id, user2._id] });

    expect(response.length).toBe(2);

    response = await graphqlRequest(qry, 'users', { status: 'status' });

    // 6 in graphRequest + above 2
    expect(response.length).toBe(8);

    response = await graphqlRequest(qry, 'users', { brandIds: [brand._id] });

    expect(response.length).toBe(1);
  });

  test('All users', async () => {
    // Creating test data
    await userFactory({});
    await userFactory({});
    await userFactory({});
    await userFactory({ isActive: false });

    const qry = `
      query allUsers($isActive: Boolean) {
        allUsers(isActive: $isActive) {
          _id
        }
      }
    `;

    let response = await graphqlRequest(qry, 'allUsers');

    // 1 in graphRequest + above 4
    expect(response.length).toBe(5);

    response = await graphqlRequest(qry, 'allUsers', { isActive: true });

    // 2 in graphRequest + above active 3
    expect(response.length).toBe(5);
  });

  test('User detail', async () => {
    const qry = `
      query userDetail($_id: String) {
        userDetail(_id: $_id) {
          _id
          status
          brands { _id }
          permissionActions
          configs
          configsConstants
          onboardingHistory { _id }
        }
      }
    `;

    // checking not verified
    let user = await userFactory({ isOwner: true, registrationToken: 'registrationToken' });
    // to improve test coverage
    await onboardHistoryFactory({ userId: user._id, isCompleted: false });

    let response = await graphqlRequest(qry, 'userDetail', { _id: user._id }, { user });

    expect(response._id).toBe(user._id);
    expect(response.status).toBe('Not verified');

    // checking brand ids
    const brand = await brandFactory();
    user = await userFactory({ isOwner: false, brandIds: [brand._id] });
    response = await graphqlRequest(qry, 'userDetail', { _id: user._id }, { user });

    expect(response._id).toBe(user._id);
    expect(response.status).toBe('Verified');
    expect(response.brands[0]._id).toBe(brand._id);
  });

  test('Get total count of users', async () => {
    // Creating test data
    await userFactory({});
    await userFactory({});
    await userFactory({ isActive: false });

    const qry = `
      query usersTotalCount($isActive: Boolean) {
        usersTotalCount(isActive: $isActive)
      }
    `;

    const response = await graphqlRequest(qry, 'usersTotalCount');

    // 1 in graphRequest + above active 2
    expect(response).toBe(3);
  });

  test('Current user', async () => {
    const user = await userFactory({});

    // to improve test coverage
    await onboardHistoryFactory({ userId: user._id, isCompleted: true });

    const qry = `
      query currentUser {
        currentUser {
          _id
          onboardingHistory {
            _id
          }
        }
      }
    `;

    let response = await graphqlRequest(qry, 'currentUser', {}, { user });

    expect(response._id).toBe(user._id);

    response = await graphqlRequest(qry, 'currentUser', {}, { user: { isActive: false } });

    expect(response).toBe(null);
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
