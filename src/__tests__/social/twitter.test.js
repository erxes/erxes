/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import Twit from 'twit';
import sinon from 'sinon';
import { connect, disconnect } from '../../db/connection';
import { integrationFactory, conversationFactory } from '../../db/factories';
import { CONVERSATION_STATUSES } from '../../data/constants';
import { Conversations, ConversationMessages, Customers, Integrations } from '../../db/models';
import {
  TwitMap,
  getOrCreateCommonConversation,
  tweetReply,
  getOrCreateDirectMessageConversation,
} from '../../social/twitter';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('twitter integration', () => {
  describe('get or create conversation', () => {
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
    });

    test('common', async () => {
      const tweetId = 2424244244;

      // create conversation
      await conversationFactory({
        integrationId: _integration._id,
        status: CONVERSATION_STATUSES.NEW,
        twitterData: {
          id: tweetId,
          isDirectMessage: false,
        },
      });

      // replying to old tweet
      await getOrCreateCommonConversation(
        {
          in_reply_to_status_id: tweetId,
          user: twitterUser,
        },
        _integration,
      );

      // must not created new conversation
      expect(await Conversations.find().count()).toEqual(1);

      const conversation = await Conversations.findOne({});

      // status must updated as open
      expect(conversation.status).toEqual(CONVERSATION_STATUSES.OPEN);
    });

    test('direct message', async () => {
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
  });

  describe('reply', () => {
    let _integration;
    let twit;
    let stub;

    beforeEach(async () => {
      const sandbox = sinon.sandbox.create();

      // create integration
      _integration = await integrationFactory({});

      // Twit instance
      twit = new Twit({
        consumer_key: 'consumer_key',
        consumer_secret: 'consumer_secret',
        access_token: 'access_token',
        access_token_secret: 'token_secret',
      });

      // save twit instance
      TwitMap[_integration._id] = twit;

      // twit.post
      stub = sandbox.stub(twit, 'post').callsFake(() => {});
    });

    afterEach(async () => {
      // unwrap the spy
      twit.post.restore();
      await Conversations.remove({});
      await Integrations.remove({});
      await ConversationMessages.remove({});
      await Customers.remove({});
    });

    test('direct message', async () => {
      const text = 'reply';
      const senderId = 242424242;

      const conversation = await conversationFactory({
        integrationId: _integration._id,
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
      await tweetReply(conversation, text);

      // check twit post params
      expect(
        stub.calledWith('direct_messages/new', {
          user_id: senderId.toString(),
          text,
        }),
      ).toBe(true);
    });

    test('tweet', async () => {
      const text = 'reply';
      const tweetIdStr = '242424242';
      const screenName = 'test';

      const conversation = await conversationFactory({
        integrationId: _integration._id,
        twitterData: {
          isDirectMessage: false,
          idStr: tweetIdStr,
          screenName,
        },
      });

      // action
      await tweetReply(conversation, text);

      // check twit post params
      expect(
        stub.calledWith('statuses/update', {
          status: `@${screenName} ${text}`,

          // replying tweet id
          in_reply_to_status_id: tweetIdStr,
        }),
      ).toBe(true);
    });
  });

  describe('tweet', () => {
    let _integration;

    beforeEach(async () => {
      // create integration
      _integration = await integrationFactory({});
    });

    afterEach(async () => {
      await Conversations.remove({});
      await Integrations.remove({});
      await ConversationMessages.remove({});
      await Customers.remove({});
    });

    test('mention', async () => {
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
      await getOrCreateCommonConversation(data, _integration);

      expect(await Conversations.find().count()).toBe(1); // 1 conversation
      expect(await Customers.find().count()).toBe(1); // 1 customer
      expect(await ConversationMessages.find().count()).toBe(1); // 1 message

      let conversation = await Conversations.findOne();
      const customer = await Customers.findOne();
      const message = await ConversationMessages.findOne();

      // check conversation field values
      expect(conversation.createdAt).toBeDefined();
      expect(conversation.integrationId).toBe(_integration._id);
      expect(conversation.customerId).toBe(customer._id);
      expect(conversation.status).toBe(CONVERSATION_STATUSES.NEW);
      expect(conversation.content).toBe(tweetText);
      expect(conversation.twitterData.id).toBe(tweetId);
      expect(conversation.twitterData.idStr).toBe(tweetIdStr);
      expect(conversation.twitterData.screenName).toBe(screenName);
      expect(conversation.twitterData.isDirectMessage).toBe(false);

      // check customer field values
      expect(customer.integrationId).toBe(_integration._id);
      expect(customer.twitterData.id).toBe(twitterUserId);
      expect(customer.twitterData.idStr).toBe(twitterUserIdStr);
      expect(customer.twitterData.name).toBe(userName);
      expect(customer.twitterData.screenName).toBe(screenName);
      expect(customer.twitterData.profileImageUrl).toBe(profileImageUrl);

      // check message field values
      expect(message.createdAt).toBeDefined();
      expect(message.conversationId).toBe(conversation._id);
      expect(message.customerId).toBe(customer._id);
      expect(message.internal).toBe(false);
      expect(message.content).toBe(tweetText);

      // tweet reply ===============
      tweetText = 'reply';
      const newTweetId = 2442442424;

      data.text = tweetText;
      data.in_reply_to_status_id = tweetId;
      data.id = newTweetId;
      data.idStr = newTweetId.toString();

      // call action
      await getOrCreateCommonConversation(data, _integration);

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
      expect(newMessage.content).toBe(tweetText);
    });

    test('direct message', async () => {
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
      expect(customer.integrationId).toBe(_integration._id);
      expect(customer.twitterData.id).toBe(data.sender_id);
      expect(customer.twitterData.idStr).toBe(data.sender_id_str);
      expect(customer.twitterData.name).toBe(data.sender.name);
      expect(customer.twitterData.screenName).toBe(data.sender.screen_name);
      expect(customer.twitterData.profileImageUrl).toBe(data.sender.profile_image_url);

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

      // must not be created new conversation
      expect(await Conversations.find().count()).toBe(1);

      // must not be created new customer
      expect(await Customers.find().count()).toBe(1);

      // must be created new message
      expect(await ConversationMessages.find().count()).toBe(2);

      // check conversation field updates
      conv = await Conversations.findOne();
      expect(conv.readUserIds.length).toBe(0);

      const newMessage = await ConversationMessages.findOne({ _id: { $ne: message._id } });

      // check message fields
      expect(newMessage.content).toBe(data.text);
    });
  });
});
