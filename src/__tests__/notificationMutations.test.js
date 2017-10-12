/* eslint-env jest */
/* eslint-disable no-underscore-dangle */
import { connect, disconnect } from '../db/connection';
import { Notifications, NotificationConfigurations, Users } from '../db/models';
import mutations from '../data/resolvers/mutations';
import { userFactory, notificationConfigurationFactory } from '../db/factories';
import { sendNotification } from '../data/utils';
import { MODULES } from '../data/constants';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('Notification tests', () => {
  let _user;
  let _user2;

  beforeEach(async () => {
    _user = await userFactory({});
    _user2 = await userFactory({});
  });

  afterEach(async () => {
    Notifications.remove({});
    NotificationConfigurations.remove({});
    Users.remove({});
  });

  test('check for error in model creation', async () => {
    expect.assertions(1);

    await notificationConfigurationFactory({
      user: _user2._id,
      notifType: 'channelMembersChange',
      isAllowed: false,
    });

    // Create notification
    let doc = {
      notifType: 'channelMembersChange',
      title: 'new Notification title',
      content: 'new Notification content',
      link: 'new Notification link',
      receiver: _user2._id,
    };

    try {
      await Notifications.createNotification(doc, _user._id);
    } catch (e) {
      expect(e.message).toEqual('Configuration does not exist');
    }
  });

  test('model create, update, remove', async () => {
    // Create notification ================

    let doc = {
      notifType: MODULES.CHANNEL_MEMBERS_CHANGE,
      title: 'new Notification title',
      content: 'new Notification content',
      link: 'new Notification link',
      receiver: _user2._id,
    };

    let notification = await Notifications.createNotification(doc, _user._id);

    expect(notification.notifType).toEqual(doc.notifType);
    expect(notification.createdUser).toEqual(_user._id);
    expect(notification.title).toEqual(doc.title);
    expect(notification.content).toEqual(doc.content);
    expect(notification.link).toEqual(doc.link);
    expect(notification.receiver).toEqual(doc.receiver);

    // Update notification ===============
    let user3 = await userFactory({});

    doc = {
      notifType: 'channelMembersChange 2',
      title: 'new Notification title 2',
      content: 'new Notification content 2',
      link: 'new Notification link 2',
      receiver: user3,
    };

    await Notifications.updateNotification(notification._id, doc);

    notification = await Notifications.findOne({ _id: notification._id });

    expect(notification.notifType).toEqual(doc.notifType);
    expect(notification.title).toEqual(doc.title);
    expect(notification.content).toEqual(doc.content);
    expect(notification.link).toEqual(doc.link);
    expect(notification.receivers).toEqual(doc.receivers);

    // check method markAsRead =============
    await Notifications.markAsRead([notification._id]);

    notification = await Notifications.findOne({ _id: notification._id });

    expect(notification.isRead).toEqual(true);

    // remove notification =================
    await Notifications.removeNotification(notification._id);

    expect(await Notifications.find({}).count()).toEqual(0);
  });

  test('sending notifications', () => {});
});

describe('NotificationConfiguration model tests', async () => {
  test('test if model methods are working correctly', async () => {
    // creating new notification configuration ==========
    const user = await userFactory({});

    const doc = {
      notifType: MODULES.CONVERSATION_ADD_MESSAGE,
      isAllowed: true,
    };

    let notificationConfigurations = await NotificationConfigurations.createOrUpdateConfiguration(
      doc,
      user,
    );

    expect(notificationConfigurations.notifType).toEqual(doc.notifType);
    expect(notificationConfigurations.isAllowed).toEqual(doc.isAllowed);
    expect(notificationConfigurations.user).toEqual(user._id);

    // creating another notification configuration ============
    doc.notifType = MODULES.CONVERSATION_ASSIGNEE_CHANGE;

    notificationConfigurations = await NotificationConfigurations.createOrUpdateConfiguration(
      doc,
      user,
    );

    expect(notificationConfigurations.notifType).toEqual(doc.notifType);
    expect(notificationConfigurations.user).toEqual(user._id);

    // Changing the last added notification =========================
    doc.isAllowed = false;

    notificationConfigurations = await NotificationConfigurations.createOrUpdateConfiguration(
      doc,
      user,
    );

    expect(notificationConfigurations.isAllowed).toEqual(doc.isAllowed);
  });
});

describe('testings helper methods', () => {
  test('testing tools.sendNotification method', async () => {
    const _user = await userFactory({});
    const _user2 = await userFactory({});
    const _user3 = await userFactory({});

    // Try to send notifications when there is config not allowing it =========
    await notificationConfigurationFactory({
      notifType: MODULES.CHANNEL_MEMBERS_CHANGE,
      isAllowed: false,
      user: _user._id,
    });

    await notificationConfigurationFactory({
      notifType: MODULES.CHANNEL_MEMBERS_CHANGE,
      isAllowed: false,
      user: _user2._id,
    });

    await notificationConfigurationFactory({
      notifType: MODULES.CHANNEL_MEMBERS_CHANGE,
      isAllowed: false,
      user: _user3._id,
    });

    const doc = {
      notifType: MODULES.CHANNEL_MEMBERS_CHANGE,
      createdUser: _user._id,
      title: 'new Notification title',
      content: 'new Notification content',
      link: 'new Notification link',
      receivers: [_user._id, _user2._id, _user3._id],
    };

    await sendNotification(doc);
    let notifications = await Notifications.find({});

    expect(notifications.length).toEqual(0);

    // Send notifications when there is config allowing it ====================
    await NotificationConfigurations.update({}, { isAllowed: true }, { multi: true });

    await sendNotification(doc);

    notifications = await Notifications.find({});

    expect(notifications.length).toEqual(3);

    expect(notifications[0].notifType).toEqual(doc.notifType);
    expect(notifications[0].createdUser).toEqual(doc.createdUser);
    expect(notifications[0].title).toEqual(doc.title);
    expect(notifications[0].content).toEqual(doc.content);
    expect(notifications[0].link).toEqual(doc.link);
    expect(notifications[0].receiver).toEqual(_user._id);

    expect(notifications[1].receiver).toEqual(_user2._id);

    expect(notifications[2].receiver).toEqual(_user3._id);
  });
});

describe('testing mutations', () => {
  beforeEach(() => {});

  afterEach(async () => {
    await Notifications.remove({});
    await NotificationConfigurations.remove({});
  });

  test('test if `logging required` error is working as intended', () => {
    expect.assertions(2);

    // Login required
    expect(() => mutations.notificationsSaveConfig(null, {}, {})).toThrowError('Login required');

    expect(() => mutations.notificationsMarkAsRead(null, {}, {})).toThrowError('Login required');
  });

  test('testing if notification configuration is saved and updated successfully', async () => {
    NotificationConfigurations.createOrUpdateConfiguration = jest.fn();

    const user = await userFactory({});

    const doc = {
      notifType: 'conversationAddMessage',
      isAllowed: true,
      user: user._id,
    };

    await mutations.notificationsSaveConfig(null, doc, { user });

    expect(NotificationConfigurations.createOrUpdateConfiguration).toBeCalledWith(doc, user);
    expect(NotificationConfigurations.createOrUpdateConfiguration.mock.calls.length).toBe(1);
  });

  test('testing if notifications are being marked as read successfully', async () => {
    Notifications.markAsRead = jest.fn();

    const user = await userFactory({});

    const args = { ids: ['11111', '22222'] };

    await mutations.notificationsMarkAsRead(null, args, { user });

    expect(Notifications.markAsRead).toBeCalledWith(args['ids']);
    expect(Notifications.markAsRead.mock.calls.length).toBe(1);
  });
});
