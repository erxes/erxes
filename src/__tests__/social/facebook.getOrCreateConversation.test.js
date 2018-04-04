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
    expect(await Conversations.find().count()).toBe(0);
    expect(await ConversationMessages.find().count()).toBe(0);

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
    expect(await Conversations.find().count()).toBe(1);
    expect(await ConversationMessages.find().count()).toBe(1);

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
    expect(await Conversations.find().count()).toBe(1);
    expect(await ConversationMessages.find().count()).toBe(2);

    // close converstaion
    await Conversations.update({}, { $set: { status: CONVERSATION_STATUSES.CLOSED } });

    // customer commented on closed converstaion ===========
    await saveWebhookResponse.getOrCreateConversation({
      findSelector: filter,
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData,
      conntet: 'hi again',
    });

    // must not be created new conversation, new message
    expect(await Conversations.find().count()).toBe(1);

    // must be opened
    conversation = await Conversations.findOne({ _id: conversation._id });
    expect(conversation.status).toBe(CONVERSATION_STATUSES.OPEN);

    // checking updatedAt field
    expect(conversation.createdAt).not.toEqual(conversation.updatedAt);

    expect(await ConversationMessages.find().count()).toBe(3);

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
    expect(await Conversations.find().count()).toBe(2);
    expect(await ConversationMessages.find().count()).toBe(4);

    // unwrap getOrCreateCustomer
    saveWebhookResponse.getOrCreateCustomer.restore();
  });
});
