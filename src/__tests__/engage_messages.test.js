/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { userFactory, segmentsFactory } from '../db/factories';
import { EngageMessages, Users, Segments } from '../db/models';
import mutations from '../data/resolvers/mutations';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('engage messages models', () => {
  let _user;
  let _segment = segmentsFactory();

  beforeEach(async () => {
    _user = await userFactory({});
    _segment = await segmentsFactory({});
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

    const message = await EngageMessages.createMessage(doc);
    expect(message.kind).toEqual(doc.kind);
    expect(message.title).toEqual(doc.title);
    expect(message.fromUserId).toEqual(_user._id);
    expect(message.segmentId).toEqual(_segment._id);
    expect(message.isLive).toEqual(doc.isLive);
    expect(message.isDraft).toEqual(doc.isDraft);
  });

  test('update messages', async () => {
    const doc = {
      kind: 'manual',
      title: 'Message test',
      fromUserId: _user._id,
      segmentId: _segment._id,
      isLive: true,
      isDraft: false,
    };

    let message = await EngageMessages.createMessage(doc);

    doc.title = 'Message test updated';
    doc.isLive = false;
    doc.isDraft = true;

    await EngageMessages.updateMessage(message._id, doc);
    message = await EngageMessages.findOne({ _id: message._id });

    expect(message.kind).toEqual(doc.kind);
    expect(message.title).toEqual(doc.title);
    expect(message.fromUserId).toEqual(_user._id);
    expect(message.segmentId).toEqual(_segment._id);
    expect(message.isLive).toEqual(doc.isLive);
    expect(message.isDraft).toEqual(doc.isDraft);
  });

  test('remove a message', async () => {
    const _message = await EngageMessages.createMessage({
      kind: 'manual',
      title: 'Message test',
      fromUserId: _user._id,
    });

    await EngageMessages.removeMessage(_message._id);
    const messagesCounts = await EngageMessages.find({}).count();
    expect(messagesCounts).toBe(0);
  });
});

describe('mutations', () => {
  let _user;
  let _segment = segmentsFactory();
  let _doc = null;

  beforeEach(async () => {
    _user = await userFactory({});
    _segment = await segmentsFactory({});
    _doc = {
      kind: 'manual',
      method: 'email',
      title: 'Message test',
      fromUserId: _user._id,
      segmentId: _segment._id,
    };
  });

  afterEach(async () => {
    _doc = null;
    await Users.remove({});
    await Segments.remove({});
    await EngageMessages.remove({});
  });

  test('messages add', async () => {
    const _message = await mutations.messagesAdd(null, _doc);
    expect(_message.kind).toEqual(_doc.kind);
    expect(_message.title).toEqual(_doc.title);
    expect(_message.fromUserId).toEqual(_user._id);
    expect(_message.segmentId).toEqual(_segment._id);
    expect(_message.isLive).toEqual(_doc.isLive);
    expect(_message.isDraft).toEqual(_doc.isDraft);
  });

  test('messages edit', async () => {
    let message = await EngageMessages.createMessage(_doc);

    _doc.title = 'Message test updated';
    _doc.isLive = false;
    _doc.isDraft = true;

    await mutations.messageEdit(null, { _id: message._id, ..._doc });
    message = await EngageMessages.findOne({ _id: message._id });

    expect(message.kind).toEqual(_doc.kind);
    expect(message.title).toEqual(_doc.title);
    expect(message.fromUserId).toEqual(_user._id);
    expect(message.segmentId).toEqual(_segment._id);
    expect(message.isLive).toEqual(_doc.isLive);
    expect(message.isDraft).toEqual(_doc.isDraft);
  });

  test('messages remove', async () => {
    const _message = await EngageMessages.createMessage(_doc);

    const removeResult = await mutations.messagesRemove(null, _message._id);
    expect(removeResult).toBe(true);

    const messagesCounts = await EngageMessages.find({}).count();
    expect(messagesCounts).toBe(0);
  });

  test('set live', async () => {
    _doc.isLive = false;
    _doc.isDraft = true;

    let _message = await EngageMessages.createMessage(_doc);

    _message = await mutations.messagesSetLive(null, _message._id);
    expect(_message.isLive).toEqual(true);
    expect(_message.isDraft).toEqual(false);
  });

  test('set pause', async () => {
    _doc.isLive = true;

    let _message = await EngageMessages.createMessage(_doc);

    _message = await mutations.messagesSetPause(null, _message._id);
    expect(_message.isLive).toEqual(false);
  });

  test('set live manual', async () => {
    _doc.isLive = false;
    _doc.isDraft = true;

    let _message = await EngageMessages.createMessage(_doc);

    _message = await mutations.messagesSetLiveManual(null, _message._id);
    expect(_message.isLive).toEqual(true);
    expect(_message.isDraft).toEqual(false);
  });
});
