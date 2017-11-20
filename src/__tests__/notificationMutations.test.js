/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Notifications, NotificationConfigurations } from '../db/models';
import notificationMutations from '../data/resolvers/mutations/notifications';
import { userFactory } from '../db/factories';
import { Users } from '../db/models';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('testing mutations', () => {
  let _user;

  beforeEach(async () => {
    _user = await userFactory({});
  });

  afterEach(async () => {
    await Users.remove({});
  });

  test('test if `logging required` error is working as intended', () => {
    expect.assertions(2);

    // Login required ==================
    expect(() => notificationMutations.notificationsSaveConfig(null, {}, {})).toThrowError(
      'Login required',
    );

    expect(() => notificationMutations.notificationsMarkAsRead(null, {}, {})).toThrowError(
      'Login required',
    );
  });

  test('testing if notification configuration is saved and updated successfully', async () => {
    NotificationConfigurations.createOrUpdateConfiguration = jest.fn();

    const doc = {
      notifType: 'conversationAddMessage',
      isAllowed: true,
      user: _user._id,
    };

    await notificationMutations.notificationsSaveConfig(null, doc, { user: _user });

    expect(NotificationConfigurations.createOrUpdateConfiguration).toBeCalledWith(doc, _user);
    expect(NotificationConfigurations.createOrUpdateConfiguration.mock.calls.length).toBe(1);
  });

  test('testing if notifications are being marked as read successfully', async () => {
    Notifications.markAsRead = jest.fn();

    const args = { _ids: ['11111', '22222'] };

    await notificationMutations.notificationsMarkAsRead(null, args, { user: _user });

    expect(Notifications.markAsRead).toBeCalledWith(args['_ids'], _user._id);
    expect(Notifications.markAsRead.mock.calls.length).toBe(1);
  });
});
