/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Conversations, ConversationMessages, Users } from '../db/models';
import { conversationFactory, conversationMessageFactory, userFactory } from '../db/factories';
import conversationMutations from '../data/resolvers/mutations/conversations';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Conversation message db', () => {
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
    const messageObj = await ConversationMessages.addMessage(_doc, _user);

    expect(messageObj.content).toBe(_conversationMessage.content);
    expect(messageObj.attachments).toBe(_conversationMessage.attachments);
    expect(messageObj.status).toBe(_conversationMessage.status);
    expect(messageObj.mentionedUserIds[0]).toBe(_conversationMessage.mentionedUserIds[0]);
    expect(messageObj.conversationId).toBe(_conversation._id);
    expect(messageObj.internal).toBe(_conversationMessage.internal);
    expect(messageObj.customerId).toBe(_conversationMessage.customerId);
    expect(messageObj.isCustomerRead).toBe(_conversationMessage.isCustomerRead);
    expect(messageObj.engageData).toBe(_conversationMessage.engageData);
    expect(messageObj.formWidgetData).toBe(_conversationMessage.formWidgetData);
    expect(messageObj.facebookData._id).toBe(_conversationMessage.facebookData._id);
    expect(messageObj.userId).toBe(_user._id);
  });

  // if user assigned to conversation
  test('Assign conversation to employee', async () => {
    await Conversations.assignUserConversation([_conversation._id], _user.id);

    const conversationObj = await Conversations.findOne({ _id: _conversation._id });

    expect(conversationObj.assignedUserId).toBe(_user._id);
  });

  test('Unassign employee from conversation', async () => {
    // assign employee before unassign
    await Conversations.assignUserConversation([_conversation._id], _user.id);

    // unassign
    await Conversations.unassignUserConversation([_conversation._id]);

    const conversationObj = await Conversations.findOne({ _id: _conversation._id });

    expect(conversationObj.assignedUserId).toBe(undefined);
  });

  test('Change conversation status', async () => {
    await Conversations.changeStatusConversation([_conversation._id], 'new');

    const conversationObj = await Conversations.findOne({ _id: _conversation._id });

    expect(conversationObj.status).toBe('new');
  });

  test('Conversation star', async () => {
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
    // make sure participated users is empty
    expect(_conversation.participatedUserIds.length).toBe(0);

    // add user to conversation
    await Conversations.toggleParticipatedUsers([_conversation._id], _user.id);

    const conversationObj = await Conversations.findOne({ _id: _conversation.id });

    expect(conversationObj.participatedUserIds[0]).toBe(_user._id);

    // remove user from conversation
    await Conversations.toggleParticipatedUsers([_conversation._id], _user.id);

    const conversationObjWithParticipatedUser = await Conversations.findOne({
      _id: _conversation.id,
    });

    expect(conversationObjWithParticipatedUser.participatedUserIds.length).toBe(0);
  });

  test('Conversation mark as read', async () => {
    // first user read this conversation
    await Conversations.markAsReadConversation(_conversation._id, _user._id);

    const conversationObj = await Conversations.findOne({ _id: _conversation._id });

    expect(conversationObj.readUserIds[0]).toBe(_user._id);

    const second_user = await userFactory();

    // multiple users read conversation
    await Conversations.markAsReadConversation(_conversation._id, second_user._id, false);
  });
});
