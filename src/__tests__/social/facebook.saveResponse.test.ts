import * as sinon from 'sinon';
import { CONVERSATION_STATUSES, FACEBOOK_DATA_KINDS } from '../../data/constants';
import { connect, disconnect } from '../../db/connection';
import { integrationFactory } from '../../db/factories';
import { ActivityLogs, ConversationMessages, Conversations, Customers } from '../../db/models';
import { SaveWebhookResponse } from '../../trackers/facebook';
import { graphRequest } from '../../trackers/facebookTracker';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('facebook integration: save webhook response', () => {
  let senderId = '2242424244';
  const pageId = '2252525525';
  const postId = '242422242424244';
  const recipientId = '242422242424244';
  let getMock;
  let postMock;

  let saveWebhookResponse;
  let integration;

  beforeEach(async () => {
    integration = await integrationFactory({
      facebookData: {
        appId: '242424242422',
        pageIds: [pageId],
      },
    });

    getMock = sinon.stub(graphRequest, 'get').callsFake(path => {
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

      // mock get picture
      if (path.includes('/picture?')) {
        return expect({}).toThrowError('Not Facebook User');
      }

      // mock get user info
      return {
        name: 'Dombo Gombo',
      };
    });

    postMock = sinon.stub(graphRequest, 'post').callsFake(() => {
      return new Promise(resolve => {
        resolve({
          id: 'commentId',
          message_id: 'message_id',
        });
      });
    });

    saveWebhookResponse = new SaveWebhookResponse('access_token', integration, {});
  });

  afterEach(async () => {
    // unwraps the spy
    getMock.restore();
    postMock.restore();

    // clear previous datas
    await Conversations.remove({});
    await Customers.remove({});
    await ConversationMessages.remove({});
    await ActivityLogs.remove({});
  });

  test('via messenger event', async () => {
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
                mid: 'mid0',
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
    expect(customer.createdAt).toBeDefined();
    expect(customer.integrationId).toBe(integration._id);
    expect(customer.firstName).toBe('Dombo Gombo'); // from mocked get info above
    expect(customer.facebookData.id).toBe(senderId);

    // check message field values
    expect(message.conversationId).toBe(conversation._id);
    expect(message.customerId).toBe(customer._id);
    expect(message.internal).toBe(false);
    expect(message.content).toBe(messageText);
    expect(message.attachments.length).toBe(1);
    expect(message.attachments[0].toJSON()).toEqual({
      type: 'image',
      url: 'attachment_url',
    });

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
                mid: 'mid',
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

    const newMessage = await ConversationMessages.findOne({
      _id: { $ne: message._id },
    });

    // check message fields
    expect(newMessage.conversationId).toBe(conversation._id);
    expect(newMessage.customerId).toBe(customer._id);
    expect(newMessage.internal).toBe(false);
    expect(newMessage.content).toBe(messageText);
    expect(newMessage.content).toBe(conversation.content);

    // receiving already saved info ========================
    saveWebhookResponse.data = {
      object: 'page',
      entry: [
        {
          id: pageId,
          messaging: [
            {
              sender: { id: senderId },
              recipient: { id: recipientId },
              message: { mid: 'mid' },
            },
          ],
        },
      ],
    };

    await saveWebhookResponse.start();

    // must not be created new message
    expect(await ConversationMessages.find().count()).toBe(2);
  });

  test('via feed event', async () => {
    // first time ========================

    expect(await Conversations.find().count()).toBe(0); // 0 conversations
    expect(await Customers.find().count()).toBe(0); // 0 customers
    expect(await ConversationMessages.find().count()).toBe(0); // 0 messages

    let messageText = 'wall post';
    const link = 'link_url';
    const commentId = '2424242422242424244';
    const senderName = 'Facebook User';

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
                item: 'status',
                post_id: postId,
                from: {
                  id: senderId,
                  name: senderName,
                },
                message: messageText,
                link,
                created_time: '1533712330',
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
    expect(conversation.createdAt).toBeDefined();
    expect(conversation.integrationId).toBe(integration._id);
    expect(conversation.customerId).toBe(customer._id);
    expect(conversation.status).toBe(CONVERSATION_STATUSES.NEW);
    expect(conversation.content).toBe(messageText);
    expect(conversation.facebookData.kind).toBe(FACEBOOK_DATA_KINDS.FEED);
    expect(conversation.facebookData.postId).toBe(postId);
    expect(conversation.facebookData.pageId).toBe(pageId);

    // check customer field values
    expect(customer.integrationId).toBe(integration._id);
    expect(customer.firstName).toBe('Dombo Gombo'); // from mocked get info above
    expect(customer.facebookData.id).toBe(senderId);

    // 1 logs
    expect(await ActivityLogs.find({ 'activity.type': 'customer' }).count()).toBe(1);

    // check message field values
    expect(message.createdAt).toBeDefined();
    expect(message.conversationId).toBe(conversation._id);
    expect(message.customerId).toBe(customer._id);
    expect(message.internal).toBe(false);
    expect(message.content).toBe(messageText);

    expect(message.facebookData.item).toBe('status');
    expect(message.facebookData.senderId).toBe(senderId);
    expect(message.facebookData.senderName).toBe(senderName);
    expect(message.facebookData.postId).toBe(postId);
    expect(message.facebookData.link).toBe(link);
    expect(message.facebookData.commentCount).toBe(0);
    expect(message.facebookData.likeCount).toBe(0);
    expect(message.facebookData.photos).toHaveLength(0);

    // second time ========================
    sinon.stub(saveWebhookResponse, 'restoreOldPosts').callsFake(() => {
      return false;
    });

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
                post_id: postId,
                comment_id: `${commentId}1`,
                from: {
                  id: senderId,
                  name: senderName,
                },
                message: messageText,
                created_time: '1533712330',
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

    const newMessage = await ConversationMessages.findOne({
      _id: { $ne: message._id },
    });
    // check message fields
    expect(newMessage.createdAt).toBeDefined();
    expect(newMessage.conversationId).toBe(conversation._id);
    expect(newMessage.customerId).toBe(customer._id);
    expect(newMessage.internal).toBe(false);
    expect(newMessage.content).toBe(messageText);
    expect(newMessage.attachments.length).toBe(0);

    expect(newMessage.facebookData.item).toBe('comment');
    expect(newMessage.facebookData.senderId).toBe(senderId);
    expect(newMessage.facebookData.senderName).toBe(senderName);
    expect(newMessage.facebookData.postId).toBe(postId);
    expect(newMessage.facebookData.commentId).toBe(`${commentId}1`);
    expect(newMessage.facebookData.commentCount).toBe(0);
    expect(newMessage.facebookData.likeCount).toBe(0);
    expect(newMessage.facebookData.photos).toHaveLength(0);
  });
});
