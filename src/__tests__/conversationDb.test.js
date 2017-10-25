/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Conversations, ConversationMessages, Users } from '../db/models';
import { conversationFactory, conversationMessageFactory, userFactory } from '../db/factories';
import { CONVERSATION_STATUSES } from '../data/constants';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Conversation db', () => {
  let _conversation;
  let _conversationMessage;
  let _user;
  let _doc;

  beforeEach(async () => {
    // Creating test data
    _conversation = await conversationFactory();
    _conversationMessage = await conversationMessageFactory({ conversationId: _conversation._id });
    _user = await userFactory();

    _doc = { ..._conversationMessage._doc, conversationId: _conversation._id };
    delete _doc['_id'];
  });

  afterEach(async () => {
    // Clearing test data
    await Conversations.remove({});
    await ConversationMessages.remove({});
    await Users.remove({});
  });

  test('Create conversation', async () => {
    const _number = (await Conversations.find().count()) + 1;
    const conversation = await Conversations.createConversation({
      content: _conversation.content,
      assignedUserId: _user._id,
      integrationId: 'test',
      participatedUserIds: [_user._id],
      readUserIds: [_user._id],
    });

    expect(conversation).toBeDefined();
    expect(conversation.content).toBe(_conversation.content);
    expect(conversation.status).toBe(CONVERSATION_STATUSES.NEW);
    expect(conversation.number).toBe(_number);
    expect(conversation.messageCount).toBe(0);
  });

  test('Check conversation existance', async () => {
    const { selector, conversations } = await Conversations.checkExistanceConversations([
      _conversation._id,
    ]);
    expect(conversations[0]._id).toBe(_conversation._id);
    expect(selector).toEqual({ _id: { $in: [_conversation._id] } });

    // wrong conversation ids
    try {
      await Conversations.checkExistanceConversations(['test']);
    } catch (e) {
      expect(e.message).toEqual('Conversation not found.');
    }
  });
  test('Create conversation message', async () => {
    expect.assertions(17);

    // get messageCount before add message
    const prevConversationObj = await Conversations.findOne({ _id: _doc.conversationId });

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

    try {
      // without content
      _doc.attachments = [];
      _doc.content = '';
      await ConversationMessages.addMessage(_doc, _user);
    } catch (e) {
      expect(e.message).toEqual('Content is required');
    }

    try {
      // without conversation
      _doc.conversationId = 'test';
      await ConversationMessages.addMessage(_doc, _user);
    } catch (e) {
      expect(e.message).toEqual('Conversation not found with id test');
    }

    // get messageCount after add message
    const afterConversationObj = await Conversations.findOne({ _id: messageObj.conversationId });

    // check mendtioned users
    for (let mentionedUser of messageObj.mentionedUserIds) {
      expect(afterConversationObj.participatedUserIds).toContain(mentionedUser);
    }

    // check participated users
    expect(afterConversationObj.participatedUserIds).toContain(messageObj.userId);

    // check if message count increase
    expect(afterConversationObj.messageCount).toBe(prevConversationObj.messageCount + 1);
  });

  // if user assigned to conversation
  test('Assign conversation to employee', async () => {
    await Conversations.assignUserConversation([_conversation._id], _user.id);

    const conversationObj = await Conversations.findOne({ _id: _conversation._id });

    expect(conversationObj.assignedUserId).toBe(_user._id);

    // without assign user
    try {
      await Conversations.assignUserConversation([_conversation._id], undefined);
    } catch (e) {
      expect(e.message).toEqual('User not found with id undefined');
    }
  });

  test('Unassign employee from conversation', async () => {
    // assign employee before unassign
    await Conversations.assignUserConversation([_conversation._id], _user.id);

    // unassign
    await Conversations.unassignUserConversation([_conversation._id]);

    const conversationObj = await Conversations.findOne({ _id: _conversation._id });

    expect(conversationObj.assignedUserId).toBeUndefined();
  });

  test('Change conversation status', async () => {
    await Conversations.changeStatusConversation([_conversation._id], 'new');

    const conversationObj = await Conversations.findOne({ _id: _conversation._id });

    expect(conversationObj.status).toBe('new');
  });

  test('Conversation star', async () => {
    const user = await Conversations.starConversation([_conversation._id], _user._id);

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
    const user = await Conversations.unstarConversation(ids, _user._id);

    expect(user.details.starredConversationIds.length).toBe(0);
  });

  test('Toggle participated users in conversation ', async () => {
    // make sure participated users is empty
    expect(_conversation.participatedUserIds.length).toBe(0);

    // add user to conversation
    await Conversations.toggleParticipatedUsers([_conversation._id], _user.id);

    const conversationObj = await Conversations.findOne({ _id: _conversation.id });

    expect(conversationObj.participatedUserIds).toContain(_user._id);

    // remove user from conversation
    await Conversations.toggleParticipatedUsers([_conversation._id], _user.id);

    const conversationObjWithParticipatedUser = await Conversations.findOne({
      _id: _conversation.id,
    });

    expect(conversationObjWithParticipatedUser.participatedUserIds.includes(_user.id)).toBeFalsy();
  });

  test('Conversation mark as read', async () => {
    // first user read this conversation
    _conversation.readUserIds = '';
    _conversation.save();

    await Conversations.markAsReadConversation(_conversation._id, _user._id);

    const conversationObj = await Conversations.findOne({ _id: _conversation._id });

    expect(conversationObj.readUserIds[0]).toBe(_user._id);

    const secondUser = await userFactory();

    // multiple users read conversation
    await Conversations.markAsReadConversation(_conversation._id, secondUser._id);

    try {
      // without conversation
      await Conversations.markAsReadConversation('test', secondUser._id);
    } catch (e) {
      expect(e.message).toEqual('Conversation not found with id test');
    }
  });

  test('Conversation message remove', async () => {
    // get conversation message count before message delete
    await ConversationMessages.addMessage(_doc, _user);

    const beforeConversation = await Conversations.findOne({
      _id: _conversationMessage.conversationId,
    });

    await ConversationMessages.removeMessages({ _id: { $in: [_conversationMessage._id] } });

    expect(await ConversationMessages.find({ _id: _conversationMessage._id }).count()).toBe(0);

    const afterConversation = await Conversations.findOne({
      _id: _conversationMessage.conversationId,
    });

    // Conversation message count subtracted
    expect(beforeConversation.messageCount).toBe(afterConversation.messageCount + 1);
  });

  test('Conversation message', async () => {
    expect(await ConversationMessages.getNonAsnweredMessage(_conversation._id).count()).toBe(1);
    // expect(question)

    await ConversationMessages.update(
      { conversationId: _conversation._id },
      { $set: { isCustomerRead: false, internal: false } },
    );

    expect(await ConversationMessages.getAdminMessages(_conversation._id).count()).toBe(1);

    await ConversationMessages.markSentAsReadMessages(_conversation._id);

    const messagesMarkAsRead = await ConversationMessages.find({ _id: _conversation._id });

    for (let message in messagesMarkAsRead) {
      expect(message.isCustomerRead).toBeTruthy();
    }

    expect(await Conversations.newOrOpenConversation().count()).toBe(1);
  });
});
