import { sendChannelNotifications } from '../data/resolvers/mutations/channels';
import utils from '../data/utils';
import { channelFactory, notificationConfigurationFactory, userFactory } from '../db/factories';
import { NotificationConfigurations, Notifications, Users } from '../db/models';

import { NOTIFICATION_CONTENT_TYPES, NOTIFICATION_TYPES } from '../db/models/definitions/constants';
import './setup.ts';

describe('testings helper methods', () => {
  let _user;
  let _user2;
  let _user3;

  beforeEach(async () => {
    _user = await userFactory({});
    _user2 = await userFactory({});
    _user3 = await userFactory({});
  });

  afterEach(async () => {
    await Users.deleteMany({});
  });

  test('testing tools.sendNotification method', async () => {
    process.env.DEFAULT_EMAIL_SERIVCE = ' ';
    process.env.COMPANY_EMAIL_FROM = ' ';

    // Try to send notifications when there is config not allowing it =========
    await notificationConfigurationFactory({
      notifType: NOTIFICATION_TYPES.CHANNEL_MEMBERS_CHANGE,
      isAllowed: false,
      user: _user._id,
    });

    await notificationConfigurationFactory({
      notifType: NOTIFICATION_TYPES.CHANNEL_MEMBERS_CHANGE,
      isAllowed: false,
      user: _user2._id,
    });

    await notificationConfigurationFactory({
      notifType: NOTIFICATION_TYPES.CHANNEL_MEMBERS_CHANGE,
      isAllowed: false,
      user: _user3._id,
    });

    const doc = {
      notifType: NOTIFICATION_TYPES.CHANNEL_MEMBERS_CHANGE,
      createdUser: _user,
      title: 'new Notification title',
      content: 'new Notification content',
      link: 'new Notification link',
      action: 'action',
      receivers: [_user._id, _user2._id, _user3._id],
      contentType: NOTIFICATION_CONTENT_TYPES.CHANNEL,
      contentTypeId: 'channelId',
    };

    await utils.sendNotification(doc);
    let notifications = await Notifications.find({});

    expect(notifications.length).toEqual(0);

    // Send notifications when there is config allowing it ====================
    await NotificationConfigurations.updateMany({}, { $set: { isAllowed: true } }, { multi: true });

    await utils.sendNotification(doc);

    notifications = await Notifications.find({});

    expect(notifications.length).toEqual(3);

    expect(notifications[0].notifType).toEqual(doc.notifType);
    expect(notifications[0].createdUser).toBe(doc.createdUser._id);
    expect(notifications[0].title).toEqual(doc.title);
    expect(notifications[0].content).toEqual(doc.content);
    expect(notifications[0].link).toEqual(doc.link);
    expect(notifications[0].receiver).toEqual(_user._id);

    expect(notifications[1].receiver).toEqual(_user2._id);

    expect(notifications[2].receiver).toEqual(_user3._id);
  });

  test('test tools.sendChannelNotifications', async () => {
    const channel = await channelFactory({});

    if (!channel || !channel.memberIds) {
      throw new Error('Couldnt create channel');
    }

    const content = `${channel.name} channel`;

    const spySendNotification = jest.spyOn(utils, 'sendNotification').mockImplementation(() => Promise.resolve(true));

    await sendChannelNotifications(channel, 'invited', _user);

    expect(utils.sendNotification).toBeCalledWith({
      createdUser: _user,
      action: 'invited you to the',
      notifType: NOTIFICATION_TYPES.CHANNEL_MEMBERS_CHANGE,
      title: `Channel updated`,
      content,
      link: `/inbox/index?channelId=${channel._id}`,
      contentType: NOTIFICATION_CONTENT_TYPES.CHANNEL,
      contentTypeId: channel._id,
      receivers: channel && channel.memberIds ? channel.memberIds.filter(id => id !== channel.userId) : null,
    });

    expect(spySendNotification.mock.calls.length).toBe(1);
  });
});
