/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback, no-underscore-dangle */

import Twit from 'twit';
import sinon from 'sinon';
import { Factory } from 'meteor/dburles:factory';
import { assert } from 'meteor/practicalmeteor:chai';
import { Conversations } from '/imports/api/conversations/conversations';
import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';
import { Customers } from '/imports/api/customers/customers';
import { Integrations } from '/imports/api/integrations/integrations';
import { Messages } from '/imports/api/conversations/messages';
import {
  TwitMap,
  getOrCreateCommonConversation,
  tweetReply,
  getOrCreateDirectMessageConversation,
} from './twitter';


describe('twitter integration', function () {
  describe('get or create converstaion', function () {
    let integration;

    const twitterUser = {
      id: 2442424242,
      id_str: '2442424242',
      name: 'username',
      screen_name: 'screen name',
      profile_image_url: 'profile_image_url',
    };

    beforeEach(function () {
      // clear previous data
      Integrations.remove({});
      Conversations.remove({});
      Messages.remove({});

      integration = Factory.create('integration');
    });

    it('common', function () {
      const tweetId = 2424244244;

      // creat conversation
      Factory.create('conversation', {
        integrationId: integration._id,
        status: CONVERSATION_STATUSES.NEW,
        twitterData: {
          id: tweetId,
          isDirectMessage: false,
        },
      });

      // replying to old tweet
      getOrCreateCommonConversation(
        {
          in_reply_to_status_id: tweetId,
          user: twitterUser,
        },
        integration,
      );

      // must not created new conversation
      assert.equal(Conversations.find().count(), 1);

      const conversation = Conversations.findOne({});

      // status must updated as open
      assert.equal(conversation.status, CONVERSATION_STATUSES.OPEN);
    });

    it('direct message', function () {
      const senderId = 2424424242;
      const recipientId = 92442424424242;

      // creat conversation
      Factory.create('conversation', {
        integrationId: integration._id,
        status: CONVERSATION_STATUSES.NEW,
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
      getOrCreateDirectMessageConversation(
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
        integration,
      );

      // must not created new conversation
      assert.equal(Conversations.find().count(), 1);

      const conversation = Conversations.findOne({});

      // status must updated as open
      assert.equal(conversation.status, CONVERSATION_STATUSES.OPEN);
    });
  });

  describe('reply', function () {
    let integration;
    let twit;
    let stub;

    beforeEach(function () {
      // clear previous data
      Conversations.remove({});
      Integrations.remove({});

      // create integration
      integration = Factory.create('integration');

      // Twit instance
      twit = new Twit({
        consumer_key: 'consumer_key',
        consumer_secret: 'consumer_secret',
        access_token: 'access_token',
        access_token_secret: 'token_secret',
      });

      // save twit instance
      TwitMap[integration._id] = twit;

      // twit.post
      stub = sinon.stub(twit, 'post', () => {});
    });

    afterEach(function () {
      // unwrap the spy
      twit.post.restore();
    });

    it('direct message', function () {
      const text = 'reply';
      const senderId = 242424242;

      const conversation = Factory.create('conversation', {
        integrationId: integration._id,
        twitterData: {
          isDirectMessage: true,
          directMessage: {
            senderId,
            senderIdStr: senderId.toString(),
            recipientId: 535335353,
            recipientIdStr: '535335353',
          },
        },
      });

      // action
      tweetReply(conversation, text);

      // check twit post params
      assert.equal(
        stub.calledWith(
          'direct_messages/new',
          {
            user_id: senderId.toString(),
            text,
          },
        ),
        true,
      );
    });

    it('tweet', function () {
      const text = 'reply';
      const tweetIdStr = '242424242';
      const screenName = 'test';

      const conversation = Factory.create('conversation', {
        integrationId: integration._id,
        twitterData: {
          isDirectMessage: false,
          idStr: tweetIdStr,
          screenName,
        },
      });

      // action
      tweetReply(conversation, text);

      // check twit post params
      assert.equal(
        stub.calledWith(
          'statuses/update',
          {
            status: `@${screenName} ${text}`,

            // replying tweet id
            in_reply_to_status_id: tweetIdStr,
          },
        ),
        true,
      );
    });
  });

  describe('tweet', function () {
    let integration;

    beforeEach(function () {
      // clear previous data
      Conversations.remove({});
      Messages.remove({});
      Integrations.remove({});
      Customers.remove({});

      // create integration
      integration = Factory.create('integration');
    });

    it('mention', function () {
      let tweetText = '@test hi';
      const tweetId = 242424242424;
      const tweetIdStr = '242424242424';
      const screenName = 'screen_name';
      const userName = 'username';
      const profileImageUrl = 'profile_image_url';
      const twitterUserId = 24242424242;
      const twitterUserIdStr = '24242424242';

      // regular tweet
      const data = {
        text: tweetText,
        // tweeted user's info
        user: {
          id: twitterUserId,
          id_str: twitterUserIdStr,
          name: userName,
          screen_name: screenName,
          profile_image_url: profileImageUrl,
        },

        // tweet id
        id: tweetId,
        id_str: tweetIdStr,
      };

      // call action
      getOrCreateCommonConversation(data, integration);

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
      assert.equal(conversation.content, tweetText);
      assert.equal(conversation.twitterData.id, tweetId);
      assert.equal(conversation.twitterData.idStr, tweetIdStr);
      assert.equal(conversation.twitterData.screenName, screenName);
      assert.equal(conversation.twitterData.isDirectMessage, false);

      // check customer field values
      assert.equal(customer.integrationId, integration._id);
      assert.equal(customer.twitterData.id, twitterUserId);
      assert.equal(customer.twitterData.idStr, twitterUserIdStr);
      assert.equal(customer.twitterData.name, userName);
      assert.equal(customer.twitterData.screenName, screenName);
      assert.equal(customer.twitterData.profileImageUrl, profileImageUrl);

      // check message field values
      assert.equal(message.conversationId, conversation._id);
      assert.equal(message.customerId, customer._id);
      assert.equal(message.internal, false);
      assert.equal(message.content, tweetText);

      // tweet reply ===============
      tweetText = 'reply';
      const newTweetId = 2442442424;

      data.text = tweetText;
      data.in_reply_to_status_id = tweetId;
      data.id = newTweetId;
      data.idStr = newTweetId.toString();

      // call action
      getOrCreateCommonConversation(data, integration);

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
      assert.equal(newMessage.content, tweetText);
    });

    it('direct message', function () {
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
      getOrCreateDirectMessageConversation(data, integration);

      assert.equal(Conversations.find().count(), 1); // 1 conversation
      assert.equal(Customers.find().count(), 1); // 1 customer
      assert.equal(Messages.find().count(), 1); // 1 message

      let conv = Conversations.findOne();
      const customer = Customers.findOne();
      const message = Messages.findOne();

      // check conv field values
      assert.equal(conv.integrationId, integration._id);
      assert.equal(conv.customerId, customer._id);
      assert.equal(conv.status, CONVERSATION_STATUSES.NEW);
      assert.equal(conv.content, data.text);
      assert.equal(conv.twitterData.id, data.id);
      assert.equal(conv.twitterData.idStr, data.id_str);
      assert.equal(conv.twitterData.screenName, data.sender.screen_name);
      assert.equal(conv.twitterData.isDirectMessage, true);
      assert.equal(conv.twitterData.directMessage.senderId, data.sender_id);
      assert.equal(conv.twitterData.directMessage.senderIdStr, data.sender_id_str);
      assert.equal(conv.twitterData.directMessage.recipientId, data.recipient_id);
      assert.equal(conv.twitterData.directMessage.recipientIdStr, data.recipient_id_str);

      // check customer field values
      assert.equal(customer.integrationId, integration._id);
      assert.equal(customer.twitterData.id, data.sender_id);
      assert.equal(customer.twitterData.idStr, data.sender_id_str);
      assert.equal(customer.twitterData.name, data.sender.name);
      assert.equal(customer.twitterData.screenName, data.sender.screen_name);
      assert.equal(customer.twitterData.profileImageUrl, data.sender.profile_image_url);

      // check message field values
      assert.equal(message.conversationId, conv._id);
      assert.equal(message.customerId, customer._id);
      assert.equal(message.internal, false);
      assert.equal(message.content, data.text);

      // tweet reply ===============
      data.text = 'reply';
      data.id = 3434343434;

      // call action
      getOrCreateDirectMessageConversation(data, integration);

      // must not be created new conversation
      assert.equal(Conversations.find().count(), 1);

      // must not be created new customer
      assert.equal(Customers.find().count(), 1);

      // must be created new message
      assert.equal(Messages.find().count(), 2);

      // check conversation field updates
      conv = Conversations.findOne();
      assert.equal(conv.readUserIds.length, 0);

      const newMessage = Messages.findOne({ _id: { $ne: message._id } });

      // check message fields
      assert.equal(newMessage.content, data.text);
    });
  });
});
