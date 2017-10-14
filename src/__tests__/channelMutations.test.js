/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { userFactory } from '../db/factories';
import { Channels, Users } from '../db/models';
import channelMutations from '../data/resolvers/mutations/channels';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('mutations', () => {
  const _channelId = 'fakeChannelId';
  let _user;

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
    expect.assertions(2);

    let doc = {
      name: 'Channel test',
      description: 'test channel descripion',
      memberIds: ['fakeUserId2'],
      integrationIds: ['fakeIntegrationId'],
    };

    Channels.createChannel = jest.fn();

    try {
      await channelMutations.channelsCreate(null, doc, { user: _user });
    } catch (e) {
      /* this error is caused by Channels.createChannel mock function;
       sendChannelNotifications method further in the workflow was using
       the object returned by Channels.createChannel, since we mocked it,
       returns null */
      if (e.message === `Cannot read property 'userId' of undefined`) {
        expect(Channels.createChannel).toBeCalledWith(doc, _user);
        expect(Channels.createChannel.mock.calls.length).toBe(1);
      }
    }
  });

  test('test mutations.channelsUpdate', async () => {
    const doc = {
      name: 'Channel test 1',
      description: 'Channel test description 1',
      userId: 'fakeUserId1',
      memberIds: ['fakeUserId2'],
      integrationIds: ['integrationIds1'],
    };

    Channels.updateChannel = jest.fn();

    try {
      await channelMutations.channelsEdit(
        null,
        {
          ...doc,
          _id: _channelId,
        },
        { user: _user },
      );
    } catch (e) {
      /* this error is caused by Channels.updateChannel mock function;
       sendChannelNotifications method further in the workflow was using
       the object returned by Channels.updateChannel, since we mocked it,
       returns null */
      if (e.message === `Cannot read property '_id' of undefined`) {
        expect(Channels.updateChannel).toBeCalledWith(_channelId, doc);
        expect(Channels.updateChannel.mock.calls.length).toBe(1);
      } else {
        throw e;
      }
    }
  });

  test('test mutations.channelsRemove', async () => {
    Channels.removeChannel = jest.fn();

    await channelMutations.channelsRemove(null, { _id: _channelId }, { user: _user });

    expect(Channels.removeChannel).toBeCalledWith(_channelId);
    expect(Channels.removeChannel.mock.calls.length).toEqual(1);
  });
});
