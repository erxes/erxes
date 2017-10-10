/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Notifications, Configurations, Users } from '../db/models';
// import mutations from '../data/resolvers/mutations';
import { userFactory, configurationFactory } from '../db/factories';
// import { sendNotification } from '../data/utils';

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
    Configurations.remove({});
    Users.remove({});
  });

  test('exception', async () => {
    expect.assertions(1);

    await configurationFactory({
      user: _user2,
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

  test('create and update', async () => {
    await configurationFactory({
      user: _user2,
      notifType: 'channelMembersChange',
    });

    // Create notification
    let doc = {
      notifType: 'channelMembersChange',
      createdUser: _user._id,
      title: 'new Notification title',
      content: 'new Notification content',
      link: 'new Notification link',
      receiver: _user2,
    };

    let notification = await Notifications.createNotification(doc);

    expect(notification.notifType).toEqual(doc.notifType);
    expect(notification.createdUser).toEqual(doc.createdUser);
    expect(notification.title).toEqual(doc.title);
    expect(notification.content).toEqual(doc.content);
    expect(notification.link).toEqual(doc.link);
    expect(notification.receivers).toEqual(doc.receivers);

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
});
