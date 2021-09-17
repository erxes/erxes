import { graphqlRequest } from '../db/connection';
import { dealFactory, notificationFactory, userFactory } from '../db/factories';
import { Notifications, Users } from '../db/models';

import './setup.ts';

describe('testing mutations', () => {
  let _user;
  let _notification;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});
    _notification = await notificationFactory({ createdUser: _user });
  });

  afterEach(async () => {
    // Clearing test data
    await Users.deleteMany({});
    await Notifications.deleteMany({});
  });

  test('Save notification config', async () => {
    const args = {
      notifType: 'conversationAddMessage',
      isAllowed: true
    };

    const mutation = `
      mutation notificationsSaveConfig($notifType: String! $isAllowed: Boolean) {
        notificationsSaveConfig(notifType: $notifType isAllowed: $isAllowed) {
          notifType
          isAllowed
        }
      }
    `;

    const notification = await graphqlRequest(
      mutation,
      'notificationsSaveConfig',
      args
    );

    expect(notification.notifType).toBe(args.notifType);
    expect(notification.isAllowed).toBe(args.isAllowed);
  });

  test('Mark as read notification', async () => {
    const mutation = `
      mutation notificationsMarkAsRead($_ids: [String], $contentTypeId: String) {
        notificationsMarkAsRead(_ids: $_ids, contentTypeId: $contentTypeId)
      }
    `;

    await graphqlRequest(mutation, 'notificationsMarkAsRead', {
      _ids: [_notification._id]
    });

    const [notification] = await Notifications.find({ _id: _notification._id });

    expect(notification.isRead).toBe(true);

    const deal = await dealFactory();
    const _dealNotification = await notificationFactory({
      contentType: 'deal',
      contentTypeId: deal._id,
      createdUser: _user
    });

    // filter by contentTypeId
    await graphqlRequest(mutation, 'notificationsMarkAsRead', {
      contentTypeId: deal._id
    });

    const [dealNotification] = await Notifications.find({
      _id: _dealNotification._id
    });

    expect(dealNotification.isRead).toBe(true);
  });

  test('Mark as show notifications', async () => {
    const mutation = `
      mutation notificationsShow {
        notificationsShow
      }
    `;

    const user = await userFactory({ isShowNotification: false });

    await graphqlRequest(mutation, 'notificationsMarkAsRead', {}, { user });

    const updatedUser = await Users.getUser(user._id);

    expect(updatedUser.isShowNotification).toBeTruthy();
  });
});
