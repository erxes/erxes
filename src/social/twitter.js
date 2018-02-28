import {
  ActivityLogs,
  Customers,
  ConversationMessages,
  Conversations,
  Integrations,
} from '../db/models';
import { conversationMessageCreated } from '../data/resolvers/mutations/conversations';
import { twitRequest } from './twitterTracker';

/*
 * Prepare data to save for conversation
 */
const extractConversationData = ({ data, isDirectMessage, timeline, directMessage }) => ({
  id: data.id,
  idStr: data.id_str,
  isDirectMessage,
  entities: data.entities,
  extendedEntities: data.extendedEntities,
  timeline,
  directMessage,
});

/*
 * Prepare data to save for conversation using timeline info
 */
const extractConversationDataTimeline = data =>
  extractConversationData({
    data,
    isDirectMessage: false,
    timeline: {
      inReplyToStatusId: data.in_reply_to_status_id,
      inReplyToStatusIdStr: data.in_reply_to_status_id_str,
      inReplyToUserId: data.in_reply_to_user_id,
      inReplyToUserIdStr: data.in_reply_to_user_id_str,
      inReplyToScreenName: data.in_reply_to_screen_name,
      isQuoteStatus: data.is_quote_status,
      favorited: data.favorited,
      retweeted: data.retweeted,
      quoteCount: data.quote_count,
      replyCount: data.reply_count,
      retweetCount: data.retweet_count,
      favoriteCount: data.favorite_count,
    },
  });

/*
 * Prepare data to save for conversation using direct message
 */
const extractConversationDataDirectMessage = data =>
  extractConversationData({
    data,
    isDirectMessage: true,
    directMessage: {
      senderId: data.sender_id,
      senderIdStr: data.sender_id_str,
      recipientId: data.recipient_id,
      recipientIdStr: data.recipient_id_str,
    },
  });

/*
 * Get or create customer using twitter data
 * @param {String} integrationId - Integration id
 * @param {Object} user - User
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
    twitterData: {
      id: user.id,
      idStr: user.id_str,
      name: user.name,
      screenName: user.screen_name,
      profileImageUrl: user.profile_image_url,
    },
  });

  // create log
  await ActivityLogs.createCustomerRegistrationLog(createdCustomer);

  return createdCustomer;
};

/*
 * Create new message
 * @param {Object} conversation
 * @param {String} content
 * @param {Object} user
 * @return newly created message id
 */
const createMessage = async ({ conversation, data }) => {
  let user = data.user;
  let twitterData = extractConversationDataTimeline(data);

  // is direct message
  if (conversation.twitterData.isDirectMessage) {
    user = data.sender;
    twitterData = extractConversationDataDirectMessage(data);
  }

  const customerId = await getOrCreateCustomer(conversation.integrationId, user);

  // create new message
  const messageId = await ConversationMessages.createMessage({
    conversationId: conversation._id,
    customerId,
    content: data.text,
    internal: false,
    twitterData,
  });

  // notify subscription =========
  const message = await ConversationMessages.findOne({ _id: messageId });

  await conversationMessageCreated(message, message.conversationId);

  return messageId;
};

/*
 * Create new message by tweet reply information
 * @param {Object} integration
 * @param {Object} data - Twitter stream data
 * @return newly created message
 */
export const receiveMentionReply = async (integration, data) => {
  // find conversation by tweet id
  const conversation = await Conversations.findOne({
    'twitterData.id': data.in_reply_to_status_id,
  });

  if (conversation) {
    // if closed, reopen it
    await Conversations.reopen(conversation._id);

    // create new message
    return createMessage({ conversation, data });
  }

  return null;
};

/*
 * Create conversation by mentioned information
 * @param {Object} integration - Integration
 * @param {Object} data - Tweet data
 * @return newly created message
 */
export const createConversationByMention = async (integration, data) => {
  const customerId = await getOrCreateCustomer(integration._id, data.user);

  const conversationId = await Conversations.createConversation({
    content: data.text,
    integrationId: integration._id,
    customerId,

    // save tweet information
    twitterData: extractConversationDataTimeline(data),
  });

  const conversation = await Conversations.findOne({ _id: conversationId });

  // create new message
  return createMessage({ conversation, data });
};

/*
 * Create new conversation by direct message
 * @param {Object} data - Twitter stream data
 * @param {Object} integration
 * @return previous or newly conversation object
 */
export const getOrCreateDirectMessageConversation = async (data, integration) => {
  // When situations like integration is deleted but trackIntegration
  // version of that integration is still running, new conversations being
  // created using non existing integrationId
  if (!await Integrations.findOne({ _id: integration._id })) {
    return null;
  }

  console.log('Receiving direct message'); // eslint-disable-line

  let conversation = await Conversations.findOne({
    'twitterData.isDirectMessage': true,
    $or: [
      {
        'twitterData.directMessage.senderId': data.sender_id,
        'twitterData.directMessage.recipientId': data.recipient_id,
      },
      {
        'twitterData.directMessage.senderId': data.recipient_id,
        'twitterData.directMessage.recipientId': data.sender_id,
      },
    ],
  });

  if (conversation) {
    // if closed, reopen it
    await Conversations.reopen(conversation._id);

    // create new message
    await createMessage({ conversation, data });

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
    await createMessage({ conversation, data });
  }

  return conversation;
};

/*
 * Receive timeline response
 */
export const receiveTimeLineResponse = async (integration, data) => {
  const integrationUserId = integration.twitterData.info.id;
  const integrationOnDb = await Integrations.findOne({ _id: integration._id });

  // When situations like integration is deleted but trackIntegration
  // version of that integration is still running, new conversations being
  // created using non existing integrationId
  if (!integrationOnDb) {
    return null;
  }

  // if user is replying to some tweet
  if (data.in_reply_to_status_id && data.user.id === integrationUserId) {
    console.log('Receiving mention reply'); // eslint-disable-line
    return receiveMentionReply(integration, data);
  }

  for (let mention of data.entities.user_mentions) {
    // listen for only mentioned tweets
    if (mention.id === integrationUserId) {
      console.log('Receiving mention'); // eslint-disable-line
      await createConversationByMention(integration, data);
    }
  }

  return null;
};

// save twit instances by integration id
export const TwitMap = {};

/*
 * post reply to twitter
 */
export const tweetReply = async (conversation, text) => {
  const twit = TwitMap[conversation.integrationId];
  const twitterData = conversation.twitterData;

  // send direct message
  if (conversation.twitterData.isDirectMessage) {
    return twitRequest.post(twit, 'direct_messages/new', {
      user_id: twitterData.directMessage.senderIdStr,
      text,
    });
  }

  const customer = await Customers.findOne({ _id: conversation.customerId });

  // send reply
  return twitRequest.post(twit, 'statuses/update', {
    status: `@${customer.twitterData.screenName} ${text}`,

    // replying tweet id
    in_reply_to_status_id: twitterData.idStr,
  });
};
