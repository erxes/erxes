/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { Channels } from '../db/models';
import { ROLES } from '../data/constants';
import { NOTIFICATION_TYPES } from '../data/constants';
import channelMutations from '../data/resolvers/mutations/channels';
import utils from '../data/utils';

describe('mutations', () => {
  const _channelId = 'fakeChannelId';
  const _user = { _id: 'fakeId', role: ROLES.CONTRIBUTOR };
  const _adminUser = { _id: 'fakeId', role: ROLES.ADMIN };

  test(`test if Error('Login required') error is working as intended`, async () => {
    expect.assertions(3);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(channelMutations.channelsAdd);
    expectError(channelMutations.channelsEdit);
    expectError(channelMutations.channelsRemove);
  });

  test(`test if Error('Permission required') error is working as intended`, async () => {
    expect.assertions(3);

    const expectError = async func => {
      try {
        await func(null, {}, { user: _user });
      } catch (e) {
        expect(e.message).toBe('Permission required');
      }
    };

    expectError(channelMutations.channelsAdd);
    expectError(channelMutations.channelsEdit);
    expectError(channelMutations.channelsRemove);
  });

  test('test mutations.channelsAdd', async () => {
    let doc = {
      name: 'Channel test',
      description: 'test channel descripion',
      memberIds: ['fakeUserId2'],
      integrationIds: ['fakeIntegrationId'],
    };

    const channel = {
      _id: 'fakeChannelId',
      name: 'Test channel',
      userId: 'fakeUserId',
      memberIds: ['memberId1', 'memberdId2'],
    };

    const content = `You have invited to '${channel.name}' channel.`;

    const sendNotificationDoc = {
      createdUser: channel.userId,
      notifType: NOTIFICATION_TYPES.CHANNEL_MEMBERS_CHANGE,
      title: content,
      content,
      link: `/inbox/${channel._id}`,

      // exclude current user
      receivers: (channel.memberIds || []).filter(id => id !== channel.userId),
    };

    Channels.createChannel = jest.fn(() => channel);

    jest.spyOn(utils, 'sendNotification').mockImplementation(() => ({}));

    await channelMutations.channelsAdd(null, doc, { user: _adminUser });

    expect(Channels.createChannel).toBeCalledWith(doc, _adminUser);
    expect(Channels.createChannel.mock.calls.length).toBe(1);

    expect(utils.sendNotification).toBeCalledWith(sendNotificationDoc);
    expect(utils.sendNotification.mock.calls.length).toBe(1);
  });

  test('test mutations.channelsUpdate', async () => {
    const doc = {
      name: 'Channel test 1',
      description: 'Channel test description 1',
      memberIds: ['fakeUserId2'],
      integrationIds: ['integrationIds1'],
    };

    const channel = {
      _id: 'fakeChannelId',
      name: 'Test channel',
      userId: 'fakeUserId',
      memberIds: ['memberId1', 'memberdId2'],
    };

    const content = `You have invited to '${channel.name}' channel.`;

    const sendNotificationDoc = {
      createdUser: channel.userId,
      notifType: NOTIFICATION_TYPES.CHANNEL_MEMBERS_CHANGE,
      title: content,
      content,
      link: `/inbox/${channel._id}`,

      // exclude current user
      receivers: (channel.memberIds || []).filter(id => id !== channel.userId),
    };

    Channels.updateChannel = jest.fn(() => channel);

    await channelMutations.channelsEdit(
      null,
      {
        ...doc,
        _id: _channelId,
      },
      { user: _adminUser },
    );

    expect(Channels.updateChannel).toBeCalledWith(_channelId, doc);
    expect(Channels.updateChannel.mock.calls.length).toBe(1);

    expect(utils.sendNotification).toBeCalledWith(sendNotificationDoc);
    expect(utils.sendNotification.mock.calls.length).toBe(2);
  });

  test('test mutations.channelsRemove', async () => {
    Channels.removeChannel = jest.fn();

    await channelMutations.channelsRemove(null, { _id: _channelId }, { user: _adminUser });

    expect(Channels.removeChannel).toBeCalledWith(_channelId);
    expect(Channels.removeChannel.mock.calls.length).toEqual(1);
  });
});
