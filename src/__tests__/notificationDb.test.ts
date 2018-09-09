import { NOTIFICATION_TYPES } from '../data/constants';
import { connect, disconnect } from '../db/connection';
import { notificationConfigurationFactory, userFactory } from '../db/factories';
import { NotificationConfigurations, Notifications, Users } from '../db/models';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('Notification model tests', () => {
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

  test(`check whether Error('createdUser must be supplied') is being thrown as intended`, async () => {
    expect.assertions(1);

    try {
      await Notifications.createNotification({});
    } catch (e) {
      expect(e.message).toBe('createdUser must be supplied');
    }
  });

  test('check for error in model creation', async () => {
    expect.assertions(1);

    await notificationConfigurationFactory({
      user: _user2._id,
      notifType: NOTIFICATION_TYPES.CHANNEL_MEMBERS_CHANGE,
      isAllowed: false,
    });

    // Create notification
    const doc = {
      notifType: NOTIFICATION_TYPES.CHANNEL_MEMBERS_CHANGE,
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
      notifType: NOTIFICATION_TYPES.CHANNEL_MEMBERS_CHANGE,
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
    const user3 = await userFactory({});

    doc = {
      notifType: 'channelMembersChange 2',
      title: 'new Notification title 2',
      content: 'new Notification content 2',
      link: 'new Notification link 2',
      receiver: user3,
    };

    notification = await Notifications.updateNotification(notification._id, doc);

    expect(notification.notifType).toEqual(doc.notifType);
    expect(notification.title).toEqual(doc.title);
    expect(notification.content).toEqual(doc.content);
    expect(notification.link).toEqual(doc.link);
    expect(notification.receiver).toBe(user3._id);

    // check method markAsRead =============
    await Notifications.markAsRead([notification._id]);

    const notificationObj = await Notifications.findOne({
      _id: notification._id,
    });

    if (!notificationObj) {
      throw new Error('Notification not found');
    }

    expect(notificationObj.isRead).toEqual(true);

    // remove notification =================
    await Notifications.removeNotification(notificationObj._id);

    expect(await Notifications.find({}).count()).toEqual(0);
  });

  test('sending notifications', () => {
    return;
  });
});

describe('NotificationConfiguration model tests', async () => {
  test(`check whether Error('user must be supplied') is being thrown as intended`, async () => {
    expect.assertions(1);

    const doc = {
      notifType: NOTIFICATION_TYPES.CONVERSATION_ADD_MESSAGE,
      isAllowed: true,
    };

    try {
      await NotificationConfigurations.createOrUpdateConfiguration(doc);
    } catch (e) {
      expect(e.message).toBe('user must be supplied');
    }
  });

  test('test if model methods are working correctly', async () => {
    // creating new notification configuration ==========
    const user = await userFactory({});

    const doc = {
      notifType: NOTIFICATION_TYPES.CONVERSATION_ADD_MESSAGE,
      isAllowed: true,
    };

    let notificationConfigurations = await NotificationConfigurations.createOrUpdateConfiguration(doc, user);

    expect(notificationConfigurations.notifType).toEqual(doc.notifType);
    expect(notificationConfigurations.isAllowed).toEqual(doc.isAllowed);
    expect(notificationConfigurations.user).toEqual(user._id);

    // creating another notification configuration ============
    doc.notifType = NOTIFICATION_TYPES.CONVERSATION_ASSIGNEE_CHANGE;

    notificationConfigurations = await NotificationConfigurations.createOrUpdateConfiguration(doc, user);

    expect(notificationConfigurations.notifType).toEqual(doc.notifType);
    expect(notificationConfigurations.user).toEqual(user._id);

    // Changing the last added notification =========================
    doc.isAllowed = false;

    notificationConfigurations = await NotificationConfigurations.createOrUpdateConfiguration(doc, user);

    expect(notificationConfigurations.isAllowed).toEqual(doc.isAllowed);
  });
});
