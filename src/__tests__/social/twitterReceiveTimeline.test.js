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
    const userName = 'username';
    const profileImageUrl = 'profile_image_url';
    const twitterUserId = 24242424242;
    const twitterUserIdStr = '24242424242';

    // regular tweet
    const data = {
      created_at: 'Wed Feb 28 03:18:21 +0000 2018',

      // tweet id
      id: tweetId,
      id_str: tweetIdStr,

      text: tweetText,
      display_text_range: [0, 16],
      source: '<a href="http://twitter.com" rel="nofollow">Twitter Web Client</a>',
      truncated: false,
      in_reply_to_status_id: null,
      in_reply_to_status_id_str: null,
      in_reply_to_user_id: 800236126610935800,
      in_reply_to_user_id_str: '800236126610935808',
      in_reply_to_screen_name: 'Dombo84986356',

      // tweeted user's info
      user: {
        id: twitterUserId,
        id_str: twitterUserIdStr,
        name: userName,
        screen_name: 'b_batamar',
        location: 'Mongolia',
        url: 'http://thenewmediatechnology.com/',
        description: 'Back-End engineer at @erxesHQ',
        translator_type: 'none',
        protected: false,
        verified: false,
        followers_count: 520,
        friends_count: 141,
        listed_count: 15,
        favourites_count: 3,
        statuses_count: 143,
        created_at: 'Thu Jul 22 09:35:28 +0000 2010',
        utc_offset: -32400,
        time_zone: 'Alaska',
        geo_enabled: false,
        lang: 'en',
        contributors_enabled: false,
        is_translator: false,
        profile_background_color: '0099B9',
        profile_background_image_url: 'kfvbnqngu4tmwh4w1bbe.jpeg',
        profile_background_image_url_https: '620021542/kfvbnqngu4tmwh4w1bbe.jpeg',
        profile_background_tile: false,
        profile_link_color: '0099B9',
        profile_sidebar_border_color: '5ED4DC',
        profile_sidebar_fill_color: '95E8EC',
        profile_text_color: '3C3940',
        profile_use_background_image: true,
        profile_image_url: profileImageUrl,
        profile_image_url_https: '79Dob1zF_normal.jpg',
        profile_banner_url: 'https://pbs.twimg.com/profile_banners/169431359/1478856517',
        default_profile: false,
        default_profile_image: false,
        following: null,
        follow_request_sent: null,
        notifications: null,
      },
      geo: null,
      coordinates: null,
      place: null,
      contributors: null,
      is_quote_status: false,
      quote_count: 0,
      reply_count: 0,
      retweet_count: 0,
      favorite_count: 0,
      entities: {
        hashtags: [],
        urls: [],
        user_mentions: [[Object]],
        symbols: [],
        media: [[Object]],
      },
      extended_entities: { media: [[Object]] },
      favorited: false,
      retweeted: false,
      possibly_sensitive: false,
      filter_level: 'low',
      lang: 'und',
      timestamp_ms: '1519787901774',
    };

    // call action
    await createConversationByMention(_integration, data);

    expect(await Conversations.find().count()).toBe(1); // 1 conversation
    expect(await Customers.find().count()).toBe(1); // 1 customer
    expect(await ConversationMessages.find().count()).toBe(1); // 1 message

    let conversation = await Conversations.findOne();
    const customer = await Customers.findOne();
    const message = await ConversationMessages.findOne();

    const timelineData = {
      inReplyToStatusId: null,
      inReplyToStatusIdStr: null,
      inReplyToUserId: 800236126610935800,
      inReplyToUserIdStr: '800236126610935808',
      inReplyToScreenName: 'Dombo84986356',
      isQuoteStatus: false,
      favorited: false,
      retweeted: false,
      quoteCount: 0,
      replyCount: 0,
      retweetCount: 0,
      favoriteCount: 0,
    };

    // check conversation field values
    expect(conversation.createdAt).toBeDefined();
    expect(conversation.integrationId).toBe(_integration._id);
    expect(conversation.customerId).toBe(customer._id);
    expect(conversation.status).toBe(CONVERSATION_STATUSES.NEW);
    expect(conversation.content).toBe(tweetText);
    expect(conversation.twitterData.id).toBe(tweetId);
    expect(conversation.twitterData.idStr).toBe(tweetIdStr);
    expect(conversation.twitterData.isDirectMessage).toBe(false);
    expect(conversation.twitterData.entities).toBeDefined();
    expect(conversation.twitterData.timeline.toJSON()).toEqual(timelineData);

    // check customer field values
    expect(customer.createdAt).toBeDefined();
    expect(customer.integrationId).toBe(_integration._id);
    expect(customer.twitterData.id).toBe(twitterUserId);
    expect(customer.twitterData.idStr).toBe(twitterUserIdStr);
    expect(customer.twitterData.name).toBe(userName);
    expect(customer.twitterData.profileImageUrl).toBe(profileImageUrl);

    // 1 log
    expect(await ActivityLogs.find().count()).toBe(1);

    // check message field values
    expect(message.createdAt).toBeDefined();
    expect(message.conversationId).toBe(conversation._id);
    expect(message.customerId).toBe(customer._id);
    expect(message.internal).toBe(false);
    expect(message.content).toBe(tweetText);
    expect(message.twitterData.entities).toBeDefined();
    expect(message.twitterData.timeline.toJSON()).toEqual(timelineData);
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
