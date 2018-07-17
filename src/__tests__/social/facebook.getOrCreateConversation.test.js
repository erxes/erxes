/* eslint-env jest */

import sinon from 'sinon';
import { connect, disconnect } from '../../db/connection';
import { SaveWebhookResponse } from '../../trackers/facebook';
import { graphRequest } from '../../trackers/facebookTracker';
import { Conversations, ConversationMessages } from '../../db/models';
import { integrationFactory, customerFactory } from '../../db/factories';
import { CONVERSATION_STATUSES, FACEBOOK_DATA_KINDS } from '../../data/constants';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('facebook integration: get or create conversation', () => {
  const senderId = 2242424244;
  const pageId = '2252525525';
  const recipientId = '343434343433';

  beforeEach(() => {
    // mock all requests
    sinon.stub(graphRequest, 'get').callsFake(() => {});
  });

  afterEach(async () => {
    graphRequest.get.restore(); // unwraps the spy

    // clear
    await Conversations.remove({});
    await ConversationMessages.remove({});
  });

  test('get or create conversation', async () => {
    const postId = '32242442442';
    const customerId = await customerFactory();
    const integration = await integrationFactory();

    const saveWebhookResponse = new SaveWebhookResponse('access_token', integration, {});

    saveWebhookResponse.currentPageId = pageId;

    // checking non exising page response =======
    saveWebhookResponse.data = { object: 'page', entry: [{}] };

    expect(await saveWebhookResponse.start()).toBe(null);

    saveWebhookResponse.data = {};

    // mock getOrCreateCustomer ==========
    sinon.stub(saveWebhookResponse, 'getOrCreateCustomer').callsFake(() => customerId);

    // check initial states
    expect(await Conversations.count()).toBe(0);
    expect(await ConversationMessages.count()).toBe(0);

    const facebookData = {
      kind: FACEBOOK_DATA_KINDS.FEED,
      senderId,
      postId,
    };

    const filter = {
      'facebookData.kind': FACEBOOK_DATA_KINDS.FEED,
      'facebookData.postId': postId,
    };

    // customer said hi ======================
    await saveWebhookResponse.getOrCreateConversation({
      findSelector: filter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData,
      content: 'hi',
    });

    // must be created new conversation, new message
    expect(await Conversations.count()).toBe(1);
    expect(await ConversationMessages.count()).toBe(1);

    let conversation = await Conversations.findOne({});
    expect(conversation.status).toBe(CONVERSATION_STATUSES.NEW);

    // customer commented on above converstaion ===========
    await saveWebhookResponse.getOrCreateConversation({
      findSelector: filter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData,
      content: 'hey',
    });

    // must not be created new conversation, new message
    expect(await Conversations.count()).toBe(1);
    expect(await ConversationMessages.count()).toBe(2);

    // close converstaion
    await Conversations.update({}, { $set: { status: CONVERSATION_STATUSES.CLOSED } });

    // customer commented on closed converstaion ===========
    await saveWebhookResponse.getOrCreateConversation({
      findSelector: filter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData,
      content: 'hi again',
    });

    // must be created new conversation, new message
    expect(await Conversations.count()).toBe(2);

    // previous conversation must be stay intact
    conversation = await Conversations.findOne({ _id: conversation._id });
    expect(conversation.status).toBe(CONVERSATION_STATUSES.CLOSED);

    // checking updatedAt field
    expect(conversation.createdAt).not.toEqual(conversation.updatedAt);

    expect(await ConversationMessages.count()).toBe(3);

    // new post ===========
    filter.postId = '34424242444242';

    await saveWebhookResponse.getOrCreateConversation({
      findSelector: filter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData,
      content: 'new sender hi',
    });

    // must be created new conversation, new message
    expect(await Conversations.count()).toBe(3);
    expect(await ConversationMessages.count()).toBe(4);

    const messengerFilter = {
      'facebookData.kind': FACEBOOK_DATA_KINDS.MESSENGER,
      $or: [
        {
          'facebookData.senderId': senderId,
          'facebookData.recipientId': recipientId,
        },
        {
          'facebookData.senderId': recipientId,
          'facebookData.recipientId': senderId,
        },
      ],
    };

    const messengerFacebookData = {
      kind: FACEBOOK_DATA_KINDS.MESSENGER,
      senderId,
      senderName: 'Facebook user',
      recipientId,
    };

    // new messenger conversation ===========
    const { conversationId } = await saveWebhookResponse.getOrCreateConversation({
      findSelector: messengerFilter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData: messengerFacebookData,
      content: 'messenger message',
    });

    // must be created new conversation, new message
    expect(await Conversations.count()).toBe(4);
    expect(await ConversationMessages.count()).toBe(5);

    // new conversation message ===========
    await saveWebhookResponse.getOrCreateConversation({
      findSelector: messengerFilter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData: messengerFacebookData,
      content: 'hi test',
    });

    // must not be created new conversation, new message
    expect(await Conversations.count()).toBe(4);
    expect(await ConversationMessages.count()).toBe(6);
    expect(await ConversationMessages.count({ conversationId })).toBe(2);

    // close converstaion
    await Conversations.update(
      { _id: conversationId },
      { $set: { status: CONVERSATION_STATUSES.CLOSED } },
    );

    // customer commented on closed converstaion ===========
    const message = await saveWebhookResponse.getOrCreateConversation({
      findSelector: messengerFilter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData: messengerFacebookData,
      content: 'test create new conversation',
    });

    // must be created new conversation, new message
    expect(await Conversations.count()).toBe(5);
    expect(await ConversationMessages.count()).toBe(7);
    expect(conversationId).not.toBe(message.conversationId);

    // customer commented on closed converstaion ===========
    const secondMessage = await saveWebhookResponse.getOrCreateConversation({
      findSelector: messengerFilter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData: messengerFacebookData,
      content: 'insert message',
    });

    // must not be created new conversation, new message
    expect(await Conversations.count()).toBe(5);
    expect(await ConversationMessages.count()).toBe(8);
    expect(conversationId).not.toBe(secondMessage.conversationId);
    expect(message.conversationId).toBe(secondMessage.conversationId);

    // unwrap getOrCreateCustomer
    saveWebhookResponse.getOrCreateCustomer.restore();
  });
});
