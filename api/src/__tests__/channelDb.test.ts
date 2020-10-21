import { channelFactory, integrationFactory, userFactory } from '../db/factories';
import { Channels, Integrations, Users } from '../db/models';

import './setup.ts';

describe('test channel creation error', () => {
  test(`check if Error('userId must be supplied') is being thrown as intended`, async () => {
    try {
      Channels.createChannel({
        name: 'Channel test',
        integrationIds: [],
      });
    } catch (e) {
      expect(e.message).toBe('userId must be supplied');
    }
  });
});

describe('channel creation', () => {
  let _user2;
  let _integration;

  beforeEach(async () => {
    _integration = await integrationFactory({});
    _user2 = await userFactory({});
  });

  afterEach(async () => {
    await Channels.deleteMany({});
    await Users.deleteMany({});
    await Integrations.deleteMany({});
  });

  test('Get channel', async () => {
    const channel = await channelFactory();

    try {
      await Channels.getChannel('fakeId');
    } catch (e) {
      expect(e.message).toBe('Channel not found');
    }

    const response = await Channels.getChannel(channel._id);

    expect(response).toBeDefined();
  });

  test('check if channel is getting created successfully', async () => {
    const user = await userFactory({});

    const doc = {
      name: 'Channel test',
      description: 'test channel descripion',
      memberIds: [_user2._id],
      integrationIds: [_integration._id],
    };

    const channel = await Channels.createChannel(doc, user._id);

    if (!channel.memberIds || !channel.integrationIds) {
      throw new Error('Channel not found');
    }

    expect(channel.name).toEqual(doc.name);
    expect(channel.description).toEqual(doc.description);
    expect(channel.memberIds.length).toBe(1);
    expect(channel.integrationIds.length).toEqual(1);
    expect(channel.integrationIds[0]).toEqual(_integration._id);
    expect(channel.userId).toEqual(user._id);
    expect(channel.conversationCount).toEqual(0);
    expect(channel.openConversationCount).toEqual(0);
  });
});

describe('channel update', () => {
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
    await Channels.deleteMany({});
    await Users.deleteMany({});
    await Integrations.deleteMany({});
  });

  test(`check if Channel update method and
    Channel.preSave filter is working successfully`, async () => {
    // test Channels.createChannel and Channels.preSave =============
    let channel = await Channels.findOne({ _id: _channel._id });

    if (!channel || !channel.memberIds || !channel.integrationIds) {
      throw new Error('Channel not found');
    }

    expect(channel.name).toEqual(_channelDoc.name);
    expect(channel.description).toEqual(_channelDoc.description);
    expect(channel.memberIds.length).toBe(1);
    expect(channel.memberIds[0]).toBe(_user2._id);
    expect(channel.integrationIds.length).toEqual(1);
    expect(channel.integrationIds[0]).toEqual(_integration._id);

    expect(channel.userId).toEqual(_channelDoc.userId);
    expect(channel.conversationCount).toEqual(0);
    expect(channel.openConversationCount).toEqual(0);

    // test Channels.updateChannel and Channels.preSave on update ==========
    _channelDoc.memberIds = [_user._id];

    channel = await Channels.updateChannel(channel._id, _channelDoc);

    if (!channel || !channel.memberIds) {
      throw new Error('Channel not found');
    }

    expect(channel.memberIds.length).toBe(1);
    expect(channel.memberIds[0]).toBe(_user._id);

    // testing whether the updated field is not overwriting whole document ========
    channel = await Channels.updateChannel(channel._id, {
      name: 'Channel test 2',
      integrationIds: [],
    });

    expect(channel.description).toBe('Channel test description');
  });
});

describe('channel remove', () => {
  let _channel;

  beforeEach(async () => {
    const user = await userFactory({});
    _channel = await Channels.createChannel(
      {
        name: 'Channel test',
        integrationIds: [],
      },
      user._id,
    );
  });

  afterEach(async () => {
    await Channels.deleteMany({});
  });

  test('check if channel remove method is working successfully', async () => {
    await Channels.removeChannel(_channel._id);

    const channelCount = await Channels.find({}).countDocuments();

    expect(channelCount).toBe(0);
  });
});

describe('test createdAtModifier', () => {
  afterEach(async () => {
    await Channels.deleteMany({});
  });
});

describe('db utils', () => {
  let _user;
  let _channel;

  beforeEach(async () => {
    _user = await userFactory({});
    _channel = await channelFactory({ memberIds: ['DFAFDSFDDFAS'] });
  });

  afterEach(async () => {
    await Users.deleteMany({});
    await Channels.deleteMany({});
  });

  test('updateUserChannels', async () => {
    const updatedChannels = await Channels.updateUserChannels([_channel._id], _user._id);

    const updatedChannel = updatedChannels.pop();

    if (!updatedChannel) {
      throw new Error('Channel not found');
    }

    expect(updatedChannel.memberIds).toContain('DFAFDSFDDFAS');
    expect(updatedChannel.memberIds).toContain(_user._id);
  });
});
