/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Conversations, ConversationMessages, Users } from '../db/models';
import { conversationFactory, conversationMessageFactory, userFactory } from '../db/factories';
import conversationMutations from '../data/resolvers/mutations/conversations';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Conversation message mutations', () => {
  let _conversation;
  let _conversationMessage;
  let _user;
  let _doc;

  beforeEach(async () => {
    // Creating test data
    _conversation = await conversationFactory();
    _conversationMessage = await conversationMessageFactory();
    _user = await userFactory();
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

  test('Create conversation message', async () => {
    const conversationObj = await conversationMutations.conversationMessageAdd({}, _doc, {
      user: _user,
    });

    expect(conversationObj).toBeDefined();
    expect(conversationObj.content).toBe(_conversationMessage.content);
    expect(conversationObj.attachments).toBe(_conversationMessage.attachments);
    expect(conversationObj.status).toBe(_conversationMessage.status);
    expect(conversationObj.mentionedUserIds[0]).toBe(_conversationMessage.mentionedUserIds[0]);
    expect(conversationObj.conversationId).toBe(_conversation._id);
    expect(conversationObj.internal).toBe(_conversationMessage.internal);
    expect(conversationObj.customerId).toBe(_conversationMessage.customerId);
    expect(conversationObj.isCustomerRead).toBe(_conversationMessage.isCustomerRead);
    expect(conversationObj.engageData).toBe(_conversationMessage.engageData);
    expect(conversationObj.formWidgetData).toBe(_conversationMessage.formWidgetData);
    expect(conversationObj.facebookData).toBe(_conversationMessage.facebookData);
    expect(conversationObj.userId).toBe(_user._id);
  });

  // check conversation if integration doesn't found
  test('Create conversation message without integration', async () => {
    expect.assertions(1);

    _doc['internal'] = false;
    try {
      await conversationMutations.conversationMessageAdd({}, _doc, { user: _user });
    } catch (e) {
      expect(e.message).toEqual('Integration not found');
    }
  });

  // if user assigned to conversation
  test('Assign conversation to employee', async () => {
    await conversationMutations.conversationsAssign(
      {},
      { conversationIds: [_conversation._id], assignedUserId: _user._id },
      { user: _user },
    );

    const conversation_list = await Conversations.find({ _id: { $in: [_conversation._id] } });
    conversation_list.forEach(conversationObj => {
      expect(conversationObj.assignedUserId).toBe(_user._id);
    });
  });

  test('Unassign employee from conversation', async () => {
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

    const conversationObj = await Conversations.findOne({ _id: _conversation._id });
    expect(conversationObj.assignedUserId).toBe(undefined);
  });

  test('Change conversation status', async () => {
    // assign employee before unassign
    await conversationMutations.conversationsChangeStatus(
      {},
      { _ids: [_conversation._id] },
      { user: _user },
    );

    const conversationObj = await Conversations.findOne({ _id: _conversation._id });
    expect(conversationObj.status).toBe('new');
  });

  test('Conversation star', async () => {
    // assign employee before unassign
    await conversationMutations.conversationsStar(
      {},
      { _ids: [_conversation._id] },
      { user: _user },
    );

    const user = await Users.findOne({ _id: _user._id });
    expect(user.details.starredConversationIds[0]).toBe(_conversation._id);
  });

  test('Conversation unstar', async () => {
    const ids = [_conversation._id];

    // star first before unstar
    await Users.update(
      { _id: _user.id },
      {
        $addToSet: {
          'details.starredConversationIds': { $each: ids },
        },
      },
    );

    // unstar
    await conversationMutations.conversationsUnstar({}, { _ids: ids }, { user: _user });

    const user = await Users.findOne({ _id: _user._id });
    expect(user.details.starredConversationIds.length).toBe(0);
  });

  test('Toggle participated users in conversation ', async () => {
    // make sure participated users are empty
    expect(_conversation.participatedUserIds.length).toBe(0);
    await conversationMutations.conversationsToggleParticipate(
      {},
      { _ids: [_conversation._id] },
      { user: _user },
    );

    const conversationObj = await Conversations.findOne({ _id: _conversation.id });

    // check if participated user is added
    expect(conversationObj.participatedUserIds[0]).toBe(_user._id);

    await conversationMutations.conversationsToggleParticipate(
      {},
      { _ids: [_conversation._id] },
      { user: _user },
    );

    const conversationObjWithParticipatedUser = await Conversations.findOne({
      _id: _conversation.id,
    });

    // check if participated user is add
    expect(conversationObjWithParticipatedUser.participatedUserIds.length).toBe(0);
  });

  test('Conversation mark as read', async () => {
    await conversationMutations.conversationMarkAsRead(
      {},
      { _id: _conversation._id },
      { user: _user },
    );
    const conversationObj = await Conversations.findOne({ _id: _conversation._id });
    expect(conversationObj.readUserIds[0]).toBe(_user._id);
  });
});
