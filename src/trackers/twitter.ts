import { CONVERSATION_STATUSES } from '../data/constants';
import { publishMessage } from '../data/resolvers/mutations/conversations';
import { ActivityLogs, ConversationMessages, Conversations, Customers, Integrations } from '../db/models';
import { IConversationDocument } from '../db/models/definitions/conversations';
import { IIntegrationDocument } from '../db/models/definitions/integrations';
import { findParentTweets, twitRequest } from './twitterTracker';

/*
 * Prepare data to save for conversation
 * Common util. Using in both timeline and direct message
 */
const extractConversationData = ({
  data,
  isDirectMessage,
  timeline = {},
  directMessage = {},
}: {
  data: any;
  isDirectMessage: boolean;
  timeline?: any;
  directMessage: any;
}) => ({
  id: data.id,
  id_str: data.id_str,
  created_at: data.created_at,
  isDirectMessage,
  entities: data.entities,
  extended_entities: data.extended_entities,
  ...timeline,
  ...directMessage,
});

/*
 * Get or create customer using twitter data
 * Common util. Using in both timeline and direct message
 */
const getOrCreateCustomer = async (integrationId: string, user: any): Promise<string> => {
  const customer = await Customers.findOne({
    'twitterData.id': user.id,
  });

  if (customer) {
    return customer._id;
  }

  // create customer
  const createdCustomer = await Customers.createCustomer({
    firstName: user.name,
    integrationId,
    avatar: user.profile_image_url,
    links: {
      twitter: `https://twitter.com/${user.screen_name}`,
    },
    twitterData: {
      id: user.id,
      id_str: user.id_str,
    },
  });

  // create log
  await ActivityLogs.createCustomerRegistrationLog(createdCustomer);

  return createdCustomer._id;
};

// Direct message ================================

/*
 * Prepare data to save for conversation using direct message
 */
const extractConversationDataDirectMessage = data =>
  extractConversationData({
    data,
    isDirectMessage: true,
    directMessage: {
      sender_id: data.sender_id,
      sender_id_str: data.sender_id_str,
      recipient_id: data.recipient_id,
      recipient_id_str: data.recipient_id_str,
    },
  });

/*
 * Create new direct message
 */
const createDirectMessage = async ({ conversation, data }: { conversation: IConversationDocument; data: any }) => {
  const customerId = await getOrCreateCustomer(conversation.integrationId, data.sender);

  // create new message
  const messageId = await ConversationMessages.createMessage({
    conversationId: conversation._id,
    customerId,
    content: data.text,
    internal: false,
    twitterData: extractConversationDataDirectMessage(data),
  });

  // notify subscription =========
  const message = await ConversationMessages.findOne({ _id: messageId });

  if (!message) {
    throw new Error("createDirectMessage: Couldn't publish message");
  }

  publishMessage(message);

  return messageId;
};

/*
 * Create new conversation by direct message
 */
export const receiveDirectMessageInformation = async (data: any, integration: IIntegrationDocument) => {
  // When situations like integration is deleted but trackIntegration
  // version of that integration is still running, new conversations being
  // created using non existing integrationId
  if (!(await Integrations.findOne({ _id: integration._id }))) {
    return null;
  }

  let conversation = await Conversations.findOne({
    'twitterData.isDirectMessage': true,
    $or: [
      {
        'twitterData.sender_id': data.sender_id,
        'twitterData.recipient_id': data.recipient_id,
      },
      {
        'twitterData.sender_id': data.recipient_id,
        'twitterData.recipient_id': data.sender_id,
      },
    ],
  }).sort({ createdAt: -1 });

  if (conversation && conversation.status !== CONVERSATION_STATUSES.CLOSED) {
    // update some infos
    await Conversations.update(
      { _id: conversation._id },
      {
        $set: {
          content: data.text,
          status: CONVERSATION_STATUSES.OPEN,
          updatedAt: new Date(),
        },
      },
    );

    // create new message
    await createDirectMessage({ conversation, data });

    // create new conversation
  } else {
    const customerId = await getOrCreateCustomer(integration._id, data.sender);

    const conversationId = await Conversations.createConversation({
      content: data.text,
      integrationId: integration._id,
      customerId,

      // save tweet data
      twitterData: extractConversationDataDirectMessage(data),
    });

    conversation = await Conversations.findOne({ _id: conversationId });

    if (!conversation) {
      throw new Error('receiveDirectMessageInformation: Conversation not found');
    }

    // create new message
    await createDirectMessage({ conversation, data });
  }

  return conversation;
};

// Timeline ==========================

/*
 * Prepare data to save for conversation using timeline info
 */
const extractConversationDataTimeline = (data: any) => {
  const updatedData: any = {
    data,
    isDirectMessage: false,
    timeline: {
      in_reply_to_status_id: data.in_reply_to_status_id,
      in_reply_to_status_id_str: data.in_reply_to_status_id_str,
      in_reply_to_user_id: data.in_reply_to_user_id,
      in_reply_to_user_id_str: data.in_reply_to_user_id_str,
      in_reply_to_screen_name: data.in_reply_to_screen_name,
      is_quote_status: data.is_quote_status,
      favorited: data.favorited,
      retweeted: data.retweeted,
      quote_count: data.quote_count,
      reply_count: data.reply_count,
      retweet_count: data.retweet_count,
      favorite_count: data.favorite_count,
    },
  };

  if (data.extended_tweet) {
    updatedData.extended_tweet = data.extended_tweet;
  }

  return extractConversationData(updatedData);
};

/*
 * Create new message using timeline
 */
export const createOrUpdateTimelineMessage = async (conversation: IConversationDocument, data: any) => {
  const prevMessage = await ConversationMessages.findOne({
    'twitterData.id': data.id,
  });

  let messageId;

  // update
  if (prevMessage) {
    await ConversationMessages.update(
      { 'twitterData.id': data.id },
      {
        $set: {
          twitterData: data,
          content: data.text,
        },
      },
    );

    messageId = prevMessage._id;

    // create
  } else {
    const customerId = await getOrCreateCustomer(conversation.integrationId, data.user);

    // create new message
    messageId = await ConversationMessages.createMessage({
      conversationId: conversation._id,
      customerId,
      content: data.text,
      internal: false,
      twitterData: extractConversationDataTimeline(data),
    });
  }

  // notify subscription =========
  const message = await ConversationMessages.findOne({ _id: messageId });

  if (!message) {
    throw new Error("createOrUpdateTimelineMessage: Couldn't publish message");
  }

  publishMessage(message);

  return messageId;
};

/*
 * Create or update conversation using tweet data
 */
export const createOrUpdateTimelineConversation = async (integrationId: string, tweetObj: any) => {
  const prevConversation = await Conversations.findOne({
    'twitterData.id': tweetObj.id,
  });

  if (prevConversation && prevConversation.status !== CONVERSATION_STATUSES.CLOSED) {
    // update some infos
    await Conversations.update(
      { 'twitterData.id': tweetObj.id },
      {
        $set: {
          twitterData: tweetObj,
          content: tweetObj.text,
          status: CONVERSATION_STATUSES.OPEN,
          updatedAt: new Date(),
        },
      },
    );

    // return updated conversation
    return Conversations.findOne({ 'twitterData.id': tweetObj.id });
  }

  return Conversations.createConversation({
    content: tweetObj.text,
    integrationId,
    customerId: await getOrCreateCustomer(integrationId, tweetObj.user),
    twitterData: extractConversationDataTimeline(tweetObj),
  });
};

/*
 * Create conversation, message, customer by mentioned information
 */
export const saveTimelineInformation = async (integration: IIntegrationDocument, data: any) => {
  console.log('Received timeline information .........'); // eslint-disable-line

  const twit = TwitMap[integration._id];
  const tweets = await findParentTweets(twit, data, [data]);

  // find base tweet
  const rootTweet = tweets.find(tweetObj => !tweetObj.in_reply_to_status_id);

  const conversation = await createOrUpdateTimelineConversation(integration._id, rootTweet);

  if (!conversation) {
    throw new Error("saveTimelineInformation: Couldn't create conversation");
  }

  for (const tweetObj of tweets) {
    await createOrUpdateTimelineMessage(conversation, tweetObj);
  }

  return conversation;
};

/*
 * Receive timeline information
 */
export const receiveTimelineInformation = async (integration: IIntegrationDocument, data: any) => {
  // When situations like integration is deleted but trackIntegration
  // version of that integration is still running, new conversations being
  // created using non existing integrationId
  if (!(await Integrations.findOne({ _id: integration._id })) || !integration.twitterData) {
    throw new Error('receiveTimelineInformation: Integration not found');
  }

  const twitterData = integration.twitterData.toJSON();
  const userId = twitterData.info.id;

  // listen for mentioned tweets ================
  const isMentioned = data.entities.user_mentions.find(mention => mention.id === userId);

  // if tracking user is mentioned but he created this tweet then ignore it
  if (isMentioned && data.user.id !== userId) {
    return saveTimelineInformation(integration, data);
  }

  // listen for previously saved tweets ================
  const repliedMessage = await ConversationMessages.findOne({
    $and: [{ 'twitterData.id': { $ne: null } }, { 'twitterData.id': data.in_reply_to_status_id }],
  });

  if (data.in_reply_to_status_id && repliedMessage) {
    const conversation = await Conversations.findOne({
      _id: repliedMessage.conversationId,
    });

    if (!conversation) {
      return;
    }

    // receiving multiple accounts's timeline info, So we will receive same
    // tweet multiple times. So we are checking that found message is in
    // this listening integration
    // Otherwise same tweet will be saved multiple times
    if (conversation.integrationId === integration._id) {
      return saveTimelineInformation(integration, data);
    }
  }
};

// save twit instances by integration id
export const TwitMap = {};

/*
 * Post reply to twitter
 */
export const tweetReply = async ({
  conversation,
  text,
  toId,
  toScreenName,
}: {
  conversation: IConversationDocument;
  text: string;
  toId?: string;
  toScreenName?: string;
}) => {
  if (!conversation || !conversation.twitterData) {
    throw new Error('tweetReply: Conversation not found');
  }

  const integrationId = conversation.integrationId;

  const twit = TwitMap[integrationId];
  const twitterData = conversation.twitterData;

  // send direct message
  if (conversation.twitterData.isDirectMessage) {
    return twitRequest.post(twit, 'direct_messages/new', {
      user_id: twitterData.sender_id_str,
      text,
    });
  }

  // tweet
  return twitRequest.post(twit, 'statuses/update', {
    status: `@${toScreenName} ${text}`,

    // replying tweet id
    in_reply_to_status_id: toId,
  });
};

/*
 * Update twitterData field's value in conversation, message
 */
const updateTwitterData = async ({ twit, tweetId }: { twit: any; tweetId: string }) => {
  const twitterData = await twitRequest.get(twit, 'statuses/show', {
    id: tweetId,
  });

  const selector = { 'twitterData.id_str': tweetId };

  await Conversations.update(selector, { $set: { twitterData } });
  await ConversationMessages.update(selector, { $set: { twitterData } });
};

/*
 * Tweet
 */
export const tweet = async ({ integrationId, text }: { integrationId: string; text: string }) => {
  const twit = TwitMap[integrationId];

  // send reply
  return twitRequest.post(twit, 'statuses/update', {
    status: text,
  });
};

/*
 * Retweet
 */
export const retweet = async ({ integrationId, id }: { integrationId: string; id: string }) => {
  const twit = TwitMap[integrationId];

  const response: any = await twitRequest.post(twit, 'statuses/retweet/:id', {
    id,
  });

  // update main tweet's data
  await updateTwitterData({ twit, tweetId: response.retweeted_status.id_str });

  return response;
};

/*
 * Favorite
 */
export const favorite = async ({ integrationId, id }: { integrationId: string; id: string }) => {
  const twit = TwitMap[integrationId];

  const response: any = await twitRequest.post(twit, 'favorites/create', {
    id,
  });

  // update main tweet's data
  await updateTwitterData({ twit, tweetId: response.id_str });

  return response;
};
