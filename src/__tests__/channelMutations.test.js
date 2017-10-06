/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { userFactory, integrationFactory } from '../db/factories';
import { Channels, Users, Integrations } from '../db/models';

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
      userId: _user._id,
      memberIds: [_user2._id],
      integrationIds: [_integration._id],
    };

    const channel = await Channels.createChannel(doc);
    expect(channel.memberIds.length).toBe(2);
    expect(channel.conversationCount).toBe(0);
    expect(channel.openConversationCount).toBe(0);
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
      userId: _user._id,
      memberIds: [_user2._id],
      integrationIds: [_integration._id],
    };

    let channel = await Channels.createChannel(doc);

    doc.memberIds = [_user2._id];
    await Channels.updateChannel(channel._id, doc);
    channel = await Channels.findOne({ _id: channel._id });
    expect(channel.memberIds.length).toBe(2);

    doc.memberIds = [_user._id];
    await Channels.updateChannel(channel._id, doc);
    channel = await Channels.findOne({ _id: channel._id });
    expect(channel.memberIds.length).toBe(1);
    expect(channel.memberIds[0]).toBe(_user._id);
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

  test('channel remove test', async () => {
    await Channels.removeChannel(_channel._id);
    const channelCount = await Channels.find({}).count();
    expect(channelCount).toBe(0);
  });
});
