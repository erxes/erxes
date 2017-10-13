/* eslint-env jest */
/* eslint-disable no-underscore-dangle */
import { connect, disconnect } from '../db/connection';
import { userFactory, integrationFactory } from '../db/factories';
import { Channels, Users, Integrations } from '../db/models';
import channelMutations from '../data/resolvers/mutations/channels';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('test channel creation error', () => {
  test('check if Error is being thrown as intended', async () => {
    try {
      Channels.createChannel({
        name: 'Channel test',
      });
    } catch (e) {
      expect(e.message).toBe('userId must be supplied');
    }
  });
});

describe('test successful channel creation', () => {
  let _user;
  let _user2;
  let _integration;

  beforeEach(async () => {
    _user = await userFactory({});
    _integration = await integrationFactory({});
    _user2 = await userFactory({});
  });

  afterEach(async () => {
    await Channels.remove({});
    await Users.remove({});
    await Integrations.remove({});
  });

  test('check if channel is getting created successfully', async () => {
    const doc = {
      name: 'Channel test',
      description: 'test channel descripion',
      memberIds: [_user2._id],
      integrationIds: [_integration._id],
    };

    const channel = await Channels.createChannel(doc, _user._id);

    expect(channel.name).toEqual(doc.name);
    expect(channel.description).toEqual(doc.description);
    expect(channel.memberIds.length).toBe(2);
    expect(channel.integrationIds.length).toEqual(1);
    expect(channel.integrationIds[0]).toEqual(_integration._id);
    expect(channel.userId).toEqual(doc.userId);
    expect(channel.conversationCount).toEqual(0);
    expect(channel.openConversationCount).toEqual(0);
  });
});

describe('channel update tests', () => {
  let _user;
  let _user2;
  let _integration;
  let _channelDoc;
  let _channel;

  /**
   * Before each test create test data
   * containing 2 users and an integration
   */
  beforeEach(async () => {
    _user = await userFactory({});
    _integration = await integrationFactory({});
    _user2 = await userFactory({});

    _channelDoc = {
      name: 'Channel test',
      description: 'Channel test description',
      userId: _user._id,
      memberIds: [_user2._id],
      integrationIds: [_integration._id],
    };

    _channel = await Channels.createChannel(_channelDoc, _user);
  });

  /**
   * After each test remove the test data
   */
  afterEach(async () => {
    await Channels.remove({});
    await Users.remove({});
    await Integrations.remove({});
  });

  test(`check if Channel update method and
    Channel.preSave filter is working successfully`, async () => {
    // test Channels.createChannel and Channels.preSave =============
    let channel = await Channels.findOne({ _id: _channel._id });

    expect(channel.name).toEqual(_channelDoc.name);
    expect(channel.description).toEqual(_channelDoc.description);
    expect(channel.memberIds.length).toBe(2);
    expect(channel.memberIds[0]).toBe(_user2._id);
    expect(channel.memberIds[1]).toBe(_user._id);
    expect(channel.integrationIds.length).toEqual(1);
    expect(channel.integrationIds[0]).toEqual(_integration._id);

    expect(channel.userId).toEqual(_channelDoc.userId);
    expect(channel.conversationCount).toEqual(0);
    expect(channel.openConversationCount).toEqual(0);

    // test Channels.updateChannel and Channels.preSave on update ==========
    _channelDoc.memberIds = [_user._id];
    await Channels.updateChannel(channel._id, _channelDoc);
    channel = await Channels.findOne({ _id: channel._id });
    expect(channel.memberIds.length).toBe(1);
    expect(channel.memberIds[0]).toBe(_user._id);

    // testing whether the updated field is not overwriting whole document ========
    await Channels.updateChannel(channel._id, {
      name: 'Channel test 2',
    });

    expect(channel.description).toBe('Channel test description');
  });
});

describe('channel remove test', () => {
  let _channel;

  beforeEach(async () => {
    const user = await userFactory({});
    _channel = await Channels.createChannel(
      {
        name: 'Channel test',
      },
      user._id,
    );
  });

  afterEach(async () => {
    await Channels.remove({});
  });

  test('checking if channel remove method is working successfully', async () => {
    await Channels.removeChannel(_channel._id);
    const channelCount = await Channels.find({}).count();
    expect(channelCount).toBe(0);
  });
});

describe('test mutations', () => {
  let _user;

  beforeEach(async () => {
    _user = await userFactory({});
  });

  test('testing if mutations.channelsCreate is working successfully', async () => {
    expect.assertions(6);
    // test mutations.channelsCreate ==================

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

    // test mutations.channelsUpdate =========
    const channelId = 'fakeChannelId';

    doc = {
      name: 'Channel test 1',
      description: 'Channel test description 1',
      userId: 'fakeUserId1',
      memberIds: ['fakeUserId2'],
      integrationIds: ['integrationIds1'],
    };

    Channels.updateChannel = jest.fn();

    await channelMutations.channelsEdit(null, { ...doc, _id: channelId }, { user: _user });

    expect(Channels.updateChannel).toBeCalledWith(channelId, doc);
    expect(Channels.updateChannel.mock.calls.length).toBe(1);

    // test mutations.channelsRemove =============
    Channels.removeChannel = jest.fn();

    await channelMutations.channelsRemove(null, { _id: channelId }, { user: _user });

    expect(Channels.removeChannel).toBeCalledWith(channelId);
    expect(Channels.removeChannel.mock.calls.length).toEqual(1);
  });
});
