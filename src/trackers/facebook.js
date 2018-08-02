import {
  ActivityLogs,
  Integrations,
  Conversations,
  ConversationMessages,
  Customers,
} from '../db/models';

import { publishMessage } from '../data/resolvers/mutations/conversations';

import {
  INTEGRATION_KIND_CHOICES,
  CONVERSATION_STATUSES,
  FACEBOOK_DATA_KINDS,
  FACEBOOK_POST_TYPES,
} from '../data/constants';

import { graphRequest } from './facebookTracker';

/*
 * Get list of pages that authorized user owns
 * @param {String} accessToken - App access token
 * @return {[Object]} - page list
 */
export const getPageList = async accessToken => {
  const response = await graphRequest.get('/me/accounts?limit=100', accessToken);

  return response.data.map(page => ({
    id: page.id,
    name: page.name,
  }));
};

/*
 * Save webhook response
 * create conversation, customer, message using transmitted data
 *
 * @param {String} userAccessToken - User access token
 * @param {Object} integration - Integration object
 * @param {Object} data - Facebook webhook response
 */

export class SaveWebhookResponse {
  constructor(userAccessToken, integration, data) {
    this.userAccessToken = userAccessToken;

    this.integration = integration;

    // received facebook data
    this.data = data;

    this.currentPageId = null;
  }

  async start() {
    const data = this.data;
    const integration = this.integration;

    if (data.object === 'page') {
      for (let entry of data.entry) {
        // check receiving page is in integration's page list
        if (!integration.facebookData.pageIds.includes(entry.id)) {
          return null;
        }

        // set current page
        this.currentPageId = entry.id;

        if (entry.messaging) {
          await this.viaMessengerEvent(entry);
        }

        // receive new feed
        if (entry.changes) {
          await this.viaFeedEvent(entry);
        }
      }
    }
  }

  /*
  * Via page messenger
  */
  async viaMessengerEvent(entry) {
    for (let messagingEvent of entry.messaging) {
      // someone sent us a message
      if (messagingEvent.message) {
        await this.getOrCreateConversationByMessenger(messagingEvent);
      }
    }
  }

  /*
   * Wall post
   */
  async viaFeedEvent(entry) {
    for (let event of entry.changes) {
      // someone posted on our wall
      await this.getOrCreateConversationByFeed(event.value);
    }
  }

  /*
   * Get page access token
   */
  async getPageAccessToken() {
    // get page access token
    return await graphRequest.get(
      `${this.currentPageId}/?fields=access_token`,
      this.userAccessToken,
    );
  }

  /**
   * Receives feed updates
   * @param {String} post_id - Post id
   * @param {String} video_id - Video id
   * @param {String} link - Video, photo, urls
   * @param {String} photo_id - Photo id
   * @param {Date} created_time - Created date
   * @param {String} item - Feed content types
   * @param {String[]} photos - Photo urls
   *
   * @return {Object} Facebook messenger data
   */
  handlePosts(postParams) {
    const { post_id, video_id, link, photo_id, created_time, item, photos } = postParams;
    const doc = {
      postId: post_id,
      item,
      isPost: true,
      createdAt: created_time,
    };

    // Posted video
    if (video_id && link) {
      doc.video = link;
    }

    // Posted image
    if (photo_id && link) {
      doc.photo = link;
    }

    // Posted multiple image
    if (photos) {
      doc.photos = photos;
    }

    // Shared link
    if (link) {
      doc.link = link;
    }

    return doc;
  }

  /**
   * Receives comment
   * @param {String} conversationMessageId - Conversation message id
   * @param {String} post_id - Post id
   * @param {String} parent_id - Parent post or comment id
   * @param {String} item - Feed content types
   * @param {String} comment_id - Comment id
   * @param {Date} created_time - Created date
   * @param {String} video - Video url
   * @param {String} photo - Photo url
   * @param {Stirng} verb - Action definition
   *
   * @return {Object} Facebook messenger data
   */
  async handleComments(conversationMessageId, commentParams) {
    const {
      post_id,
      parent_id,
      item,
      comment_id,
      created_time,
      video,
      photo,
      verb,
    } = commentParams;

    const doc = {
      postId: post_id,
      item: item,
      commentId: comment_id,
      createdAt: created_time,
    };

    if (video) {
      doc.video = video;
    }

    if (photo) {
      doc.photo = photo;
    }

    if (post_id !== parent_id) {
      doc.parentId = parent_id;
    }

    await this.updateCommentCount(verb, conversationMessageId);

    return doc;
  }

  /**
    * Increase or decrease comment count
    * @param {String} type - Action type
    * @param {String} conversationMessageId - Conversation message id
    *
    * @return {Promise} Updated conversation message
    */
  async updateCommentCount(type, conversationMessageId) {
    let count = -1;

    if (type === 'add') {
      count = 1;
    }

    return await ConversationMessages.update(
      { _id: conversationMessageId },
      { $inc: { 'facebookData.commentCount': count } },
    );
  }

  /**
   * Increase or decrease like count
   * @param {String} type - Action type
   * @param {String} conversationMessageId - Conversation message id
   *
   * @return {Promise} Updated conversation message
   */
  async updateLikeCount(type, conversationMessageId) {
    let count = -1;

    if (type === 'add') {
      count = 1;
    }

    return await ConversationMessages.update(
      { _id: conversationMessageId },
      { $inc: { 'facebookData.likeCount': count } },
    );
  }

  /**
   * Updates reaction
   * @param {String} type - Action type
   * @param {String} conversationMessageId - Conversation message id
   * @param {String} reactionType - Reaction Type
   * @param {String} from - Facebook user who performed action
   *
   * @return {Promise} Updated conversation message
   */
  async updateReactions(type, conversationMessageId, reactionType, from) {
    const reactionField = `facebookData.reactions.${reactionType}`;

    if (type === 'add') {
      return ConversationMessages.update(
        { _id: conversationMessageId },
        { $push: { [reactionField]: from } },
      );
    }

    return ConversationMessages.update(
      { _id: conversationMessageId },
      { $pull: { [reactionField]: { id: from.id } } },
    );
  }

  /**
   * Receives like and reaction
   * @param {String} verb - Add or remove action of reaction or like
   * @param {String} post_id - Post id
   * @param {String} comment_id - Comment id
   * @param {String} reaction_type - Reaction type
   * @param {String} item - Feed content types
   * @param {Object} from - Facebook user who performed action
   *
   * @return {Promise} Updated conversation message
   */
  async handleReactions(likeParams) {
    const { verb, post_id, comment_id, reaction_type, item, from } = likeParams;
    let selector = { 'facebookData.postId': post_id };

    if (comment_id) {
      selector = { 'facebookData.commentId': comment_id };
    }

    const msg = await ConversationMessages.findOne(selector);
    if (msg) {
      // Receiving like
      if (item === 'like') {
        await this.updateLikeCount(verb, msg._id);
      }

      // Receiving reaction
      if (item === 'reaction') {
        await this.updateReactions(verb, msg._id, reaction_type, from);
      }
    }
  }

  /*
   * Common get or create conversation helper using both in messenger and feed
   * @param {Object} params - Parameters doc
   * @return newly create message object
   */
  async getOrCreateConversation(params) {
    // extract params
    const {
      findSelector,
      status,
      senderId,
      facebookData,
      content,
      attachments,
      msgFacebookData,
    } = params;

    let conversation = await Conversations.findOne({
      ...findSelector,
    }).sort({ createdAt: -1 });

    // We are closing our own posts automatically below. So to prevent
    // from creation of new conversation for every comment we are checking
    // both message count & conversation status to new conversation.
    // And we are creating new conversations only if previous conversation has
    // at least 2 messages and has closed status.
    if (
      !conversation ||
      (conversation.messageCount > 1 && conversation.status === CONVERSATION_STATUSES.CLOSED)
    ) {
      conversation = await Conversations.createConversation({
        integrationId: this.integration._id,
        customerId: await this.getOrCreateCustomer(senderId),
        status,
        content,

        // save facebook infos
        facebookData: {
          ...facebookData,
          pageId: this.currentPageId,
        },
      });
    } else {
      conversation = await Conversations.reopen(conversation._id);
    }

    // create new message
    return this.createMessage({
      conversation,
      userId: senderId,
      content,
      attachments,
      facebookData: msgFacebookData,
    });
  }

  /*
   * Get or create new conversation by feed info
   * @param {Object} value - Webhook response item
   */
  async getOrCreateConversationByFeed(value) {
    const { item, comment_id } = value;

    let msgFacebookData = {};

    // sending to comment handler if comment
    if (item === 'comment' && comment_id) {
      const conversationMessage = await ConversationMessages.findOne({
        'facebookData.commentId': comment_id,
      });

      if (conversationMessage) {
        return null;
      }

      msgFacebookData = await this.handleComments(conversationMessage._id, value);
    }

    // sending to post handler if post
    if (FACEBOOK_POST_TYPES.includes(item)) {
      msgFacebookData = this.handlePosts(value);
    }

    // sending to reaction handler
    if (item === 'like' || item === 'reaction') {
      return this.handleReactions(value);
    }

    const senderName = value.from.name;

    // sender_id is giving number values when feed and giving string value
    // when messenger. customer.facebookData.senderId has type of string so
    // convert it to string
    const senderId = value.from.id.toString();

    let messageText = value.message;

    // when photo, video share, there will be no text, so link instead
    if (!messageText && value.link) {
      messageText = value.link;
    }

    // when situations like checkin, there will be no text and no link
    // if so ignore it
    if (!messageText) {
      return null;
    }

    // value.post_id is returning different value even though same post
    // with the previous one. So fetch post info via graph api and
    // save returned value. This value will always be the same
    let postId = value.post_id;

    let response = await this.getPageAccessToken();

    // acess token expired
    if (response === 'Error processing https request') {
      return null;
    }

    // get post object
    response = await graphRequest.get(postId, response.access_token);

    postId = response.id;

    let status = CONVERSATION_STATUSES.NEW;

    // if we are posting from our page, close it automatically
    if (this.integration.facebookData.pageIds.includes(senderId)) {
      status = CONVERSATION_STATUSES.CLOSED;
    }

    await this.getOrCreateConversation({
      findSelector: {
        'facebookData.kind': FACEBOOK_DATA_KINDS.FEED,
        'facebookData.postId': postId,
      },
      status,
      senderId,
      facebookData: {
        kind: FACEBOOK_DATA_KINDS.FEED,
        senderId,
        senderName,
        postId,
      },

      // message data
      content: messageText,
      msgFacebookData: {
        senderId,
        senderName,
        ...msgFacebookData,
      },
    });
  }

  /*
   * Get or create new conversation by page messenger
   * @param {Object} event - Webhook response item
   * @return Newly created message object
   */
  async getOrCreateConversationByMessenger(event) {
    const senderId = event.sender.id;
    const senderName = event.sender.name;
    const recipientId = event.recipient.id;
    const messageId = event.message.mid;
    const messageText = event.message.text || 'attachment';

    // collect attachment's url, type fields
    const attachments = (event.message.attachments || []).map(attachment => ({
      type: attachment.type,
      url: attachment.payload ? attachment.payload.url : '',
    }));

    // if this is already saved then ignore it
    if (await ConversationMessages.findOne({ 'facebookData.messageId': messageId })) {
      return null;
    }

    await this.getOrCreateConversation({
      // try to find conversation by senderId, recipientId keys
      findSelector: {
        'facebookData.kind': FACEBOOK_DATA_KINDS.MESSENGER,
        $or: [
          {
            'facebookData.senderId': senderId,
            'facebookData.recipientId': recipientId,
          },
          {
            'facebookData.senderId': recipientId,
            'facebookData.recipientId': senderId,
          },
        ],
      },
      status: CONVERSATION_STATUSES.NEW,
      senderId,
      facebookData: {
        kind: FACEBOOK_DATA_KINDS.MESSENGER,
        senderId,
        senderName,
        recipientId,
      },

      // message data
      content: messageText,
      attachments,
      msgFacebookData: {
        messageId,
      },
    });
  }

  /*
   * Get or create customer using facebook data
   * @param {String} fbUserId - Facebook user id
   * @return Previous or newly created customer object
   */
  async getOrCreateCustomer(fbUserId) {
    const integrationId = this.integration._id;

    const customer = await Customers.findOne({ 'facebookData.id': fbUserId });

    if (customer) {
      return customer._id;
    }

    // get page access token
    let res = await this.getPageAccessToken();

    // get user info
    res = await graphRequest.get(`/${fbUserId}?fields=link`, res.access_token);

    // get profile pic
    const getProfilePic = async fbId => {
      try {
        const response = await graphRequest.get(`/${fbId}/picture?height=600`);
        return response.image ? response.location : '';
      } catch (e) {
        return null;
      }
    };

    // when feed response will contain name field
    // when messeger response will not contain name field
    const firstName = res.first_name || res.name;
    const lastName = res.last_name || '';

    // create customer
    const createdCustomer = await Customers.createCustomer({
      firstName,
      lastName,
      integrationId,
      facebookData: {
        id: fbUserId,
        profilePic: res.profile_pic || (await getProfilePic(fbUserId)),
        profileLink: res.link,
      },
    });

    // create log
    await ActivityLogs.createCustomerRegistrationLog(createdCustomer);

    return createdCustomer;
  }

  /*
   * Create new message
   */
  async createMessage({ conversation, userId, content, attachments, facebookData }) {
    if (conversation) {
      // create new message
      const messageId = await ConversationMessages.createMessage({
        conversationId: conversation._id,
        customerId: await this.getOrCreateCustomer(userId),
        content,
        attachments,
        facebookData,
        internal: false,
      });

      // updating conversation content
      await Conversations.update({ _id: conversation._id }, { $set: { content } });

      // notify subscription server new message
      const message = await ConversationMessages.findOne({ _id: messageId });

      publishMessage(message);

      return messageId;
    }
  }
}

/*
 * Receive per app webhook response
 * @param {Object} app - Apps configuration item from .env
 * @param {Object} data - Webhook response
 */
export const receiveWebhookResponse = async (app, data) => {
  const selector = {
    kind: INTEGRATION_KIND_CHOICES.FACEBOOK,
    'facebookData.appId': app.id,
  };

  const integrations = await Integrations.find(selector);

  for (let integration of integrations) {
    // when new message or other kind of activity in page
    const saveWebhookResponse = new SaveWebhookResponse(app.accessToken, integration, data);

    await saveWebhookResponse.start();
  }
};

/**
 * Post reply to page conversation or comment to wall post
 * @param {Object} conversation - Conversation object
 * @param {String} msg - Reply content
 * @param {String} msg.text - Reply content text
 * @param {String} msg.attachment - Reply content attachment
 * @param {String} msg.commentId - Parent commen id if replied to comment
 * @param {String} messageId - Conversation message id
 */
export const facebookReply = async (conversation, msg, messageId) => {
  const FACEBOOK_APPS = getConfig();
  const { attachment, commentId, text } = msg;
  const msgObj = { message: text };

  const integration = await Integrations.findOne({
    _id: conversation.integrationId,
  });

  const app = FACEBOOK_APPS.find(a => a.id === integration.facebookData.appId);

  // page access token
  const response = await graphRequest.get(
    `${conversation.facebookData.pageId}/?fields=access_token`,
    app.accessToken,
  );

  // messenger reply
  if (conversation.facebookData.kind === FACEBOOK_DATA_KINDS.MESSENGER) {
    if (attachment) {
      msgObj.source = attachment.url;
    }

    await graphRequest
      .post('me/messages', response.access_token, {
        recipient: { id: conversation.facebookData.senderId },
        ...msgObj,
      })
      .then(async res => {
        // save commentId in message object
        await ConversationMessages.update(
          { _id: messageId },
          { $set: { 'facebookData.messageId': res.message_id } },
        );
      })
      .catch(e => {
        return e.message;
      });
  }

  // feed reply
  if (conversation.facebookData.kind === FACEBOOK_DATA_KINDS.FEED) {
    // Post id
    let id = conversation.facebookData.postId;

    // Attaching attachment url
    if (attachment) {
      msgObj.attachment_url = attachment.url;
    }

    // Reply to comment
    if (commentId) {
      id = commentId;
    }

    // post reply
    await graphRequest
      .post(`${id}/comments`, response.access_token, {
        message: text,
      })
      .then(async res => {
        // save commentId in message object
        await ConversationMessages.update(
          { _id: messageId },
          { $set: { 'facebookData.commentId': res.id } },
        );
      })
      .catch(e => {
        return e.message;
      });
  }

  return null;
};

/*
 * Like
 */
export const like = async ({ id, type }) => {
  let response = await this.getPageAccessToken();

  // liking post or comment
  return await graphRequest.post(`${id}/reactions`, response.access_token, {
    type,
  });
};

export const getConfig = () => {
  const { FACEBOOK } = process.env;

  return JSON.parse(FACEBOOK);
};
