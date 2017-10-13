/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { userFactory, notificationConfigurationFactory } from '../db/factories';
import { MODULES } from '../data/constants';
import { sendNotification } from '../data/utils';
import { Notifications, NotificationConfigurations } from '../db/models';

beforeAll(() => connect());
afterAll(() => disconnect());

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
