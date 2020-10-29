import { graphqlRequest } from '../db/connection';
import {
  notificationConfigurationFactory,
  notificationFactory,
  userFactory
} from '../db/factories';
import { NotificationConfigurations, Notifications, Users } from '../db/models';

import './setup.ts';

describe('notificationsQueries', () => {
  const commonParamDefs = `
    $limit: Int,
    $page: Int,
    $perPage: Int,
    $requireRead: Boolean,
    $title: String
  `;

  const commonParams = `
    limit: $limit
    page: $page
    perPage: $perPage
    requireRead: $requireRead
    title: $title
  `;

  afterEach(async () => {
    // Clearing test data
    await Notifications.deleteMany({});
    await NotificationConfigurations.deleteMany({});
    await Users.deleteMany({});
  });

  test('Notifications', async () => {
    const user = await userFactory({});
    const receiver = await userFactory({});

    const title1 = 'title1';
    const title2 = 'title2';

    // Creating test data
    await notificationFactory({
      title: title1,
      createdUser: user,
      receiver,
      isRead: true
    });

    await notificationFactory({
      title: title2,
      createdUser: user,
      receiver,
      isRead: false
    });

    const qry = `
      query notifications(${commonParamDefs}) {
        notifications(${commonParams}) {
          _id
          notifType
          title
          link
          content
          createdUser { _id }
          receiver
          date
          isRead
        }
      }
    `;

    // notifications by two different title value
    let response = await graphqlRequest(
      qry,
      'notifications',
      { limit: 2, page: 1, perPage: 5, title: title1 },
      { user: receiver }
    );

    expect(response.length).toBe(1);
    expect(response[0].title).toBe(title1);

    response = await graphqlRequest(
      qry,
      'notifications',
      { limit: 2, page: 1, perPage: 5, title: title2 },
      { user: receiver }
    );

    expect(response.length).toBe(1);
    expect(response[0].title).toBe(title2);

    response = await graphqlRequest(
      qry,
      'notifications',
      { requireRead: true },
      { user: receiver }
    );

    expect(response.length).toBe(1);
    expect(response[0].isRead).toBe(false);
  });

  test('Count notifications', async () => {
    const user = await userFactory({});
    const receiver1 = await userFactory({});
    const receiver2 = await userFactory({});

    // Creating test data
    await notificationFactory({ createdUser: user, receiver: receiver1 });
    await notificationFactory({ createdUser: user, receiver: receiver1 });
    await notificationFactory({ createdUser: user, receiver: receiver2 });

    const qry = `
      query notificationCounts($requireRead: Boolean) {
        notificationCounts(requireRead: $requireRead)
      }
    `;

    // notification for receiver 1
    let response = await graphqlRequest(
      qry,
      'notificationCounts',
      { requireRead: false },
      { user: receiver1 }
    );

    expect(response).toBe(2);

    // notification for receiver 2
    response = await graphqlRequest(
      qry,
      'notificationCounts',
      { requireRead: true },
      { user: receiver2 }
    );

    expect(response).toBe(1);
  });

  test('Notification modules', async () => {
    const qry = `
      query notificationsModules {
        notificationsModules
      }
    `;

    const response = await graphqlRequest(qry, 'notificationsModules');

    expect(response[0].name).toBe('conversations');
    expect(response[1].name).toBe('channels');
  });

  test('Get notification configuration', async () => {
    const user1 = await userFactory({});
    const user2 = await userFactory({});

    // Creating test data
    await notificationConfigurationFactory({
      user: user1,
      notifType: 'conversationAddMessage'
    });

    await notificationConfigurationFactory({
      user: user2,
      notifType: 'channelMembersChange'
    });

    const qry = `
      query notificationsGetConfigurations {
        notificationsGetConfigurations {
          user
          notifType
        }
      }
    `;

    // notification configuration for user1
    let [response] = await graphqlRequest(
      qry,
      'notificationsGetConfigurations',
      {},
      { user: user1 }
    );

    expect(response.user).toBe(user1._id);
    expect(response.notifType).toBe('conversationAddMessage');

    // notification configuration for user2
    [response] = await graphqlRequest(
      qry,
      'notificationsGetConfigurations',
      {},
      { user: user2 }
    );

    expect(response.user).toBe(user2._id);
    expect(response.notifType).toBe('channelMembersChange');
  });
});
