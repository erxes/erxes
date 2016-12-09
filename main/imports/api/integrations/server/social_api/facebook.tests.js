/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */
/* eslint-disable no-underscore-dangle */

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { assert } from 'meteor/practicalmeteor:chai';
import sinon from 'sinon';

import { Conversations } from '/imports/api/conversations/conversations';
import { CONVERSATION_STATUSES, FACEBOOK_DATA_KINDS } from '/imports/api/conversations/constants';
import { Customers } from '/imports/api/customers/customers';
import { Integrations } from '/imports/api/integrations/integrations';
import { Messages } from '/imports/api/conversations/messages';

import { graphRequest, facebookReply, SaveWebhookResponse } from './facebook';

if (Meteor.isServer) {
  describe('facebook integration', function () {
    const pageId = '2252525525';
    const senderId = '2242424244';
    const recipientId = '242422242424244';

    describe('facebook reply', function () {
      let integration;

      beforeEach(function () {
        // clear previous data
        Conversations.remove({});
        Integrations.remove({});

        // mock settings
        Meteor.settings.FACEBOOK_APPS = [{
          ID: 'id',
          NAME: 'name',
          ACCESS_TOKEN: 'access_token',
        }];

        // create integration
        integration = Factory.create('integration', {
          'facebookData.appId': 'id',
          'facebookData.pageIds': [pageId],
        });

        // mock get page access token
        sinon.stub(graphRequest, 'get', () => ({
          access_token: 'page_access_token',
        }));
      });

      afterEach(function () {
        // unwraps the spy
        graphRequest.get.restore();
        graphRequest.post.restore();
      });

      it('messenger', function () {
        const conversation = Factory.create('conversation', {
          integrationId: integration._id,
          'facebookData.kind': FACEBOOK_DATA_KINDS.MESSENGER,
        });

        const text = 'to messenger';

        // mock post messenger reply
        const stub = sinon.stub(graphRequest, 'post', () => {});

        // reply
        facebookReply(conversation, text);

        // check
        assert.equal(stub.calledWith('me/messages', 'page_access_token'), true);
      });

      it('feed', function () {
        const conversation = Factory.create('conversation', {
          integrationId: integration._id,
          'facebookData.kind': FACEBOOK_DATA_KINDS.FEED,
          'facebookData.postId': 'postId',
        });

        const text = 'comment';
        const messageId = '242424242';

        // mock post messenger reply
        const gpStub = sinon.stub(graphRequest, 'post', () => ({
          id: 'commentId',
        }));

        // mock message update
        const mongoStub = sinon.stub(Messages, 'update', () => {});

        // reply
        facebookReply(conversation, text, messageId);

        // check graph request
        assert.equal(gpStub.calledWith('postId/comments', 'page_access_token'), true);

        // check mongo update
        assert.equal(
          mongoStub.calledWith(
            { _id: messageId },
            { $set: { facebookCommentId: 'commentId' } }
          ),
          true
        );

        // unwrap stub
        Messages.update.restore();
      });
    });

    describe('save webhook response', function () {
      const postId = '242422242424244';

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
          {}
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

        let messageText = 'from messenger';

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


        // second time ========================

        // customer posted hi on our wall again
        messageText = 'hi';

        saveWebhookResponse.data = {
          object: 'page',
          entry: [
            {
              id: pageId,
              changes: [
                {
                  value: {
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
      });
    });
  });
}
