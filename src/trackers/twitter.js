/* eslint-disable no-underscore-dangle */

import {
  ActivityLogs,
  Customers,
  ConversationMessages,
  Conversations,
  Integrations,
} from '../db/models';
import { publishMessage } from '../data/resolvers/mutations/conversations';
import { twitRequest, findParentTweets } from './twitterTracker';
import { CONVERSATION_STATUSES } from '../data/constants';

/*
 * Prepare data to save for conversation
 * Common util. Using in both timeline and direct message
 */
const extractConversationData = ({ data, isDirectMessage, timeline = {}, directMessage = {} }) => ({
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
 *
 * @param {String} integrationId - Integration id
 * @param {Object} user - User
 *
 * @return customer id
 */
const getOrCreateCustomer = async (integrationId, user) => {
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

  return createdCustomer;
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
 * @param {Object} conversation
 * @param {String} content
 * @param {Object} user
 * @return newly created message id
 */
const createDirectMessage = async ({ conversation, data }) => {
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

  publishMessage(message);

  return messageId;
};

/*
 * Create new conversation by direct message
 * @param {Object} data - Twitter stream data
 * @param {Object} integration
 * @return previous or newly conversation object
 */
export const receiveDirectMessageInformation = async (data, integration) => {
  // When situations like integration is deleted but trackIntegration
  // version of that integration is still running, new conversations being
  // created using non existing integrationId
  if (!await Integrations.findOne({ _id: integration._id })) {
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

    // create new message
    await createDirectMessage({ conversation, data });
  }

  return conversation;
};

// Timeline ==========================

/*
 * Prepare data to save for conversation using timeline info
 */
const extractConversationDataTimeline = data => {
  const updatedData = {
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
 * @param {Object} conversation
 * @param {String} content
 * @param {Object} user
 * @return newly created message id
 */
export const createOrUpdateTimelineMessage = async (conversation, data) => {
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

  publishMessage(message);

  return messageId;
};

/*
 * Create or update conversation using tweet data
 *
 * @param {String} integrationId - Integration id
 * @param {Object} tweet - Twitter response
 *
 * @return {Object} - Created or updated conversation object
 */
export const createOrUpdateTimelineConversation = async (integrationId, tweet) => {
  let prevConversation = await Conversations.findOne({
    'twitterData.id': tweet.id,
  });

  if (prevConversation && prevConversation.status !== CONVERSATION_STATUSES.CLOSED) {
    // update some infos
    await Conversations.update(
      { 'twitterData.id': tweet.id },
      {
        $set: {
          twitterData: tweet,
          content: tweet.text,
          status: CONVERSATION_STATUSES.OPEN,
          updatedAt: new Date(),
        },
      },
    );

    // return updated conversation
    return Conversations.findOne({ 'twitterData.id': tweet.id });
  }

  return Conversations.createConversation({
    content: tweet.text,
    integrationId,
    customerId: await getOrCreateCustomer(integrationId, tweet.user),
    twitterData: extractConversationDataTimeline(tweet),
  });
};

/*
 * Create conversation, message, customer by mentioned information
 * @param {Object} integration - Integration
 * @param {Object} data - Tweet data
 * @return newly created message
 */
export const saveTimelineInformation = async (integration, data) => {
  console.log('Received timeline information .........'); // eslint-disable-line

  const twit = TwitMap[integration._id];
  const tweets = await findParentTweets(twit, data, [data]);

  // find base tweet
  const rootTweet = tweets.find(tweet => !tweet.in_reply_to_status_id);

  const conversation = await createOrUpdateTimelineConversation(integration._id, rootTweet);

  for (const tweet of tweets) {
    await createOrUpdateTimelineMessage(conversation, tweet);
  }

  return conversation;
};

/*
 * Receive timeline information
 * @param {Object} integration - Integration
 * @param {Object} data - Tweet data
 * @return newly created message
 */
export const receiveTimelineInformation = async (integration, data) => {
  // When situations like integration is deleted but trackIntegration
  // version of that integration is still running, new conversations being
  // created using non existing integrationId
  if (!await Integrations.findOne({ _id: integration._id })) {
    return null;
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
export const tweetReply = async ({ conversation, text, toId, toScreenName }) => {
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
const updateTwitterData = async ({ twit, tweetId }) => {
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
export const tweet = async ({ integrationId, text }) => {
  const twit = TwitMap[integrationId];

  // send reply
  return twitRequest.post(twit, 'statuses/update', {
    status: text,
  });
};

/*
 * Retweet
 */
export const retweet = async ({ integrationId, id }) => {
  const twit = TwitMap[integrationId];

  const response = await twitRequest.post(twit, 'statuses/retweet/:id', { id });

  // update main tweet's data
  await updateTwitterData({ twit, tweetId: response.retweeted_status.id_str });

  return response;
};

/*
 * Favorite
 */
export const favorite = async ({ integrationId, id }) => {
  const twit = TwitMap[integrationId];

  const response = await twitRequest.post(twit, 'favorites/create', { id });

  // update main tweet's data
  await updateTwitterData({ twit, tweetId: response.id_str });

  return response;
};
