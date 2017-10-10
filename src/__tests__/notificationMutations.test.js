/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Notifications, NotificationConfigurations, Users } from '../db/models';
import mutations from '../data/resolvers/mutations';
import { userFactory, configurationFactory } from '../db/factories';
import { MODULE_LIST } from '../data/constants';
import { sendChannelNotifications, sendNotification } from '../data/utils';

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

  test('model exception', async () => {
    expect.assertions(1);

    await configurationFactory({
      user: _user2._id,
      notifType: 'channelMembersChange',
      isAllowed: false,
    });

    // Create notification
    let doc = {
      notifType: 'channelMembersChange',
      createdUser: _user._id,
      title: 'new Notification title',
      content: 'new Notification content',
      link: 'new Notification link',
      receiver: _user2._id,
    };

    try {
      await Notifications.createNotification(doc);
    } catch (e) {
      expect(e.message).toEqual('Configuration does not exist');
    }
  });

  test('model create, update, remove', async () => {
    await configurationFactory({
      user: _user2._id,
      notifType: 'channelMembersChange',
    });

    // Create notification
    let doc = {
      notifType: 'channelMembersChange',
      createdUser: _user._id,
      title: 'new Notification title',
      content: 'new Notification content',
      link: 'new Notification link',
      receiver: _user2._id,
    };

    let notification = await Notifications.createNotification(doc);

    expect(notification.notifType).toEqual(doc.notifType);
    expect(notification.createdUser).toEqual(doc.createdUser);
    expect(notification.title).toEqual(doc.title);
    expect(notification.content).toEqual(doc.content);
    expect(notification.link).toEqual(doc.link);
    expect(notification.receiver).toEqual(doc.receiver);

    // Update notification
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

    // Mark as read
    await Notifications.markAsRead([notification._id]);
    notification = await Notifications.findOne({ _id: notification._id });
    expect(notification.isRead).toEqual(true);

    // Remove notification
    await Notifications.removeNotification(notification._id);

    expect(await Notifications.find({}).count()).toEqual(0);
  });

  test('sending notifications', () => {});
});

describe('NotificationConfiguration model tests', async () => {
  test('model tests', async () => {
    // New notification configuration
    const user = await userFactory({});
    const doc = {
      notifType: 'conversationAddMessage',
      isAllowed: true,
      user: user._id,
    };

    let notificationConfigurations = await NotificationConfigurations.createOrUpdateConfiguration(
      doc,
    );
    expect(notificationConfigurations.notifType).toEqual(doc.notifType);
    expect(notificationConfigurations.isAllowed).toEqual(doc.isAllowed);
    expect(notificationConfigurations.user).toEqual(doc.user);

    // Another notification configuration
    doc.notifType = 'conversationAssigneeChange';

    notificationConfigurations = await NotificationConfigurations.createOrUpdateConfiguration(doc);
    expect(notificationConfigurations.notifType).toEqual(doc.notifType);
    expect(notificationConfigurations.isAllowed).toEqual(doc.isAllowed);
    expect(notificationConfigurations.user).toEqual(doc.user);

    // Change notification
    doc.isAllowed = false;
    notificationConfigurations = await NotificationConfigurations.createOrUpdateConfiguration(doc);
    expect(notificationConfigurations.notifType).toEqual(doc.notifType);
    expect(notificationConfigurations.isAllowed).toEqual(doc.isAllowed);
    expect(notificationConfigurations.user).toEqual(doc.user);
  });
});

describe('test mutations', () => {
  beforeEach(() => {});

  afterEach(async () => {
    await Notifications.remove({});
    await NotificationConfigurations.remove({});
  });

  test('mutations', async () => {
    // notification confuration test
    const user = await userFactory({});
    const doc = {
      notifType: 'conversationAddMessage',
      isAllowed: true,
      user: user._id,
    };

    let notificationConfigurations = await mutations.notificationsSaveConfig(null, doc);
    expect(notificationConfigurations.notifType).toEqual(doc.notifType);
    expect(notificationConfigurations.isAllowed).toEqual(doc.isAllowed);
    expect(notificationConfigurations.user).toEqual(doc.user);

    // Another notification configuration
    doc.notifType = 'conversationAssigneeChange';

    notificationConfigurations = await mutations.notificationsSaveConfig(null, doc);
    expect(notificationConfigurations.notifType).toEqual(doc.notifType);
    expect(notificationConfigurations.isAllowed).toEqual(doc.isAllowed);
    expect(notificationConfigurations.user).toEqual(doc.user);

    // Change notification
    doc.isAllowed = false;
    notificationConfigurations = await mutations.notificationsSaveConfig(null, doc);
    expect(notificationConfigurations.notifType).toEqual(doc.notifType);
    expect(notificationConfigurations.isAllowed).toEqual(doc.isAllowed);
    expect(notificationConfigurations.user).toEqual(doc.user);
  });

  test('send notifications', async () => {
    const _user = userFactory({});
    const _user2 = userFactory({});
    const _user3 = userFactory({});

    // Create notification
    const doc = {
      notifType: 'channelMembersChange',
      createdUser: _user._id,
      title: 'new Notification title',
      content: 'new Notification content',
      link: 'new Notification link',
      receivers: [_user, _user2, _user3],
    };

    sendNotification(doc);
    expect(await Notifications.find({}).count()).toEqual(0);
  });
});
