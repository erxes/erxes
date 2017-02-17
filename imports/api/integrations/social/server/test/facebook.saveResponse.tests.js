/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
/* eslint-disable no-underscore-dangle */

import { Factory } from 'meteor/dburles:factory';
import { assert } from 'meteor/practicalmeteor:chai';
import sinon from 'sinon';

import { Conversations } from '/imports/api/conversations/conversations';
import { CONVERSATION_STATUSES, FACEBOOK_DATA_KINDS } from '/imports/api/conversations/constants';
import { Customers } from '/imports/api/customers/customers';
import { Messages } from '/imports/api/conversations/messages';

import { graphRequest, SaveWebhookResponse } from '../facebook';

describe('facebook integration: save webhook response', function () {
  let senderId = 2242424244;
  const pageId = '2252525525';
  const postId = '242422242424244';
  const recipientId = '242422242424244';

  let saveWebhookResponse;
  let integration;

  after(function () {
    graphRequest.get.restore(); // unwraps the spy
  });

  before(function () {
    integration = Factory.create('integration', {
      facebookData: {
        appId: '242424242422',
        pageIds: [pageId],
      },
    });

    sinon.stub(graphRequest, 'get', (path) => {
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

    saveWebhookResponse = new SaveWebhookResponse(
      'access_token',
      integration,
      {},
    );
  });

  beforeEach(function () {
    // clear previous datas
    Conversations.remove({});
    Customers.remove({});
    Messages.remove({});
  });

  it('via messenger event', function () {
    // first time ========================

    assert.equal(Conversations.find().count(), 0); // 0 conversations
    assert.equal(Customers.find().count(), 0); // 0 customers
    assert.equal(Messages.find().count(), 0); // 0 messages

    senderId = '2242424244';
    let messageText = 'from messenger';

    const attachments = [{
      type: 'image',
      payload: {
        url: 'attachment_url',
      },
    }];

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
    saveWebhookResponse.start();

    assert.equal(Conversations.find().count(), 1); // 1 conversation
    assert.equal(Customers.find().count(), 1); // 1 customer
    assert.equal(Messages.find().count(), 1); // 1 message

    let conversation = Conversations.findOne();
    const customer = Customers.findOne();
    const message = Messages.findOne();

    // check conversation field values
    assert.equal(conversation.integrationId, integration._id);
    assert.equal(conversation.customerId, customer._id);
    assert.equal(conversation.status, CONVERSATION_STATUSES.NEW);
    assert.equal(conversation.content, messageText);
    assert.equal(conversation.facebookData.kind, FACEBOOK_DATA_KINDS.MESSENGER);
    assert.equal(conversation.facebookData.senderId, senderId);
    assert.equal(conversation.facebookData.recipientId, recipientId);
    assert.equal(conversation.facebookData.pageId, pageId);

    // check customer field values
    assert.equal(customer.integrationId, integration._id);
    assert.equal(customer.name, 'Dombo Gombo'); // from mocked get info above
    assert.equal(customer.facebookData.id, senderId);

    // check message field values
    assert.equal(message.conversationId, conversation._id);
    assert.equal(message.customerId, customer._id);
    assert.equal(message.internal, false);
    assert.equal(message.content, messageText);
    assert.deepEqual(
      message.attachments,
      [{ type: 'image', url: 'attachment_url' }],
    );

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
    saveWebhookResponse.start();

    // must not be created new conversation
    assert.equal(Conversations.find().count(), 1);

    // must not be created new customer
    assert.equal(Customers.find().count(), 1);

    // must be created new message
    assert.equal(Messages.find().count(), 2);


    // check conversation field updates
    conversation = Conversations.findOne();
    assert.equal(conversation.readUserIds.length, 0);

    const newMessage = Messages.findOne({ _id: { $ne: message._id } });

    // check message fields
    assert.equal(newMessage.conversationId, conversation._id);
    assert.equal(newMessage.customerId, customer._id);
    assert.equal(newMessage.internal, false);
    assert.equal(newMessage.content, messageText);
  });

  it('via feed event', function () {
    // first time ========================

    assert.equal(Conversations.find().count(), 0); // 0 conversations
    assert.equal(Customers.find().count(), 0); // 0 customers
    assert.equal(Messages.find().count(), 0); // 0 messages

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
    saveWebhookResponse.start();

    assert.equal(Conversations.find().count(), 1); // 1 conversation
    assert.equal(Customers.find().count(), 1); // 1 customer
    assert.equal(Messages.find().count(), 1); // 1 message

    let conversation = Conversations.findOne();
    const customer = Customers.findOne();
    const message = Messages.findOne();

    // check conversation field values
    assert.equal(conversation.integrationId, integration._id);
    assert.equal(conversation.customerId, customer._id);
    assert.equal(conversation.status, CONVERSATION_STATUSES.NEW);
    assert.equal(conversation.content, messageText);
    assert.equal(conversation.facebookData.kind, FACEBOOK_DATA_KINDS.FEED);
    assert.equal(conversation.facebookData.postId, postId);
    assert.equal(conversation.facebookData.pageId, pageId);

    // check customer field values
    assert.equal(customer.integrationId, integration._id);
    assert.equal(customer.name, 'Dombo Gombo'); // from mocked get info above
    assert.equal(customer.facebookData.id, senderId);

    // check message field values
    assert.equal(message.conversationId, conversation._id);
    assert.equal(message.customerId, customer._id);
    assert.equal(message.internal, false);
    assert.equal(message.content, messageText);
    assert.deepEqual(message.facebookData, { item: 'post', senderId, link });


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
    saveWebhookResponse.start();

    // must not be created new conversation
    assert.equal(Conversations.find().count(), 1);

    // must not be created new customer
    assert.equal(Customers.find().count(), 1);

    // must be created new message
    assert.equal(Messages.find().count(), 2);


    // check conversation field updates
    conversation = Conversations.findOne();
    assert.equal(conversation.readUserIds.length, 0);

    const newMessage = Messages.findOne({ _id: { $ne: message._id } });

    // check message fields
    assert.equal(newMessage.conversationId, conversation._id);
    assert.equal(newMessage.customerId, customer._id);
    assert.equal(newMessage.internal, false);
    assert.equal(newMessage.content, messageText);
    assert.equal(newMessage.attachments, null);

    assert.deepEqual(
      newMessage.facebookData,
      { item: 'comment', senderId, reactionType: 'haha' },
    );
  });
});
