import { PassThrough } from 'stream';
import {
  conversationFactory,
  conversationMessageFactory,
  customerFactory,
  engageDataFactory,
  engageMessageFactory,
  userFactory
} from '../db/factories';
import { ConversationMessages, Conversations, Users } from '../db/models';
import { CONVERSATION_STATUSES } from '../db/models/definitions/constants';
import './setup.ts';

describe('Conversation db', () => {
  let _conversation;
  let _conversationMessage;
  let _user;
  let _doc;

  beforeEach(async () => {
    // Creating test data
    _conversation = await conversationFactory({});
    _conversationMessage = await conversationMessageFactory({
      conversationId: _conversation._id,
      internal: false,
      content: 'content'
    });

    _user = await userFactory({});

    _doc = { ..._conversationMessage._doc, conversationId: _conversation._id };

    delete _doc._id;
  });

  afterEach(async () => {
    // Clearing test data
    await Conversations.deleteMany({});
    await ConversationMessages.deleteMany({});
    await Users.deleteMany({});
  });

  test('Get conversation message', async () => {
    try {
      await ConversationMessages.getMessage('fakeId');
    } catch (e) {
      expect(e.message).toBe('Conversation message not found');
    }

    const response = await ConversationMessages.getMessage(
      _conversationMessage._id
    );

    expect(response).toBeDefined();
  });

  test('Get conversation', async () => {
    try {
      await Conversations.getConversation('fakeId');
    } catch (e) {
      expect(e.message).toBe('Conversation not found');
    }

    const response = await Conversations.getConversation(_conversation._id);

    expect(response).toBeDefined();
  });

  test('Create conversation', async () => {
    const _number = (await Conversations.find().countDocuments()) + 1;
    const conversation = await Conversations.createConversation({
      integrationId: 'test',
      content: _conversation.content,
      assignedUserId: _user._id,
      participatedUserIds: [_user._id],
      readUserIds: [_user._id],
      status: CONVERSATION_STATUSES.NEW
    });

    expect(conversation).toBeDefined();
    expect(conversation.content).toBe(_conversation.content);
    expect(conversation.createdAt).toEqual(expect.any(Date));
    expect(conversation.updatedAt).toEqual(expect.any(Date));
    expect(conversation.status).toBe(CONVERSATION_STATUSES.NEW);
    expect(conversation.number).toBe(_number);
    expect(conversation.messageCount).toBe(0);
  });

  test('Check conversation existance', async () => {
    const {
      selector,
      conversations
    } = await Conversations.checkExistanceConversations([_conversation._id]);

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
    // setting updatedAt to null to check when new message updatedAt field
    // must be setted
    _conversation.updatedAt = null;
    await _conversation.save();

    const messageObj = await ConversationMessages.addMessage(_doc, _user);

    // checking updated conversation
    const updatedConversation = await Conversations.findOne({
      _id: _doc.conversationId
    });

    if (!updatedConversation) {
      throw new Error('Updated conversation not found');
    }

    if (!messageObj || !messageObj.mentionedUserIds || !messageObj.engageData) {
      throw new Error('');
    }

    expect(updatedConversation.updatedAt).toEqual(expect.any(Date));
    expect(updatedConversation.messageCount).toBe(2);

    expect(messageObj.content).toBe(_conversationMessage.content);
    expect(messageObj.attachments.length).toBe(0);
    expect(messageObj.mentionedUserIds[0]).toBe(
      _conversationMessage.mentionedUserIds[0]
    );

    expect(messageObj.conversationId).toBe(_conversation._id);
    expect(messageObj.internal).toBe(_conversationMessage.internal);
    expect(messageObj.customerId).toBe(_conversationMessage.customerId);
    expect(messageObj.isCustomerRead).toBe(_conversationMessage.isCustomerRead);

    expect(messageObj.engageData.toJSON()).toEqual(
      _conversationMessage.engageData.toJSON()
    );
    expect(messageObj.formWidgetData).toEqual(
      _conversationMessage.formWidgetData
    );

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
    const afterConversationObj = await Conversations.findOne({
      _id: messageObj.conversationId
    });

    if (!afterConversationObj) {
      throw new Error('Conversation not found');
    }

    // check mendtioned users
    for (const mentionedUser of messageObj.mentionedUserIds) {
      expect(afterConversationObj.participatedUserIds).toContain(mentionedUser);
    }

    // check participated users
    expect(afterConversationObj.participatedUserIds).toContain(
      messageObj.userId
    );

    // check if message count increase
    expect(afterConversationObj.messageCount).toBe(2);

    // Do not update conversation message count when bot message
    _doc.fromBot = true;
    _doc.content = 'content';
    _doc.conversationId = messageObj.conversationId;

    let conversation = await Conversations.getConversation(_doc.conversationId);
    const prevMessageCount = conversation.messageCount;

    await ConversationMessages.addMessage(_doc, _user);

    conversation = await Conversations.getConversation(_doc.conversationId);
    const updatedMessageCount = conversation.messageCount;

    expect(prevMessageCount).toBe(updatedMessageCount);
  });

  // if user assigned to conversation
  test('Assign conversation to employee', async () => {
    await Conversations.assignUserConversation([_conversation._id], _user.id);

    const conversationObj = await Conversations.findOne({
      _id: _conversation._id
    });

    if (!conversationObj) {
      throw new Error('conversation not found');
    }

    expect(conversationObj.assignedUserId).toBe(_user._id);

    // without assign user
    try {
      await Conversations.assignUserConversation(
        [_conversation._id],
        undefined
      );
    } catch (e) {
      expect(e.message).toEqual('User not found with id undefined');
    }
  });

  test('Unassign employee from conversation', async () => {
    // assign employee before unassign
    await Conversations.assignUserConversation([_conversation._id], _user.id);

    // unassign
    await Conversations.unassignUserConversation([_conversation._id]);

    const conversationObj = await Conversations.findOne({
      _id: _conversation._id
    });

    if (!conversationObj) {
      throw new Error('Conversation not found');
    }

    expect(conversationObj.assignedUserId).toBeUndefined();
  });
  test('Change customer status', async () => {
    await Conversations.changeStatusConversation([_conversation._id], 'open');
    const conversation = await Conversations.findOne();
    if (conversation) {
      expect(conversation.customerId).toBe(_conversation.customerId);
      expect(conversation.status).toBe('open');
    }
    expect(await Conversations.countDocuments()).toBe(1);
    const customerStatusMessages = await Conversations.changeCustomerStatus(
      'left',
      _conversation.customerId,
      _conversation.integrationId
    );
    expect(customerStatusMessages.length).toEqual(1);
    for (const row of customerStatusMessages) {
      const data = await row;
      expect(data.content).toBe('Customer has left');
    }
  });
  test('Change conversation status', async () => {
    // try closing ========================
    await Conversations.changeStatusConversation([_conversation._id], 'closed');

    let conversationObj = await Conversations.findOne({
      _id: _conversation._id
    });

    if (!conversationObj) {
      throw new Error('Conversation not found');
    }

    expect(conversationObj.closedAt).toEqual(expect.any(Date));
    expect(conversationObj.status).toBe('closed');

    // try reopening ========================
    await Conversations.changeStatusConversation([_conversation._id], 'open');

    conversationObj = await Conversations.findOne({ _id: _conversation._id });

    if (!conversationObj) {
      throw new Error('Conversation not found');
    }

    expect(conversationObj.closedAt).toBeNull();
    expect(conversationObj.closedUserId).toBeNull();
    expect(conversationObj.status).toBe('open');
  });

  test('Resolve all conversation', async () => {
    // try closing ========================
    const updated = await Conversations.resolveAllConversation({}, _user._id);

    const conversationObj = await Conversations.findOne({
      _id: _conversation._id
    });

    if (!conversationObj) {
      throw new Error('Conversation not found');
    }

    const conversationCount = await Conversations.find().count();

    expect(conversationObj.closedAt).toEqual(expect.any(Date));
    expect(conversationObj.status).toBe('closed');
    expect(updated.nModified).toBe(conversationCount);
  });

  test('Conversation mark as read', async () => {
    // first user read this conversation
    _conversation.readUserIds = [];
    await _conversation.save();

    await Conversations.markAsReadConversation(_conversation._id, _user._id);

    const conversationObj = await Conversations.findOne({
      _id: _conversation._id
    });

    if (!conversationObj || !conversationObj.readUserIds) {
      throw new Error('Conversation not found');
    }

    expect(conversationObj.readUserIds).toContain(_user._id);

    // if current user is in read users list
    _conversation.readUserIds = [_user._id];
    await _conversation.save();

    await Conversations.markAsReadConversation(_conversation._id, _user._id);

    const secondUser = await userFactory({});

    // multiple users read conversation
    await Conversations.markAsReadConversation(
      _conversation._id,
      secondUser._id
    );

    try {
      // without conversation
      await Conversations.markAsReadConversation('test', secondUser._id);
    } catch (e) {
      expect(e.message).toEqual('Conversation not found with id test');
    }
  });

  test('Conversation message', async () => {
    await conversationMessageFactory({
      conversationId: _conversation._id,
      internal: false
    });

    // non answered messages =========
    const nonAnweredMessage = await ConversationMessages.getNonAsnweredMessage(
      _conversation._id
    );

    expect(nonAnweredMessage._id).toBeDefined();

    // admin messages =========
    await ConversationMessages.updateMany(
      { conversationId: _conversation._id },
      { $set: { isCustomerRead: false, internal: false } }
    );

    const adminMessages = await ConversationMessages.getAdminMessages(
      _conversation._id
    );

    expect(adminMessages.length).toBe(2);

    // mark sent as read messages ==================
    await ConversationMessages.updateMany(
      { conversationId: _conversation._id },
      { $unset: { isCustomerRead: 1 } },
      { multi: true }
    );

    await ConversationMessages.markSentAsReadMessages(_conversation._id);

    const messagesMarkAsRead = await ConversationMessages.find({
      conversationId: _conversation._id
    });

    for (const message of messagesMarkAsRead) {
      expect(message.isCustomerRead).toBeTruthy();
    }

    const newOrOpenConversations = await Conversations.newOrOpenConversation();

    expect(newOrOpenConversations.length).toBe(1);
  });

  test('Reopen', async () => {
    const conversation = await conversationFactory({
      status: 'closed',
      closedAt: new Date(),
      closedUserId: 'DFAFSAFDSFSFSAFD',
      readUserIds: ['DFJAKSFJDKFJSDF']
    });

    const updatedConversation = await Conversations.reopen(conversation._id);

    if (!updatedConversation || !updatedConversation.readUserIds) {
      throw new Error('Conversation not found');
    }

    expect(updatedConversation.status).toBe('open');
    expect(updatedConversation.readUserIds.length).toBe(0);
    expect(updatedConversation.closedAt).toBeNull();
    expect(updatedConversation.closedUserId).toBeNull();
  });

  test('changeCustomer', async () => {
    const customer = await customerFactory({});
    const newCustomer = await customerFactory({});

    await conversationFactory({
      customerId: customer._id
    });

    const updatedConversation = await Conversations.changeCustomer(
      newCustomer._id,
      [customer._id]
    );

    const conversationMessages = await ConversationMessages.find({
      customerId: { $in: [customer._id] }
    });

    for (const conversation of updatedConversation) {
      expect(conversation.customerId).toBe(newCustomer._id);
    }

    expect(
      await Conversations.find({ customerId: { $in: [customer._id] } })
    ).toHaveLength(0);
    expect(conversationMessages).toHaveLength(0);
  });

  test('removeCustomerConversations', async () => {
    const customer = await customerFactory({});

    const conversation = await conversationFactory({
      customerId: customer._id
    });

    await conversationFactory({
      customerId: customer._id
    });

    await Conversations.removeCustomersConversations([customer._id]);

    expect(await Conversations.find({ customerId: customer._id })).toHaveLength(
      0
    );
    expect(
      await ConversationMessages.find({ conversationId: conversation._id })
    ).toHaveLength(0);
  });

  test('forceReadCustomerPreviousEngageMessages', async () => {
    const customerId = '_id';

    // isCustomRead is defined ===============
    await conversationMessageFactory({
      customerId,
      engageData: engageDataFactory({ messageId: '_id' }),
      isCustomerRead: false
    });

    await ConversationMessages.forceReadCustomerPreviousEngageMessages(
      customerId
    );

    let messages = await ConversationMessages.find({
      customerId,
      engageData: { $exists: true },
      isCustomerRead: true
    });

    expect(messages.length).toBe(1);

    // isCustomRead is undefined ===============
    await ConversationMessages.deleteMany({});

    await conversationMessageFactory({
      customerId,
      engageData: engageDataFactory({ messageId: '_id' })
    });

    await ConversationMessages.forceReadCustomerPreviousEngageMessages(
      customerId
    );

    messages = await ConversationMessages.find({
      customerId,
      engageData: { $exists: true },
      isCustomerRead: true
    });

    expect(messages.length).toBe(1);
  });

  test('widgetsUnreadMessagesQuery', async () => {
    const conversation = await conversationFactory({});

    const response = await Conversations.widgetsUnreadMessagesQuery([
      conversation
    ]);

    expect(JSON.stringify(response)).toBe(
      JSON.stringify({
        conversationId: { $in: [conversation._id] },
        userId: { $exists: true },
        internal: false,
        isCustomerRead: { $ne: true }
      })
    );
  });

  test('updateConversation', async () => {
    const conversation = await conversationFactory({});

    await Conversations.updateConversation(conversation._id, {
      content: 'updated'
    });

    const updated = await Conversations.findOne({ _id: conversation._id });

    expect(updated && updated.content).toBe('updated');
  });

  test('removeEngageConversations', async () => {
    const engageMessage = await engageMessageFactory({ kind: 'visitorAuto' });
    const conversation = await conversationFactory({});

    await conversationMessageFactory({
      conversationId: conversation._id,
      engageData: {
        engageKind: engageMessage.kind,
        messageId: engageMessage._id
      }
    });

    await Conversations.removeEngageConversations(engageMessage._id);

    expect(
      await ConversationMessages.find({ conversationId: conversation._id })
    ).toHaveLength(0);
  });
});
