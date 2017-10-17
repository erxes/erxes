/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { userFactory, segmentsFactory, engageMessageFactory } from '../db/factories';
import { EngageMessages, Users, Segments } from '../db/models';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('engage messages model', () => {
  let _user;
  let _segment;
  let _message;

  beforeEach(async () => {
    _user = await userFactory({});
    _segment = await segmentsFactory({});
    _message = await engageMessageFactory({});
  });

  afterEach(async () => {
    await Users.remove({});
    await Segments.remove({});
    await EngageMessages.remove({});
  });

  test('create messages', async () => {
    const doc = {
      kind: 'manual',
      title: 'Message test',
      fromUserId: _user._id,
      segmentId: _segment._id,
      isLive: true,
      isDraft: false,
    };

    const message = await EngageMessages.createEngageMessage(doc);
    expect(message.kind).toEqual(doc.kind);
    expect(message.title).toEqual(doc.title);
    expect(message.fromUserId).toEqual(_user._id);
    expect(message.segmentId).toEqual(_segment._id);
    expect(message.isLive).toEqual(doc.isLive);
    expect(message.isDraft).toEqual(doc.isDraft);
  });

  test('update messages', async () => {
    const message = await EngageMessages.updateEngageMessage(_message._id, {
      title: 'Message test updated',
      fromUserId: _user._id,
      segmentId: _segment._id,
    });

    expect(message.title).toEqual('Message test updated');
    expect(message.fromUserId).toEqual(_user._id);
    expect(message.segmentId).toEqual(_segment._id);
  });

  test('remove a message', async () => {
    await EngageMessages.removeEngageMessage(_message._id);
    const messagesCounts = await EngageMessages.find({}).count();
    expect(messagesCounts).toBe(0);
  });

  test('Engage message set live', async () => {
    await EngageMessages.engageMessageSetLive(_message._id);
    const message = await EngageMessages.findOne({ _id: _message._id });

    expect(message.isLive).toEqual(true);
    expect(message.isDraft).toEqual(false);
  });

  test('Engage message set pause', async () => {
    await EngageMessages.engageMessageSetPause(_message._id);
    const message = await EngageMessages.findOne({ _id: _message._id });

    expect(message.isLive).toEqual(false);
  });

  test('Engage message remove not found', async () => {
    expect.assertions(1);
    try {
      await EngageMessages.removeEngageMessage(_segment._id);
    } catch (e) {
      expect(e.message).toEqual(`Engage message not found with id ${_segment._id}`);
    }
  });
});
