/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../../db/connection';
import { integrationFactory, conversationFactory } from '../../db/factories';
import { CONVERSATION_STATUSES } from '../../data/constants';
import {
  ActivityLogs,
  Conversations,
  ConversationMessages,
  Customers,
  Integrations,
} from '../../db/models';
import { getOrCreateDirectMessageConversation } from '../../social/twitter';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('receive direct message response', () => {
  let _integration;

  const twitterUser = {
    id: 2442424242,
    id_str: '2442424242',
    name: 'username',
    screen_name: 'screen name',
    profile_image_url: 'profile_image_url',
  };

  beforeEach(async () => {
    _integration = await integrationFactory();
  });

  afterEach(async () => {
    await Integrations.remove({});
    await Conversations.remove({});
    await ConversationMessages.remove({});
    await Customers.remove({});
    await ActivityLogs.remove({});
  });

  test('get or create conversation', async () => {
    const senderId = 2424424242;
    const recipientId = 92442424424242;

    // create conversation
    await conversationFactory({
      integrationId: _integration._id,
      twitterData: {
        isDirectMessage: true,
        directMessage: {
          senderId,
          senderIdStr: senderId.toString(),
          recipientId,
          recipientIdStr: recipientId.toString(),
        },
      },
    });

    // direct message
    await getOrCreateDirectMessageConversation(
      {
        id: 42242242,
        id_str: '42242242',
        screen_name: 'screen_name',
        sender_id: senderId,
        sender_id_str: senderId.toString(),
        recipient_id: recipientId,
        recipient_id_str: recipientId.toString(),
        sender: twitterUser,
      },
      _integration,
    );

    // must not created new conversation
    expect(await Conversations.find().count()).toBe(1);

    const conversation = await Conversations.findOne({});

    // status must updated as open
    expect(conversation.status).toBe(CONVERSATION_STATUSES.OPEN);
  });

  test('main action', async () => {
    // try using non existing integration
    expect(await getOrCreateDirectMessageConversation({}, { _id: 'dffdfd' })).toBe(null);

    // direct message
    const data = {
      id: 33324242424242,
      id_str: '33324242424242',
      text: 'direct message',
      sender_id: 24242424242,
      sender_id_str: '24242424242',
      recipient_id: 343424242424242,
      recipient_id_str: '343424242424242',
      sender: {
        id: 24242424242,
        id_str: '24242424242',
        name: 'username',
        screen_name: 'screen_name',
        profile_image_url: 'profile_image_url',
      },
    };

    // call action
    await getOrCreateDirectMessageConversation(data, _integration);

    expect(await Conversations.find().count()).toBe(1); // 1 conversation
    expect(await Customers.find().count()).toBe(1); // 1 customer
    expect(await ConversationMessages.find().count()).toBe(1); // 1 message

    let conv = await Conversations.findOne();
    const customer = await Customers.findOne();
    const message = await ConversationMessages.findOne();

    // check conv field values
    expect(conv.createdAt).toBeDefined();
    expect(conv.integrationId).toBe(_integration._id);
    expect(conv.customerId).toBe(customer._id);
    expect(conv.status).toBe(CONVERSATION_STATUSES.NEW);
    expect(conv.content).toBe(data.text);
    expect(conv.twitterData.id).toBe(data.id);
    expect(conv.twitterData.idStr).toBe(data.id_str);
    expect(conv.twitterData.screenName).toBe(data.sender.screen_name);
    expect(conv.twitterData.isDirectMessage).toBe(true);
    expect(conv.twitterData.directMessage.senderId).toBe(data.sender_id);
    expect(conv.twitterData.directMessage.senderIdStr).toBe(data.sender_id_str);
    expect(conv.twitterData.directMessage.recipientId).toBe(data.recipient_id);
    expect(conv.twitterData.directMessage.recipientIdStr).toBe(data.recipient_id_str);

    // check customer field values
    expect(customer.createdAt).toBeDefined();
    expect(customer.integrationId).toBe(_integration._id);
    expect(customer.twitterData.id).toBe(data.sender_id);
    expect(customer.twitterData.idStr).toBe(data.sender_id_str);
    expect(customer.twitterData.name).toBe(data.sender.name);
    expect(customer.twitterData.screenName).toBe(data.sender.screen_name);
    expect(customer.twitterData.profileImageUrl).toBe(data.sender.profile_image_url);

    // 1 log
    expect(await ActivityLogs.find().count()).toBe(1);

    // check message field values
    expect(message.createdAt).toBeDefined();
    expect(message.conversationId).toBe(conv._id);
    expect(message.customerId).toBe(customer._id);
    expect(message.internal).toBe(false);
    expect(message.content).toBe(data.text);

    // tweet reply ===============
    data.text = 'reply';
    data.id = 3434343434;

    // call action
    await getOrCreateDirectMessageConversation(data, _integration);

    // must not be created new conversation ==============
    expect(await Conversations.find().count()).toBe(1);

    // check conversation field updates
    conv = await Conversations.findOne();
    expect(conv.readUserIds.length).toBe(0);
    expect(conv.createdAt).not.toEqual(conv.updatedAt);

    // must not be created new customer ================
    expect(await Customers.find().count()).toBe(1);

    // must be created new message ================
    expect(await ConversationMessages.find().count()).toBe(2);

    const newMessage = await ConversationMessages.findOne({ _id: { $ne: message._id } });

    // check message fields
    expect(newMessage.content).toBe(data.text);
  });
});
