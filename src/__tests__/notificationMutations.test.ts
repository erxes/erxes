import { connect, disconnect, graphqlRequest } from '../db/connection';
import { notificationFactory, userFactory } from '../db/factories';
import { Notifications, Users } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('testing mutations', () => {
  let _user;
  let _notification;
  let context;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});
    _notification = await notificationFactory({ createdUser: _user });
    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
    await Notifications.remove({});
  });

  test('Save notification config', async () => {
    const args = {
      notifType: 'conversationAddMessage',
      isAllowed: true,
    };

    const mutation = `
      mutation notificationsSaveConfig($notifType: String! $isAllowed: Boolean) {
        notificationsSaveConfig(notifType: $notifType isAllowed: $isAllowed) {
          notifType
          isAllowed
        }
      }
    `;

    const notification = await graphqlRequest(mutation, 'notificationsSaveConfig', args, context);

    expect(notification.notifType).toBe(args.notifType);
    expect(notification.isAllowed).toBe(args.isAllowed);
  });

  test('Mark as read notification', async () => {
    const mutation = `
      mutation notificationsMarkAsRead($_ids: [String]) {
        notificationsMarkAsRead(_ids: $_ids)
      }
    `;

    await graphqlRequest(mutation, 'notificationsMarkAsRead', { _ids: [_notification._id] }, context);

    const [notification] = await Notifications.find({
      _id: { $in: _notification._id },
    });

    expect(notification.isRead).toBe(true);
  });
});
