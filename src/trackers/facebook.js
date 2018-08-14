import {
  ActivityLogs,
  Integrations,
  Conversations,
  ConversationMessages,
  Customers,
} from '../db/models';

import { publishClientMessage, publishMessage } from '../data/resolvers/mutations/conversations';

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
  getPageAccessToken() {
    // get page access token
    return graphRequest.get(`${this.currentPageId}/?fields=access_token`, this.userAccessToken);
  }

  /**
   * Receives feed updates
   * @param {String} post_id - Post id
   * @param {String} video_id - Video id
   * @param {String} link - Video, photo, urls
   * @param {String} photo_id - Photo id
   * @param {String} item - Feed content types
   * @param {String[]} photos - Photo urls
   *
   * @return {Object} Facebook messenger data
   */
  handlePosts(postParams) {
    const { post_id, video_id, link, photo_id, item, photos } = postParams;

    const doc = {
      postId: post_id,
      item,
      isPost: true,
    };

    if (link) {
      // Posted video
      if (video_id) {
        doc.video = link;

        // Posted photo
      } else if (photo_id) {
        doc.photo = link;
      } else {
        doc.link = link;
      }
    }

    // Posted multiple image
    if (photos) {
      doc.photos = photos;
    }

    return doc;
  }

  /**
   * Receives comment
   * @param {String} post_id - Post id
   * @param {String} parent_id - Parent post or comment id
   * @param {String} item - Feed content types
   * @param {String} comment_id - Comment id
   * @param {String} video - Video url
   * @param {String} photo - Photo url
   * @param {Stirng} verb - Action definition
   *
   * @return {Object} Facebook messenger data
   */
  async handleComments(commentParams) {
    const { photo, video, post_id, parent_id, item, comment_id, verb } = commentParams;

    const doc = {
      postId: post_id,
      item: item,
      commentId: comment_id,
    };

    if (post_id !== parent_id) {
      doc.parentId = parent_id;
    }

    if (photo) {
      doc.photo = photo;
    }

    if (video) {
      doc.video = video;
    }

    // Counting post comments only
    await this.updateCommentCount(verb, post_id);

    return doc;
  }

  /**
    * Increase or decrease comment count
    * @param {String} type - Action type
    * @param {String} conversationMessageId - Conversation message id
    *
    * @return {Promise} Updated conversation message
    */
  async updateCommentCount(type, post_id) {
    let count = -1;

    if (type === 'add') {
      count = 1;
    }

    return await ConversationMessages.update(
      { 'facebookData.postId': post_id },
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
  async updateLikeCount(type, selector) {
    let count = -1;

    if (type === 'add') {
      count = 1;
    }

    return await ConversationMessages.update(selector, {
      $inc: { 'facebookData.likeCount': count },
    });
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
  async updateReactions(type, selector, reactionType, from) {
    const reactionField = `facebookData.reactions.${reactionType}`;

    if (type === 'add') {
      return ConversationMessages.update(selector, { $push: { [reactionField]: from } });
    }

    return ConversationMessages.update(selector, { $pull: { [reactionField]: { id: from.id } } });
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
    let selector = {};

    if (post_id) {
      selector = { 'facebookData.postId': post_id };
    }

    if (comment_id) {
      selector = { 'facebookData.commentId': comment_id };
    }

    // Receiving like
    if (item === 'like') {
      await this.updateLikeCount(verb, selector);
    }

    // Receiving reaction
    if (item === 'reaction') {
      await this.updateReactions(verb, selector, reaction_type, from);
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
      const customerId = await this.getOrCreateCustomer(senderId);
      const customer = await Customers.findOne({ _id: customerId });

      conversation = await Conversations.createConversation({
        integrationId: this.integration._id,
        customerId: customerId,
        status,
        content,

        // save facebook infos
        facebookData: {
          ...facebookData,
          pageId: this.currentPageId,
        },
      });

      // Creating conversation created activity log for customer
      await ActivityLogs.createConversationLog(conversation, customer);
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
    const { item, comment_id, verb } = value;

    // collect only added actions
    if (verb !== 'add') {
      return null;
    }

    let msgFacebookData = {};

    // sending to comment handler if comment
    if (item === 'comment' && comment_id) {
      // if already saved then ignore it
      const conversationMessage = await ConversationMessages.findOne({
        'facebookData.commentId': comment_id,
      });

      if (conversationMessage) {
        return null;
      }

      msgFacebookData = await this.handleComments(value);
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

    let messageText = value.message || '...';

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
    const messageText = event.message.text || '...';

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

  /**
   * Get or create customer using facebook data
   * @param {String} fbUserId - Facebook user id
   *
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
    res = await graphRequest.get(`/${fbUserId}`, res.access_token);

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
      avatar: (await getProfilePic(fbUserId)) || '',
      facebookData: {
        id: fbUserId,
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
      const message = await ConversationMessages.createMessage({
        conversationId: conversation._id,
        customerId: await this.getOrCreateCustomer(userId),
        content,
        attachments,
        facebookData,
        internal: false,
      });

      // updating conversation content
      await Conversations.update({ _id: conversation._id }, { $set: { content } });

      // notifying conversation inserted
      publishClientMessage(message);

      // notify subscription server new message
      publishMessage(message, conversation.customerId);

      return message._id;
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
 * @param {String} message - Conversation message
 */
export const facebookReply = async (conversation, msg, message) => {
  const FACEBOOK_APPS = getConfig();
  const { attachment, commentId, text } = msg;
  const msgObj = {};

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
    msgObj.message = {};

    if (text) {
      msgObj.message = { text };
    }

    if (attachment) {
      msgObj.message = {
        attachment: {
          type: 'file',
          payload: {
            url: attachment.url,
          },
        },
      };
    }

    const res = await graphRequest.post('me/messages', response.access_token, {
      recipient: { id: conversation.facebookData.senderId },
      ...msgObj,
    });

    // save commentId in message object
    await ConversationMessages.update(
      { _id: message._id },
      { $set: { 'facebookData.messageId': res.message_id } },
    );
  }

  // feed reply
  if (conversation.facebookData.kind === FACEBOOK_DATA_KINDS.FEED) {
    // Post id
    let id = conversation.facebookData.postId;

    // Reply to comment
    if (commentId) {
      id = commentId;
    }

    if (text) {
      msgObj.message = text;
    }

    // Attaching attachment url
    if (attachment) {
      msgObj.attachment_url = attachment.url;
    }

    // post reply
    const res = await graphRequest.post(`${id}/comments`, response.access_token, {
      ...msgObj,
    });

    const facebookData = {
      commentId: res.id,
    };

    if (commentId) {
      facebookData.parentId = commentId;
    }

    if (attachment) {
      facebookData.link = attachment.url;
    }

    // save commentId and parentId in message object
    await ConversationMessages.update({ _id: message._id }, { $set: { facebookData } });

    // finding parent post and increasing comment count
    await ConversationMessages.update(
      {
        'facebookData.isPost': true,
        conversationId: message.conversationId,
      },
      { $inc: { 'facebookData.commentCount': 1 } },
    );
  }

  return null;
};

export const getConfig = () => {
  const { FACEBOOK } = process.env;

  return JSON.parse(FACEBOOK);
};
