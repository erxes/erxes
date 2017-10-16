/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { userFactory, segmentsFactory, engageMessageFactory } from '../db/factories';
import { EngageMessages, Users, Segments } from '../db/models';
import mutations from '../data/resolvers/mutations';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('mutations', () => {
  let _user;
  let _segment;
  let _message;
  let _doc = null;

  beforeEach(async () => {
    _user = await userFactory({});
    _segment = await segmentsFactory({});
    _message = await engageMessageFactory({});
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

  test('Check login required', async () => {
    expect.assertions(6);

    const check = async fn => {
      try {
        await fn({}, {}, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    // add
    check(mutations.engageMessageAdd);

    // edit
    check(mutations.engageMessageEdit);

    // remove
    check(mutations.engageMessageRemove);

    // set live
    check(mutations.engageMessageSetLive);

    // set pause
    check(mutations.engageMessageSetPause);

    // set live manual
    check(mutations.engageMessageSetLiveManual);
  });

  test('Engage message remove not found', async () => {
    expect.assertions(1);
    try {
      await mutations.engageMessageRemove({}, `${_message._id}-`, { user: _user });
    } catch (e) {
      expect(e.message).toEqual(`Engage message not found with id ${_message._id}-`);
    }
  });

  test('messages create', async () => {
    EngageMessages.createEngageMessage = jest.fn();
    await mutations.engageMessageAdd(null, _doc, { user: _user });

    expect(EngageMessages.createEngageMessage).toBeCalledWith(_doc);
    expect(EngageMessages.createEngageMessage.mock.calls.length).toBe(1);
  });

  test('messages update', async () => {
    EngageMessages.updateEngageMessage = jest.fn();
    await mutations.engageMessageEdit(null, { _id: _message._id, ..._doc }, { user: _user });

    expect(EngageMessages.updateEngageMessage).toBeCalledWith(_message._id, _doc);
    expect(EngageMessages.updateEngageMessage.mock.calls.length).toBe(1);
  });

  test('messages remove', async () => {
    EngageMessages.removeEngageMessage = jest.fn();
    await mutations.engageMessageRemove(null, _message._id, { user: _user });

    expect(EngageMessages.removeEngageMessage.mock.calls.length).toBe(1);
  });

  test('set live', async () => {
    EngageMessages.engageMessageSetLive = jest.fn();
    await mutations.engageMessageSetLive(null, _message._id, { user: _user });

    expect(EngageMessages.engageMessageSetLive).toBeCalledWith(_message._id);
    expect(EngageMessages.engageMessageSetLive.mock.calls.length).toBe(1);
  });

  test('set pause', async () => {
    EngageMessages.engageMessageSetPause = jest.fn();
    await mutations.engageMessageSetPause(null, _message._id, { user: _user });

    expect(EngageMessages.engageMessageSetPause).toBeCalledWith(_message._id);
    expect(EngageMessages.engageMessageSetPause.mock.calls.length).toBe(1);
  });

  test('set live manual', async () => {
    EngageMessages.engageMessageSetLive = jest.fn();
    await mutations.engageMessageSetLiveManual(null, _message._id, { user: _user });

    expect(EngageMessages.engageMessageSetLive).toBeCalledWith(_message._id);
    expect(EngageMessages.engageMessageSetLive.mock.calls.length).toBe(1);
  });
});
