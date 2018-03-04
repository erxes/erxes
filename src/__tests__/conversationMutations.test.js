/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import Twit from 'twit';
import sinon from 'sinon';
import { connect, disconnect } from '../db/connection';
import { Conversations, ConversationMessages, Users, Customers, Integrations } from '../db/models';
import {
  conversationFactory,
  conversationMessageFactory,
  userFactory,
  integrationFactory,
  customerFactory,
} from '../db/factories';
import conversationMutations from '../data/resolvers/mutations/conversations';
import { TwitMap } from '../social/twitter';
import { twitRequest } from '../social/twitterTracker';
import { graphRequest } from '../social/facebookTracker';
import utils from '../data/utils';
import { FACEBOOK_DATA_KINDS } from '../data/constants';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Conversation message mutations', () => {
  let _conversation;
  let _conversationMessage;
  let _user;
  let _doc;
  let _integration;
  let _customer;

  beforeEach(async () => {
    // Creating test data
    _conversation = await conversationFactory();
    _conversationMessage = await conversationMessageFactory();
    _user = await userFactory();
    _customer = await customerFactory();
    _integration = await integrationFactory({ kind: 'form' });

    _conversation.integrationId = _integration._id;
    _conversation.customerId = _customer._id;
    _conversation.assignedUserId = _user._id;
    await _conversation.save();

    _doc = { ..._conversationMessage._doc, conversationId: _conversation._id };
    delete _doc['_id'];
  });

  afterEach(async () => {
    // Clearing test data
    await Conversations.remove({});
    await ConversationMessages.remove({});
    await Users.remove({});
    await Integrations.remove({});
    await Customers.remove({});

    // restore mocks
    if (utils.sendNotification.mock) {
      utils.sendNotification.mockRestore();
    }
  });

  test('Conversation login required functions', async () => {
    const checkLogin = async (fn, args) => {
      try {
        await fn({}, args, {});
      } catch (e) {
        expect(e.message).toEqual('Login required');
      }
    };

    const _ids = { _ids: [_conversation._id] };

    expect.assertions(8);

    // add message
    checkLogin(conversationMutations.conversationMessageAdd, _doc);

    // assign
    checkLogin(conversationMutations.conversationsAssign, {
      conversationIds: [_conversation._id],
      assignedUserId: _user._id,
    });

    // assign
    checkLogin(conversationMutations.conversationsUnassign, {
      conversationIds: [_conversation._id],
      assignedUserId: _user._id,
    });

    // change status
    checkLogin(conversationMutations.conversationsChangeStatus, _ids);

    // conversation star
    checkLogin(conversationMutations.conversationsStar, _ids);

    // conversation unstar
    checkLogin(conversationMutations.conversationsUnstar, _ids);

    // add or remove participated users
    checkLogin(conversationMutations.conversationsToggleParticipate, _ids);

    // mark conversation as read
    checkLogin(conversationMutations.conversationMarkAsRead, _ids);
  });

  test('Add conversation message', async () => {
    expect.assertions(7);

    ConversationMessages.addMessage = jest.fn(() => ({
      _id: 'messageObject',
    }));

    const spyNotification = jest.spyOn(utils, 'sendNotification');
    const spyEmail = jest.spyOn(utils, 'sendEmail');

    await conversationMutations.conversationMessageAdd({}, _doc, { user: _user });

    expect(ConversationMessages.addMessage.mock.calls.length).toBe(1);
    expect(ConversationMessages.addMessage).toBeCalledWith(_doc, _user._id);

    expect(spyNotification.mock.calls.length).toBe(1);

    // send notifincation
    expect(spyNotification).toBeCalledWith({
      createdUser: _user._id,
      notifType: 'conversationAddMessage',
      title: 'You have a new message.',
      content: _doc.content,
      link: `/inbox?_id=${_conversation._id}`,
      receivers: [],
    });

    // integration kind form test
    _doc['internal'] = false;
    await conversationMutations.conversationMessageAdd({}, _doc, { user: _user });

    expect(spyEmail.mock.calls.length).toBe(1);

    // send email
    expect(spyEmail).toBeCalledWith({
      to: _customer.email,
      title: 'Reply',
      template: {
        data: _doc.content,
      },
    });

    try {
      // integration not found test
      _conversation.integrationId = 'test';
      await _conversation.save();
      await conversationMutations.conversationMessageAdd({}, _doc, { user: _user });
    } catch (e) {
      expect(e.message).toEqual('Integration not found');
    }
  });

  test('Add conversation message: twitter reply', async () => {
    // mock utils functions ===============
    ConversationMessages.addMessage = jest.fn(() => ({ _id: 'messageObject' }));
    jest.spyOn(utils, 'sendNotification');
    jest.spyOn(utils, 'sendEmail');

    // mock Twit instance
    const twit = new Twit({
      consumer_key: 'consumer_key',
      consumer_secret: 'consumer_secret',
      access_token: 'access_token',
      access_token_secret: 'token_secret',
    });

    // mock twitter request
    const sandbox = sinon.sandbox.create();
    const stub = sandbox.stub(twitRequest, 'post').callsFake(() => {
      return new Promise(resolve => {
        resolve({});
      });
    });

    // creating doc ===================
    const integration = await integrationFactory({ kind: 'twitter' });
    const conversation = await conversationFactory({
      integrationId: integration._id,
      twitterData: {
        isDirectMessage: true,
        sender_id_str: 'sender_id',
      },
    });

    TwitMap[integration._id] = twit;

    _doc.conversationId = conversation._id;
    _doc.internal = false;

    // call mutation
    await conversationMutations.conversationMessageAdd({}, _doc, { user: _user });

    // check twit post params
    expect(
      stub.calledWith(twit, 'direct_messages/new', {
        user_id: 'sender_id',
        text: _doc.content,
      }),
    ).toBe(true);
  });

  test('Add conversation message: facebook reply', async () => {
    // mock settings
    process.env.FACEBOOK = JSON.stringify([
      {
        id: '1',
        name: 'name',
        accessToken: 'access_token',
      },
    ]);

    // mock utils functions ===============
    ConversationMessages.addMessage = jest.fn(() => ({ _id: 'messageObject' }));
    jest.spyOn(utils, 'sendNotification');
    jest.spyOn(utils, 'sendEmail');

    // mock graph api requests
    const getStub = sinon
      .stub(graphRequest, 'get')
      .callsFake(() => ({ access_token: 'access_token' }));

    const postStub = sinon.stub(graphRequest, 'post').callsFake(() => ({ id: 'id' }));

    // factories ============
    const integration = await integrationFactory({
      kind: 'facebook',
      facebookData: {
        appId: '1',
      },
    });

    const conversation = await conversationFactory({
      integrationId: integration._id,
      facebookData: {
        kind: FACEBOOK_DATA_KINDS.FEED,
        senderId: 'senderId',
        pageId: 'id',
        postId: 'postId',
      },
    });

    _doc.conversationId = conversation._id;
    _doc.internal = false;

    // call mutation
    await conversationMutations.conversationMessageAdd({}, _doc, { user: _user });

    // check stub ==============
    expect(postStub.called).toBe(true);

    const [arg1, arg2, arg3] = postStub.firstCall.args;

    expect(arg1).toBe('postId/comments');
    expect(arg2).toBe('access_token');
    expect(arg3).toEqual({ message: _doc.content });

    getStub.restore();
    postStub.restore();
  });

  // if user assigned to conversation
  test('Assign conversation to employee', async () => {
    Conversations.assignUserConversation = jest.fn(() => [_conversation]);

    const spyNotification = jest.spyOn(utils, 'sendNotification');

    await conversationMutations.conversationsAssign(
      {},
      { conversationIds: [_conversation._id], assignedUserId: _user._id },
      { user: _user },
    );

    expect(Conversations.assignUserConversation.mock.calls.length).toBe(1);
    expect(Conversations.assignUserConversation).toBeCalledWith([_conversation._id], _user._id);

    const content = 'Assigned user has changed';

    // send notifincation
    expect(spyNotification).toBeCalledWith({
      createdUser: _user._id,
      notifType: 'conversationAssigneeChange',
      title: content,
      content,
      link: `/inbox?_id=${_conversation._id}`,
      receivers: [],
    });
  });

  test('Unassign employee from conversation', async () => {
    Conversations.unassignUserConversation = jest.fn();

    // assign employee before unassign
    await conversationMutations.conversationsAssign(
      {},
      { conversationIds: [_conversation._id], assignedUserId: _user._id },
      { user: _user },
    );

    // unassign
    await conversationMutations.conversationsUnassign(
      {},
      { _ids: [_conversation._id] },
      { user: _user },
    );

    expect(Conversations.unassignUserConversation.mock.calls.length).toBe(1);
    expect(Conversations.unassignUserConversation).toBeCalledWith([_conversation._id]);
  });

  test('Change conversation status', async () => {
    Conversations.changeStatusConversation = jest.fn();

    const status = 'closed';
    await conversationMutations.conversationsChangeStatus(
      {},
      { _ids: [_conversation._id], status: status },
      { user: _user },
    );

    expect(Conversations.changeStatusConversation.mock.calls.length).toBe(1);
    expect(Conversations.changeStatusConversation).toBeCalledWith(
      [_conversation._id],
      status,
      _user._id,
    );
  });

  test('Conversation star', async () => {
    Conversations.starConversation = jest.fn();

    // assign employee before unassign
    await conversationMutations.conversationsStar(
      {},
      { _ids: [_conversation._id] },
      { user: _user },
    );

    expect(Conversations.starConversation.mock.calls.length).toBe(1);
    expect(Conversations.starConversation).toBeCalledWith([_conversation._id], _user._id);
  });

  test('Conversation unstar', async () => {
    Conversations.unstarConversation = jest.fn();

    const ids = [_conversation._id];

    // unstar
    await conversationMutations.conversationsUnstar({}, { _ids: ids }, { user: _user });

    expect(Conversations.unstarConversation.mock.calls.length).toBe(1);
    expect(Conversations.unstarConversation).toBeCalledWith([_conversation._id], _user._id);
  });

  test('Toggle participated users in conversation ', async () => {
    Conversations.toggleParticipatedUsers = jest.fn();

    // make sure participated users are empty
    expect(_conversation.participatedUserIds.length).toBe(0);
    await conversationMutations.conversationsToggleParticipate(
      {},
      { _ids: [_conversation._id] },
      { user: _user },
    );

    expect(Conversations.toggleParticipatedUsers.mock.calls.length).toBe(1);
    expect(Conversations.toggleParticipatedUsers).toBeCalledWith([_conversation._id], _user._id);
  });

  test('Conversation mark as read', async () => {
    Conversations.markAsReadConversation = jest.fn();

    await conversationMutations.conversationMarkAsRead(
      {},
      { _id: _conversation._id },
      { user: _user },
    );

    expect(Conversations.markAsReadConversation.mock.calls.length).toBe(1);
    expect(Conversations.markAsReadConversation).toBeCalledWith(_conversation._id, _user._id);
  });

  test('subscription call for widget api', async () => {
    await conversationMutations.conversationSubscribeMessageCreated(
      {},
      { _id: _conversationMessage._id },
    );

    await conversationMutations.conversationSubscribeChanged(
      {},
      { _ids: ['_id'], type: 'readState' },
    );
  });
});
