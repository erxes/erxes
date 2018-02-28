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
      id: 968686272498708500,
      id_str: '968686272498708484',
      text: 'rrrr https://t.co/o3O2wAeYaB',
      sender: {
        id: 169431359,
        id_str: '169431359',
        name: 'BatAmar Battulga',
        screen_name: 'b_batamar',
        location: 'Mongolia',
        url: 'http://thenewmediatechnology.com/',
        description: 'Back-End engineer at @erxesHQ',
        protected: false,
        followers_count: 520,
        friends_count: 141,
        listed_count: 15,
        created_at: 'Thu Jul 22 09:35:28 +0000 2010',
        favourites_count: 3,
        utc_offset: -32400,
        time_zone: 'Alaska',
        geo_enabled: false,
        verified: false,
        statuses_count: 142,
        lang: 'en',
        contributors_enabled: false,
        is_translator: false,
        is_translation_enabled: false,
        profile_background_color: '0099B9',
        profile_background_image_url: 'kfvbnqngu4tmwh4w1bbe.jpeg',
        profile_background_image_url_https: 'kfvbnqngu4tmwh4w1bbe.jpeg',
        profile_background_tile: false,
        profile_image_url: '79Dob1zF_normal.jpg',
        profile_image_url_https: '79Dob1zF_normal.jpg',
        profile_banner_url: 'https://pbs.twimg.com/profile_banners/169431359/1478856517',
        profile_link_color: '0099B9',
        profile_sidebar_border_color: '5ED4DC',
        profile_sidebar_fill_color: '95E8EC',
        profile_text_color: '3C3940',
        profile_use_background_image: true,
        default_profile: false,
        default_profile_image: false,
        following: false,
        follow_request_sent: false,
        notifications: false,
        translator_type: 'none',
      },
      sender_id: 169431359,
      sender_id_str: '169431359',
      sender_screen_name: 'b_batamar',
      recipient: {
        id: 800236126610935800,
        id_str: '800236126610935808',
        name: 'dombo123',
        screen_name: 'Dombo84986356',
        location: null,
        url: null,
        description: null,
        protected: false,
        followers_count: 4,
        friends_count: 3,
        listed_count: 0,
        created_at: 'Sun Nov 20 07:15:35 +0000 2016',
        favourites_count: 0,
        utc_offset: null,
        time_zone: null,
        geo_enabled: false,
        verified: false,
        statuses_count: 124,
        lang: 'en',
        contributors_enabled: false,
        is_translator: false,
        is_translation_enabled: false,
        profile_background_color: 'F5F8FA',
        profile_background_image_url: null,
        profile_background_image_url_https: null,
        profile_background_tile: false,
        profile_image_url: 'default_profile_normal.png',
        profile_image_url_https: 'default_profile_normal.png',
        profile_link_color: '1DA1F2',
        profile_sidebar_border_color: 'C0DEED',
        profile_sidebar_fill_color: 'DDEEF6',
        profile_text_color: '333333',
        profile_use_background_image: true,
        default_profile: true,
        default_profile_image: false,
        following: false,
        follow_request_sent: false,
        notifications: false,
        translator_type: 'none',
      },
      recipient_id: 800236126610935800,
      recipient_id_str: '800236126610935808',
      recipient_screen_name: 'Dombo84986356',
      created_at: 'Wed Feb 28 03:16:19 +0000 2018',
      entities: {
        hashtags: [],
        symbols: [],
        user_mentions: [],
        urls: [[Object]],
        media: [[Object]],
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

    const directMessageDoc = {
      senderId: data.sender_id,
      senderIdStr: data.sender_id_str,
      recipientId: data.recipient_id,
      recipientIdStr: data.recipient_id_str,
    };

    // check conv field values
    expect(conv.createdAt).toBeDefined();
    expect(conv.integrationId).toBe(_integration._id);
    expect(conv.customerId).toBe(customer._id);
    expect(conv.status).toBe(CONVERSATION_STATUSES.NEW);
    expect(conv.content).toBe(data.text);
    expect(conv.twitterData.id).toBe(data.id);
    expect(conv.twitterData.idStr).toBe(data.id_str);
    expect(conv.twitterData.isDirectMessage).toBe(true);
    expect(conv.twitterData.entities).toBeDefined();
    expect(conv.twitterData.directMessage.toJSON()).toEqual(directMessageDoc);

    // check customer field values
    expect(customer.createdAt).toBeDefined();
    expect(customer.integrationId).toBe(_integration._id);
    expect(customer.twitterData.id).toBe(data.sender_id);
    expect(customer.twitterData.idStr).toBe(data.sender_id_str);
    expect(customer.twitterData.name).toBe(data.sender.name);
    expect(customer.twitterData.profileImageUrl).toBe(data.sender.profile_image_url);

    // 1 log
    expect(await ActivityLogs.find().count()).toBe(1);

    // check message field values
    expect(message.createdAt).toBeDefined();
    expect(message.conversationId).toBe(conv._id);
    expect(message.customerId).toBe(customer._id);
    expect(message.internal).toBe(false);
    expect(message.content).toBe(data.text);
    expect(message.twitterData.entities).toBeDefined();
    expect(message.twitterData.directMessage.toJSON()).toEqual(directMessageDoc);

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
