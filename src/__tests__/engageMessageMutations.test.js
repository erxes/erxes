/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import mutations from '../data/resolvers/mutations';
import { send } from '../data/resolvers/mutations/engageUtils';
import {
  EngageMessages,
  Users,
  Segments,
  Customers,
  EmailTemplates,
  Integrations,
  Conversations,
  ConversationMessages,
} from '../db/models';
import {
  engageMessageFactory,
  userFactory,
  segmentsFactory,
  emailTemplateFactory,
  customerFactory,
  integrationFactory,
} from '../db/factories';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('engage message mutation tests', () => {
  let _message;
  let _user;
  let _segment;
  let _customer;
  let _emailTemplate;
  let _doc = null;

  beforeEach(async () => {
    _user = await userFactory({});
    _segment = await segmentsFactory({});
    _message = await engageMessageFactory({});
    _emailTemplate = await emailTemplateFactory({});
    _customer = await customerFactory({});
    await integrationFactory({ brandId: 'brandId' });
    _doc = {
      kind: 'manual',
      method: 'email',
      title: 'Message test',
      fromUserId: _user._id,
      segmentId: _segment._id,
      isLive: true,
      customerIds: [_customer._id],
      email: {
        templateId: _emailTemplate._id,
        subject: 'String',
        content: 'String asd',
      },
    };
  });

  afterEach(async () => {
    _doc = null;
    await Users.remove({});
    await Segments.remove({});
    await EngageMessages.remove({});
    await EmailTemplates.remove({});
    await Customers.remove({});
    await Integrations.remove({});
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

  test('Engage utils send via messenger', async () => {
    expect.assertions(1);

    try {
      await send({
        _id: _message._id,
        method: 'messenger',
        title: 'Send via messenger',
        fromUserId: _user._id,
        segmentId: _segment._id,
        isLive: true,
        messenger: {
          brandId: '',
          content: 'content',
        },
      });
    } catch (e) {
      expect(e.message).toEqual('Integration not found');
    }
  });

  test('messages create', async () => {
    EngageMessages.createEngageMessage = jest.fn(() => ({
      _id: 'ghghghgh',
      ..._doc,
    }));

    EngageMessages.addNewDeliveryReport = jest.fn();
    await mutations.engageMessageAdd(null, _doc, { user: _user });

    expect(EngageMessages.createEngageMessage).toBeCalledWith(_doc);
    expect(EngageMessages.createEngageMessage.mock.calls.length).toBe(1);
    expect(EngageMessages.addNewDeliveryReport.mock.calls.length).toBe(1);
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
    EngageMessages.engageMessageSetLive = jest.fn(() => ({
      _id: _message._id,
      method: 'messenger',
      title: 'Send via messenger',
      fromUserId: _user._id,
      segmentId: _segment._id,
      isLive: true,
      customerIds: [_customer._id],
      messenger: {
        brandId: 'brandId',
        content: 'messenger content {{ customer.name }}',
      },
    }));

    Conversations.createConversation = jest.fn();
    ConversationMessages.createMessage = jest.fn();

    await mutations.engageMessageSetLiveManual(null, _message._id, { user: _user });

    expect(EngageMessages.engageMessageSetLive).toBeCalledWith(_message._id);
    expect(EngageMessages.engageMessageSetLive.mock.calls.length).toBe(1);
    expect(Conversations.createConversation.mock.calls.length).toBe(1);
    expect(ConversationMessages.createMessage.mock.calls.length).toBe(1);
  });
});
