/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { userFactory } from '../db/factories';
import { Channels, Users } from '../db/models';
import channelMutations from '../data/resolvers/mutations/channels';
import utils from '../data/utils';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('mutations', () => {
  const _channelId = 'fakeChannelId';
  let _user;
  let _user2Id = 'fakeuserId2';

  beforeEach(async () => {
    _user = await userFactory({});
  });

  afterEach(async () => {
    await Users.remove({});
  });

  test(`test if Error('Login required') error is working as intended`, async () => {
    expect.assertions(3);

    try {
      await channelMutations.channelsCreate(null, {}, {});
    } catch (e) {
      expect(e.message).toBe('Login required');
    }

    try {
      await channelMutations.channelsEdit(null, {}, {});
    } catch (e) {
      expect(e.message).toBe('Login required');
    }

    try {
      await channelMutations.channelsRemove(null, {}, {});
    } catch (e) {
      expect(e.message).toBe('Login required');
    }
  });

  test('test mutations.channelsCreate', async () => {
    let doc = {
      name: 'Channel test',
      description: 'test channel descripion',
      memberIds: ['fakeUserId2'],
      integrationIds: ['fakeIntegrationId'],
    };

    let notifDoc = {
      userId: _user._id,
      memberIds: [_user._id, _user2Id],
      _id: _channelId,
    };

    Channels.createChannel = jest.fn(() => notifDoc);

    jest.spyOn(utils, 'sendChannelNotifications').mockImplementation(() => ({}));

    await channelMutations.channelsCreate(null, doc, { user: _user });

    expect(Channels.createChannel).toBeCalledWith(doc, _user);
    expect(Channels.createChannel.mock.calls.length).toBe(1);

    expect(utils.sendChannelNotifications).toBeCalledWith({
      userId: _user._id,
      memberIds: [_user._id, _user2Id],
      channelId: _channelId,
    });
    expect(utils.sendChannelNotifications.mock.calls.length).toBe(1);
  });

  test('test mutations.channelsUpdate', async () => {
    const doc = {
      name: 'Channel test 1',
      description: 'Channel test description 1',
      memberIds: ['fakeUserId2'],
      integrationIds: ['integrationIds1'],
    };

    let notifDoc = {
      userId: _user._id,
      memberIds: [_user._id, _user2Id],
      _id: _channelId,
    };

    Channels.updateChannel = jest.fn(() => notifDoc);

    await channelMutations.channelsEdit(
      null,
      {
        ...doc,
        _id: _channelId,
      },
      { user: _user },
    );

    expect(Channels.updateChannel).toBeCalledWith(_channelId, doc);
    expect(Channels.updateChannel.mock.calls.length).toBe(1);

    expect(utils.sendChannelNotifications).toBeCalledWith({
      userId: _user._id,
      memberIds: [_user._id, _user2Id],
      channelId: _channelId,
    });
    expect(utils.sendChannelNotifications.mock.calls.length).toBe(2);
  });

  test('test mutations.channelsRemove', async () => {
    Channels.removeChannel = jest.fn();

    await channelMutations.channelsRemove(null, { _id: _channelId }, { user: _user });

    expect(Channels.removeChannel).toBeCalledWith(_channelId);
    expect(Channels.removeChannel.mock.calls.length).toEqual(1);
  });
});
