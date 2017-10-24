/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

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
import utils from '../data/utils';

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
      link: `/inbox/details/${_conversation._id}`,
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
      link: `/inbox/details/${_conversation._id}`,
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
    expect(Conversations.changeStatusConversation).toBeCalledWith([_conversation._id], status);
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
});
