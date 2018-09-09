import { CONVERSATION_STATUSES } from '../../data/constants';
import { connect, disconnect } from '../../db/connection';
import { conversationFactory, integrationFactory } from '../../db/factories';
import { ActivityLogs, ConversationMessages, Conversations, Customers, Integrations } from '../../db/models';

import {
  createOrUpdateTimelineConversation,
  createOrUpdateTimelineMessage,
  receiveTimelineInformation,
} from '../../trackers/twitter';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('createOrUpdateTimelineConversation', () => {
  let _integration;

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

  const data = {
    created_at: 'Wed Feb 28 03:18:21 +0000 2018',

    // tweet id
    id: 242424242424,
    id_str: '242424242424',

    text: '@test hi',
    in_reply_to_status_id: null,
    in_reply_to_status_id_str: null,
    in_reply_to_user_id: 800236126610935800,
    in_reply_to_user_id_str: '800236126610935808',
    in_reply_to_screen_name: 'Dombo84986356',

    // tweeted user's info
    user: {
      id: 2424242424,
      id_str: '24242424242',
      name: 'username',
      screen_name: 'b_batamar',
      profile_image_url: 'profile_image_url',
    },
    is_quote_status: false,
    quote_count: 0,
    reply_count: 0,
    retweet_count: 0,
    favorite_count: 0,
    entities: {
      hashtags: [],
      urls: [],
      user_mentions: [{ id: 1 }],
      symbols: [],
      media: [[Object]],
    },
    extended_entities: { media: [[Object]] },
    favorited: false,
    retweeted: false,
  };

  test('createOrUpdateTimelineConversation', async () => {
    // call action
    await createOrUpdateTimelineConversation(_integration._id, data);

    expect(await Conversations.find().count()).toBe(1); // 1 conversation
    expect(await Customers.find().count()).toBe(1); // 1 customer

    let conversation = await Conversations.findOne();
    const customer = await Customers.findOne();

    // check conversation field values
    expect(conversation.createdAt).toBeDefined();
    expect(conversation.integrationId).toBe(_integration._id);
    expect(conversation.customerId).toBe(customer._id);
    expect(conversation.status).toBe(CONVERSATION_STATUSES.NEW);
    expect(conversation.content).toBe('@test hi');
    expect(conversation.twitterData.id).toBe(242424242424);
    expect(conversation.twitterData.id_str).toBe('242424242424');

    expect(conversation.twitterData.isDirectMessage).toBe(false);
    expect(conversation.twitterData.in_reply_to_status_id).toBe(null);
    expect(conversation.twitterData.in_reply_to_status_id_str).toBe(null);
    expect(conversation.twitterData.in_reply_to_user_id).toBe(800236126610935800);
    expect(conversation.twitterData.in_reply_to_user_id_str).toBe('800236126610935808');
    expect(conversation.twitterData.in_reply_to_screen_name).toBe('Dombo84986356');
    expect(conversation.twitterData.is_quote_status).toBe(false);
    expect(conversation.twitterData.favorited).toBe(false);
    expect(conversation.twitterData.retweeted).toBe(false);
    expect(conversation.twitterData.quote_count).toBe(0);
    expect(conversation.twitterData.reply_count).toBe(0);
    expect(conversation.twitterData.retweet_count).toBe(0);
    expect(conversation.twitterData.favorite_count).toBe(0);

    // check customer field values
    expect(customer.createdAt).toBeDefined();
    expect(customer.integrationId).toBe(_integration._id);
    expect(customer.avatar).toBe('profile_image_url');
    expect(customer.links.twitter).toBe('https://twitter.com/b_batamar');
    expect(customer.twitterData.id).toBe(2424242424);
    expect(customer.twitterData.id_str).toBe('24242424242');

    // 1 log
    expect(await ActivityLogs.find().count()).toBe(1);

    // second call =================
    const updatedData = {
      ...data,
      text: 'updated',
      quote_count: 1,
      reply_count: 1,
    };

    // call
    await createOrUpdateTimelineConversation(_integration._id, updatedData);

    expect(await Conversations.find({}).count()).toBe(1); // 1 conversation
    expect(await Customers.find({}).count()).toBe(1); // 1 customer
    expect(await ActivityLogs.find({}).count()).toBe(1); // 1 log

    await Conversations.update({ _id: conversation._id }, { $set: { status: 'closed' } });

    conversation = await Conversations.findOne();

    // call
    await createOrUpdateTimelineConversation(_integration._id, updatedData);

    // check updated field values

    expect(await Conversations.find({}).count()).toBe(2); // 2 conversation
    expect(conversation.status).toBe('closed');
    expect(conversation.content).toBe('updated');
    expect(conversation.twitterData.quote_count).toBe(1);
    expect(conversation.twitterData.reply_count).toBe(1);
  });

  test('createOrUpdateTimelineMessage', async () => {
    const _conversation = await conversationFactory({
      integrationId: _integration._id,
    });

    // call action
    await createOrUpdateTimelineMessage(_conversation, data);

    expect(await ConversationMessages.find().count()).toBe(1); // 1 message
    expect(await Customers.find().count()).toBe(1); // 1 customer

    let message = await ConversationMessages.findOne();
    const customer = await Customers.findOne();

    // check message field values
    expect(message.createdAt).toBeDefined();
    expect(message.customerId).toBe(customer._id);
    expect(message.content).toBe('@test hi');
    expect(message.twitterData.id).toBe(242424242424);
    expect(message.twitterData.id_str).toBe('242424242424');

    expect(message.twitterData.isDirectMessage).toBe(false);
    expect(message.twitterData.in_reply_to_status_id).toBe(null);
    expect(message.twitterData.in_reply_to_status_id_str).toBe(null);
    expect(message.twitterData.in_reply_to_user_id).toBe(800236126610935800);
    expect(message.twitterData.in_reply_to_user_id_str).toBe('800236126610935808');
    expect(message.twitterData.in_reply_to_screen_name).toBe('Dombo84986356');
    expect(message.twitterData.is_quote_status).toBe(false);
    expect(message.twitterData.favorited).toBe(false);
    expect(message.twitterData.retweeted).toBe(false);
    expect(message.twitterData.quote_count).toBe(0);
    expect(message.twitterData.reply_count).toBe(0);
    expect(message.twitterData.retweet_count).toBe(0);
    expect(message.twitterData.favorite_count).toBe(0);

    // check customer field values
    expect(customer.createdAt).toBeDefined();
    expect(customer.integrationId).toBe(_integration._id);
    expect(customer.avatar).toBe('profile_image_url');
    expect(customer.links.twitter).toBe('https://twitter.com/b_batamar');
    expect(customer.twitterData.id).toBe(2424242424);
    expect(customer.twitterData.id_str).toBe('24242424242');

    // 1 log
    expect(await ActivityLogs.find().count()).toBe(1);

    // second call =================
    const updatedData = {
      ...data,
      text: 'updated',
      quote_count: 1,
      reply_count: 1,
    };

    // call
    await createOrUpdateTimelineMessage(_conversation, updatedData);

    expect(await Conversations.find().count()).toBe(1); // 1 conversation
    expect(await ConversationMessages.find().count()).toBe(1); // 1 message
    expect(await Customers.find().count()).toBe(1); // 1 customer
    expect(await ActivityLogs.find().count()).toBe(1); // 1 log

    message = await ConversationMessages.findOne();

    // check updated field values
    expect(message.content).toBe('updated');
    expect(message.twitterData.quote_count).toBe(1);
    expect(message.twitterData.reply_count).toBe(1);

    // third  call =================
    const newData = {
      ...data,
      id: 1,
      id_str: 'id_str',
      text: 'new',
    };

    // call
    await createOrUpdateTimelineMessage(_conversation, newData);

    expect(await Conversations.find().count()).toBe(1); // 1 conversation
    expect(await ConversationMessages.find().count()).toBe(2); // 2 message
    expect(await Customers.find().count()).toBe(1); // 1 customer
    expect(await ActivityLogs.find().count()).toBe(1); // 1 log
  });

  test('receive', async () => {
    // call action
    await receiveTimelineInformation(_integration, data);

    expect(await Conversations.find().count()).toBe(1); // 1 conversation
    expect(await ConversationMessages.find().count()).toBe(1); // 1 message
    expect(await Customers.find().count()).toBe(1); // 1 customer
    expect(await ActivityLogs.find().count()).toBe(1); // 1 log
  });
});
