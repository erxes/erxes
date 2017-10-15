/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Conversations, ConversationMessages, Users } from '../db/models';
import {
  conversationFactory,
  conversationMessageFactory,
  userFactory,
  integrationFactory,
  customerFactory,
} from '../db/factories';
import conversationMutations from '../data/resolvers/mutations/conversations';

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

    _doc = {
      content: _conversationMessage.content,
      attachments: _conversationMessage.attachments,
      status: _conversationMessage.status,
      mentionedUserIds: _conversationMessage.mentionedUserIds,
      conversationId: _conversation._id,
      internal: _conversationMessage.internal,
      customerId: _conversationMessage.customerId,
      isCustomerRead: _conversationMessage.isCustomerRead,
      engageData: _conversationMessage.engageData,
      formWidgetData: _conversationMessage.formWidgetData,
      facebookData: _conversationMessage.facebookData,
    };
  });

  afterEach(async () => {
    // Clearing test data
    await Conversations.remove({});
    await ConversationMessages.remove({});
    await Users.remove({});
  });

  test('Conversation login required functions', async () => {
    expect.assertions(8);
    try {
      await conversationMutations.conversationMessageAdd({}, _doc, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }

    // assign
    try {
      await conversationMutations.conversationsAssign(
        {},
        { conversationIds: [_conversation._id], assignedUserId: _user._id },
        {},
      );
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }

    // unassign
    try {
      await conversationMutations.conversationsUnassign(
        {},
        { conversationIds: [_conversation._id], assignedUserId: _user._id },
        {},
      );
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }

    // change status
    try {
      await conversationMutations.conversationsChangeStatus({}, { _ids: [_conversation._id] }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }

    // conversation star
    try {
      await conversationMutations.conversationsStar({}, { _ids: [_conversation._id] }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }

    // conversation unstar
    try {
      await conversationMutations.conversationsUnstar({}, { _ids: [_conversation._id] }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }

    // add or remove participated users
    try {
      await conversationMutations.conversationsToggleParticipate(
        {},
        { _ids: [_conversation._id] },
        {},
      );
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }

    // mark conversation as read
    try {
      await conversationMutations.conversationMarkAsRead({}, { _ids: [_conversation._id] }, {});
    } catch (e) {
      expect(e.message).toEqual('Login required');
    }
  });

  test('Add conversation message', async () => {
    expect.assertions(3);
    ConversationMessages.addMessage = jest.fn(() => ({
      _id: 'messageObject',
    }));

    await conversationMutations.conversationMessageAdd({}, _doc, { user: _user });

    expect(ConversationMessages.addMessage.mock.calls.length).toBe(1);
    expect(ConversationMessages.addMessage).toBeCalledWith(_doc, _user._id);

    // integration kind form test
    _doc['internal'] = false;
    await conversationMutations.conversationMessageAdd({}, _doc, { user: _user });

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
    Conversations.assignUserConversation = jest.fn();

    await conversationMutations.conversationsAssign(
      {},
      { conversationIds: [_conversation._id], assignedUserId: _user._id },
      { user: _user },
    );

    expect(Conversations.assignUserConversation.mock.calls.length).toBe(1);
    expect(Conversations.assignUserConversation).toBeCalledWith([_conversation._id], _user._id);
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
