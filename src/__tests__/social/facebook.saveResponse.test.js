/* eslint-env jest */

import sinon from 'sinon';
import { connect, disconnect } from '../../db/connection';
import { SaveWebhookResponse } from '../../social/facebook';
import { graphRequest } from '../../social/facebookTracker';
import { Conversations, Customers, ConversationMessages } from '../../db/models';
import { integrationFactory } from '../../db/factories';
import { CONVERSATION_STATUSES, FACEBOOK_DATA_KINDS } from '../../data/constants';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('facebook integration: save webhook response', () => {
  let senderId = 2242424244;
  const pageId = '2252525525';
  const postId = '242422242424244';
  const recipientId = '242422242424244';

  let saveWebhookResponse;
  let integration;

  beforeEach(async () => {
    integration = await integrationFactory({
      facebookData: {
        appId: '242424242422',
        pageIds: [pageId],
      },
    });

    sinon.stub(graphRequest, 'get').callsFake(path => {
      // mock get page access token
      if (path.includes('/?fields=access_token')) {
        return {
          access_token: '244242442442',
        };
      }

      // mock get post object
      if (path === postId) {
        return {
          id: postId,
        };
      }

      // mock get user info
      return {
        name: 'Dombo Gombo',
      };
    });

    saveWebhookResponse = new SaveWebhookResponse('access_token', integration, {});
  });

  afterEach(async () => {
    graphRequest.get.restore(); // unwraps the spy

    // clear previous datas
    await Conversations.remove({});
    await Customers.remove({});
    await ConversationMessages.remove({});
  });

  it('via messenger event', async () => {
    // first time ========================

    expect(await Conversations.find().count()).toBe(0); // 0 conversations
    expect(await Customers.find().count()).toBe(0); // 0 customers
    expect(await ConversationMessages.find().count()).toBe(0); // 0 messages

    senderId = '2242424244';
    let messageText = 'from messenger';

    const attachments = [
      {
        type: 'image',
        payload: {
          url: 'attachment_url',
        },
      },
    ];

    // customer says from messenger via messenger
    saveWebhookResponse.data = {
      object: 'page',
      entry: [
        {
          id: pageId,
          messaging: [
            {
              sender: { id: senderId },
              recipient: { id: recipientId },
              message: {
                text: messageText,
                attachments,
              },
            },
          ],
        },
      ],
    };
    await saveWebhookResponse.start();

    expect(await Conversations.find().count()).toBe(1); // 1 conversation
    expect(await Customers.find().count()).toBe(1); // 1 customer
    expect(await ConversationMessages.find().count()).toBe(1); // 1 message

    let conversation = await Conversations.findOne();
    const customer = await Customers.findOne();
    const message = await ConversationMessages.findOne();

    // check conversation field values
    expect(conversation.integrationId).toBe(integration._id);
    expect(conversation.customerId).toBe(customer._id);
    expect(conversation.status).toBe(CONVERSATION_STATUSES.NEW);
    expect(conversation.content).toBe(messageText);
    expect(conversation.facebookData.kind).toBe(FACEBOOK_DATA_KINDS.MESSENGER);
    expect(conversation.facebookData.senderId).toBe(senderId);
    expect(conversation.facebookData.recipientId).toBe(recipientId);
    expect(conversation.facebookData.pageId).toBe(pageId);

    // check customer field values
    expect(customer.integrationId).toBe(integration._id);
    expect(customer.name).toBe('Dombo Gombo'); // from mocked get info above
    expect(customer.facebookData.id).toBe(senderId);

    // check message field values
    expect(message.conversationId).toBe(conversation._id);
    expect(message.customerId).toBe(customer._id);
    expect(message.internal).toBe(false);
    expect(message.content).toBe(messageText);
    expect(message.attachments).toEqual([{ type: 'image', url: 'attachment_url' }]);

    // second time ========================

    // customer says hi via messenger again
    messageText = 'hi';

    saveWebhookResponse.data = {
      object: 'page',
      entry: [
        {
          id: pageId,
          messaging: [
            {
              sender: { id: senderId },
              recipient: { id: recipientId },

              message: {
                text: messageText,
              },
            },
          ],
        },
      ],
    };
    await saveWebhookResponse.start();

    // must not be created new conversation
    expect(await Conversations.find().count()).toBe(1);

    // must not be created new customer
    expect(await Customers.find().count()).toBe(1);

    // must be created new message
    expect(await ConversationMessages.find().count()).toBe(2);

    // check conversation field updates
    conversation = await Conversations.findOne();
    expect(conversation.readUserIds.length).toBe(0);

    const newMessage = await ConversationMessages.findOne({ _id: { $ne: message._id } });

    // check message fields
    expect(newMessage.conversationId).toBe(conversation._id);
    expect(newMessage.customerId).toBe(customer._id);
    expect(newMessage.internal).toBe(false);
    expect(newMessage.content).toBe(messageText);
  });

  it('via feed event', async () => {
    // first time ========================

    expect(await Conversations.find().count()).toBe(0); // 0 conversations
    expect(await Customers.find().count()).toBe(0); // 0 customers
    expect(await ConversationMessages.find().count()).toBe(0); // 0 messages

    let messageText = 'wall post';
    const link = 'link_url';
    const commentId = '2424242422242424244';

    // customer posted `wall post` on our wall
    saveWebhookResponse.data = {
      object: 'page',
      entry: [
        {
          id: pageId,
          changes: [
            {
              value: {
                verb: 'add',
                item: 'post',
                post_id: postId,
                comment_id: commentId,
                sender_id: senderId,
                message: messageText,
                link,
              },
            },
          ],
        },
      ],
    };
    await saveWebhookResponse.start();

    expect(await Conversations.find().count()).toBe(1); // 1 conversation
    expect(await Customers.find().count()).toBe(1); // 1 customer
    expect(await ConversationMessages.find().count()).toBe(1); // 1 message

    let conversation = await Conversations.findOne();
    const customer = await Customers.findOne();
    const message = await ConversationMessages.findOne();

    // check conversation field values
    expect(conversation.integrationId).toBe(integration._id);
    expect(conversation.customerId).toBe(customer._id);
    expect(conversation.status).toBe(CONVERSATION_STATUSES.NEW);
    expect(conversation.content).toBe(messageText);
    expect(conversation.facebookData.kind).toBe(FACEBOOK_DATA_KINDS.FEED);
    expect(conversation.facebookData.postId).toBe(postId);
    expect(conversation.facebookData.pageId).toBe(pageId);

    // check customer field values
    expect(customer.integrationId).toBe(integration._id);
    expect(customer.name).toBe('Dombo Gombo'); // from mocked get info above
    expect(customer.facebookData.id).toBe(senderId);

    // check message field values
    expect(message.conversationId).toBe(conversation._id);
    expect(message.customerId).toBe(customer._id);
    expect(message.internal).toBe(false);
    expect(message.content).toBe(messageText);
    expect(message.facebookData.toJSON()).toEqual({ item: 'post', senderId, link });

    // second time ========================

    // customer commented hi on above post again
    messageText = 'hi';

    saveWebhookResponse.data = {
      object: 'page',
      entry: [
        {
          id: pageId,
          changes: [
            {
              value: {
                verb: 'add',
                item: 'comment',
                reaction_type: 'haha',
                post_id: postId,
                comment_id: commentId,
                sender_id: senderId,
                message: messageText,
              },
            },
          ],
        },
      ],
    };
    await saveWebhookResponse.start();

    // must not be created new conversation
    expect(await Conversations.find().count()).toBe(1);

    // must not be created new customer
    expect(await Customers.find().count()).toBe(1);

    // must be created new message
    expect(await ConversationMessages.find().count()).toBe(2);

    // check conversation field updates
    conversation = await Conversations.findOne();
    expect(conversation.readUserIds.length).toBe(0);

    const newMessage = await ConversationMessages.findOne({ _id: { $ne: message._id } });

    // check message fields
    expect(newMessage.conversationId).toBe(conversation._id);
    expect(newMessage.customerId).toBe(customer._id);
    expect(newMessage.internal).toBe(false);
    expect(newMessage.content).toBe(messageText);
    expect(newMessage.attachments).toBe(undefined);

    expect(newMessage.facebookData.toJSON()).toEqual({
      item: 'comment',
      senderId,
      reactionType: 'haha',
    });
  });
});
