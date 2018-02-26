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

import {
  receiveTimeLineResponse,
  receiveMentionReply,
  createConversationByMention,
} from '../../social/twitter';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('receive timeline response', () => {
  let _integration;

  const data = {
    in_reply_to_status_id: 1,
    entities: {
      user_mentions: [],
    },
    user: {
      id: 1,
    },
  };

  const twitterUser = {
    id: 2442424242,
    id_str: '2442424242',
    name: 'username',
    screen_name: 'screen name',
    profile_image_url: 'profile_image_url',
  };

  beforeEach(async () => {
    _integration = await integrationFactory({
      twitterData: { info: { id: 1 } },
    });
  });

  afterEach(async () => {
    await Integrations.remove({});
    await Conversations.remove({});
    await ConversationMessages.remove({});
    await Customers.remove({});
    await ActivityLogs.remove({});
  });

  test('receive mention reply', async () => {
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
    await receiveMentionReply(_integration, {
      in_reply_to_status_id: tweetId,
      user: twitterUser,
    });

    // must not created new conversation
    expect(await Conversations.find().count()).toEqual(1);

    const conversation = await Conversations.findOne({});

    // status must updated as open
    expect(conversation.status).toEqual(CONVERSATION_STATUSES.OPEN);
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
    await createConversationByMention(_integration, data);

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
    expect(customer.createdAt).toBeDefined();
    expect(customer.integrationId).toBe(_integration._id);
    expect(customer.twitterData.id).toBe(twitterUserId);
    expect(customer.twitterData.idStr).toBe(twitterUserIdStr);
    expect(customer.twitterData.name).toBe(userName);
    expect(customer.twitterData.screenName).toBe(screenName);
    expect(customer.twitterData.profileImageUrl).toBe(profileImageUrl);

    // 1 log
    expect(await ActivityLogs.find().count()).toBe(1);

    // check message field values
    expect(message.createdAt).toBeDefined();
    expect(message.conversationId).toBe(conversation._id);
    expect(message.customerId).toBe(customer._id);
    expect(message.internal).toBe(false);
    expect(message.content).toBe(tweetText);
  });

  test('receive reply', async () => {
    // non existing conversation =========
    await receiveTimeLineResponse(_integration, data);
    expect(await ConversationMessages.count()).toBe(0);

    // existing conversation ===========
    await conversationFactory({ twitterData: { id: 1 } });

    await receiveTimeLineResponse(_integration, data);

    expect(await ConversationMessages.count()).toBe(1);
  });

  test('user mentions', async () => {
    data.in_reply_to_status_id = null;
    data.entities.user_mentions = [{ id: 1 }];

    await receiveTimeLineResponse(_integration, data);

    expect(await ConversationMessages.count()).toBe(1);
  });

  test('check deleted integration', async () => {
    const response = await receiveTimeLineResponse({
      _id: 'DFAFDFSD',
      twitterData: { info: {} },
    });

    expect(response).toBe(null);
  });
});
