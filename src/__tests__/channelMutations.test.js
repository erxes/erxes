/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { userFactory, integrationFactory } from '../db/factories';
import { Channels, Users, Integrations } from '../db/models';
import mutations from '../data/resolvers/mutations';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('channel creation tests', () => {
  let _user;
  let _user2;
  let _integration;

  /**
   * Before each test create test data
   * containing 2 users and an integration
   */
  beforeEach(async () => {
    _user = await userFactory({});
    _integration = await integrationFactory({});
    _user2 = await userFactory({});
  });

  /**
   * After each test remove the test data
   */
  afterEach(async () => {
    await Channels.remove({});
    await Users.remove({});
    await Integrations.remove({});
  });

  test('create channel tests', async () => {
    try {
      Channels.createChannel({
        name: 'Channel test',
      });
    } catch (e) {
      expect(e.value).toBe('channel.create.exception');
      expect(e.message).toBe('userId must be supplied');
    }

    const doc = {
      name: 'Channel test',
      description: 'test channel descripion',
      userId: _user._id,
      memberIds: [_user2._id],
      integrationIds: [_integration._id],
    };

    const channel = await Channels.createChannel(doc);

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

  /**
   * Before each test create test data
   * containing 2 users and an integration
   */
  beforeEach(async () => {
    _user = await userFactory({});
    _integration = await integrationFactory({});
    _user2 = await userFactory({});
  });

  /**
   * After each test remove the test data
   */
  afterEach(async () => {
    await Channels.remove({});
    await Users.remove({});
    await Integrations.remove({});
  });

  test('update channel tests', async () => {
    const doc = {
      name: 'Channel test',
      description: 'Channel test description',
      userId: _user._id,
      memberIds: [_user2._id],
      integrationIds: [_integration._id],
    };

    let channel = await Channels.createChannel(doc);

    doc.memberIds = [_user2._id];
    await Channels.updateChannel(channel._id, doc);
    channel = await Channels.findOne({ _id: channel._id });
    expect(channel.name).toEqual(doc.name);
    expect(channel.description).toEqual(doc.description);
    expect(channel.memberIds.length).toBe(2);
    expect(channel.memberIds[0]).toBe(_user2._id);
    expect(channel.memberIds[1]).toBe(_user._id);
    expect(channel.integrationIds.length).toEqual(1);
    expect(channel.integrationIds[0]).toEqual(_integration._id);
    expect(channel.userId).toEqual(doc.userId);
    expect(channel.conversationCount).toEqual(0);
    expect(channel.openConversationCount).toEqual(0);

    doc.memberIds = [_user._id];
    await Channels.updateChannel(channel._id, doc);
    channel = await Channels.findOne({ _id: channel._id });
    expect(channel.memberIds.length).toBe(1);
    expect(channel.memberIds[0]).toBe(_user._id);

    await Channels.updateChannel(channel._id, {
      name: 'Channel test 2',
    });

    expect(channel.description).toBe('Channel test description');
  });
});

describe('channel remove test', () => {
  let _channel;

  /**
   * Before each test create test data
   * containing 2 users and an integration
   */
  beforeEach(async () => {
    const user = await userFactory({});
    _channel = await Channels.createChannel({
      name: 'Channel test',
      userId: user._id,
    });
  });

  /**
   * Remove test data
   */
  afterEach(async () => {
    await Channels.remove({});
  });

  test('channel remove test', async () => {
    await Channels.removeChannel(_channel._id);
    const channelCount = await Channels.find({}).count();
    expect(channelCount).toBe(0);
  });
});

describe('mutations', () => {
  let _user;
  let _user2;
  let _integration;

  /**
   * Before each test create test data
   * containing 2 users and an integration
   */
  beforeEach(async () => {
    _user = await userFactory({});
    _integration = await integrationFactory({});
    _user2 = await userFactory({});
  });

  /**
   * After each test remove the test data
   */
  afterEach(async () => {
    await Channels.remove({});
    await Users.remove({});
    await Integrations.remove({});
  });

  test('mutations', async () => {
    // mutations.chanelsCreate
    let doc = {
      name: 'Channel test',
      description: 'test channel descripion',
      userId: _user._id,
      memberIds: [_user2._id],
      integrationIds: [_integration._id],
    };

    let channel = await Channels.createChannel(doc);

    expect(channel.name).toEqual(doc.name);
    expect(channel.description).toEqual(doc.description);
    expect(channel.memberIds.length).toBe(2);
    expect(channel.integrationIds.length).toEqual(1);
    expect(channel.integrationIds[0]).toEqual(_integration._id);
    expect(channel.userId).toEqual(doc.userId);
    expect(channel.conversationCount).toEqual(0);
    expect(channel.openConversationCount).toEqual(0);

    // mutations.channelsUpdate
    doc = {
      name: 'Channel test 1',
      description: 'Channel test description 1',
      userId: _user._id,
      memberIds: [_user2._id],
      integrationIds: [_integration._id],
    };

    doc.memberIds = [_user2._id];
    await mutations.channelsEdit(null, { ...doc, _id: channel._id });
    channel = await Channels.findOne({ _id: channel._id });
    expect(channel.name).toEqual(doc.name);
    expect(channel.description).toEqual(doc.description);
    expect(channel.memberIds.length).toBe(2);
    expect(channel.memberIds[0]).toBe(_user2._id);
    expect(channel.memberIds[1]).toBe(_user._id);
    expect(channel.integrationIds.length).toEqual(1);
    expect(channel.integrationIds[0]).toEqual(_integration._id);
    expect(channel.userId).toEqual(doc.userId);
    expect(channel.conversationCount).toEqual(0);
    expect(channel.openConversationCount).toEqual(0);

    doc.memberIds = [_user._id];
    await mutations.channelsEdit(null, { ...doc, _id: channel._id });
    channel = await Channels.findOne({ _id: channel._id });
    expect(channel.memberIds.length).toBe(1);
    expect(channel.memberIds[0]).toBe(_user._id);

    await mutations.channelsRemove(null, { _id: channel._id });
    const channelCount = await Channels.find({}).count();
    expect(channelCount).toBe(0);
  });
});
