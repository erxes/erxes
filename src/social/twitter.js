import { Customers, ConversationMessages, Conversations, Integrations } from '../db/models';
import { CONVERSATION_STATUSES } from '../data/constants';

/*
 * Get or create customer using twitter data
 * @param {String} integrationId - Integration id
 * @param {Object} user - User
 * @return customer id
 */
const getOrCreateCustomer = async (integrationId, user) => {
  const customer = await Customers.findOne({
    integrationId,
    'twitterData.id': user.id,
  });

  if (customer) {
    return customer._id;
  }

  // create customer
  return await Customers.create({
    name: user.name,
    integrationId,
    twitterData: {
      id: user.id,
      idStr: user.id_str,
      name: user.name,
      screenName: user.screen_name,
      profileImageUrl: user.profile_image_url,
    },
  });
};

/*
 * Create new message
 * @param {Object} conversation
 * @param {String} content
 * @param {Object} user
 * @return newly created message id
 */
const createMessage = async (conversation, content, user) => {
  const customerId = await getOrCreateCustomer(conversation.integrationId, user);

  // create new message
  const messageId = await ConversationMessages.create({
    conversationId: conversation._id,
    customerId,
    content,
    internal: false,
  });

  // TODO notify subscription server new message

  return messageId;
};

/*
 * Create new conversation by regular tweet
 * @param {Object} data - Twitter stream data
 * @param {Object} integration
 * @return previous or newly conversation object
 */
export const getOrCreateCommonConversation = async (data, integration) => {
  let conversation;

  if (data.in_reply_to_status_id) {
    // find conversation by tweet id
    conversation = await Conversations.findOne({
      'twitterData.id': data.in_reply_to_status_id,
    });

    if (conversation) {
      // if closed, reopen it
      await Conversations.reopen(conversation._id);

      // create new message
      await createMessage(conversation, data.text, data.user);
    }

    // create new conversation
  } else {
    const customerId = await getOrCreateCustomer(integration._id, data.user);

    const conversationId = await Conversations.create({
      content: data.text,
      integrationId: integration._id,
      customerId,
      status: CONVERSATION_STATUSES.NEW,

      // save tweet id
      twitterData: {
        id: data.id,
        idStr: data.id_str,
        screenName: data.user.screen_name,
        isDirectMessage: false,
      },
    });

    conversation = await Conversations.findOne({ _id: conversationId });

    // create new message
    await createMessage(conversation, data.text, data.user);
  }

  return conversation;
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
    await createMessage(conversation, data.text, data.sender);

    // create new conversation
  } else {
    const customerId = await getOrCreateCustomer(integration._id, data.sender);

    const conversationId = await Conversations.create({
      content: data.text,
      integrationId: integration._id,
      customerId,
      status: CONVERSATION_STATUSES.NEW,

      // save tweet id
      twitterData: {
        id: data.id,
        idStr: data.id_str,
        screenName: data.sender.screen_name,
        isDirectMessage: true,
        directMessage: {
          senderId: data.sender_id,
          senderIdStr: data.sender_id_str,
          recipientId: data.recipient_id,
          recipientIdStr: data.recipient_id_str,
        },
      },
    });

    conversation = await Conversations.findOne({ _id: conversationId });

    // create new message
    await createMessage(conversation, data.text, data.sender);
  }

  return conversation;
};

export const receiveTimeLineResponse = async (integration, data) => {
  const integrationUserId = integration.twitterData.id;
  const integrationOnDb = await Integrations.findOne({ _id: integration._id });

  // When situations like integration is deleted but trackIntegration
  // version of that integration is still running, new conversations being
  // created using non existing integrationId
  if (!integrationOnDb) {
    return null;
  }

  // if user is replying to some tweet
  if (data.in_reply_to_status_id) {
    const conversation = await Conversations.findOne({
      'twitterData.id': data.in_reply_to_status_id,
    });

    // and that tweet must exists
    if (conversation) {
      return getOrCreateCommonConversation(data, integration);
    }
  }

  for (let mention of data.entities.user_mentions) {
    // listen for only mentioned tweets
    if (mention.id === integrationUserId) {
      await getOrCreateCommonConversation(data, integration);
    }
  }

  return null;
};

// save twit instances by integration id
export const TwitMap = {};

/*
 * post reply to twitter
 */
export const tweetReply = (conversation, text) => {
  const twit = TwitMap[conversation.integrationId];
  const twitterData = conversation.twitterData;

  // send direct message
  if (conversation.twitterData.isDirectMessage) {
    return twit.post(
      'direct_messages/new',
      {
        user_id: twitterData.directMessage.senderIdStr,
        text,
      },
      /* istanbul ignore next */
      e => {
        if (e) throw Error(e.message);
      },
    );
  }

  // send reply
  return twit.post(
    'statuses/update',
    {
      status: `@${twitterData.screenName} ${text}`,

      // replying tweet id
      in_reply_to_status_id: twitterData.idStr,
    },
    /* istanbul ignore next */
    e => {
      if (e) throw Error(e.message);
    },
  );
};
