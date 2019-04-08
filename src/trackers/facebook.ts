import { Accounts, ConversationMessages, Conversations, Customers, Integrations } from '../db/models';

import { publishClientMessage, publishMessage } from '../data/resolvers/mutations/conversations';

import {
  CONVERSATION_STATUSES,
  FACEBOOK_DATA_KINDS,
  FACEBOOK_POST_TYPES,
  INTEGRATION_KIND_CHOICES,
} from '../data/constants';

import { getEnv } from '../data/utils';
import { IFacebook as IMsgFacebook, IFbUser, IMessageDocument } from '../db/models/definitions/conversationMessages';
import { IConversationDocument, IFacebook } from '../db/models/definitions/conversations';
import { ICustomerDocument } from '../db/models/definitions/customers';
import { IIntegrationDocument } from '../db/models/definitions/integrations';
import { findPostComments, graphRequest, IComments, IPost } from './facebookTracker';

interface IPostParams {
  created_time?: number;
  post_id?: string;
  video_id?: string;
  link?: string;
  photo_id?: string;
  item?: string;
  photos?: string[];

  caption?: string;
  id: string;
  description?: string;
  picture?: string;
  source?: string;
  message?: string;
  from: IFbUser;
  comments?: IComments;
}

interface ICommentParams {
  post_id: string;
  created_time?: number;
  parent_id?: string;
  item?: string;
  comment_id?: string;
  video?: string;
  photo?: string;
  verb: string;
}

interface IReactionParams {
  verb: string;
  post_id?: string;
  comment_id?: string;
  reaction_type?: string;
  item: string;
  from: IFbUser;
}

export interface IFacebookReply {
  text?: string;
  attachment?: any;
  commentId?: string;
}

interface IGetOrCreateConversationParams {
  findSelector: any;
  status: string;
  facebookData: IFacebook;
  content: string;
  attachments?: any;
  msgFacebookData: IMsgFacebook;
}

/*
 * Get list of pages that authorized user owns
 */
export const getPageList = async (accessToken?: string) => {
  const response: any = await graphRequest.get('/me/accounts?limit=100', accessToken);

  return response.data.map(page => ({
    id: page.id,
    name: page.name,
  }));
};

/*
 * Save webhook response
 * create conversation, customer, message using transmitted data
 */

export class SaveWebhookResponse {
  public currentPageId?: string | null;
  public data: any;
  private userAccessToken: string;
  private integration: IIntegrationDocument;

  constructor(userAccessToken: string, integration: IIntegrationDocument, data?: any) {
    this.userAccessToken = userAccessToken;

    this.integration = integration;

    // received facebook data
    this.data = data;

    this.currentPageId = null;
  }

  public async start() {
    const data = this.data;
    const integration = this.integration;

    if (!integration.facebookData) {
      throw new Error("start: Integration doesn't have facebookData");
    }

    if (data.object === 'page') {
      for (const entry of data.entry) {
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
  public async viaMessengerEvent(entry) {
    for (const messagingEvent of entry.messaging) {
      // someone sent us a message
      if (messagingEvent.message) {
        await this.getOrCreateConversationByMessenger(messagingEvent);
      }
    }
  }

  /*
   * Wall post
   */
  public async viaFeedEvent(entry) {
    for (const event of entry.changes) {
      // someone posted on our wall
      await this.getOrCreateConversationByFeed(event.value);
    }
  }

  /*
   * Get page access token
   */
  public getPageAccessToken() {
    // get page access token
    return graphRequest.get(`${this.currentPageId}/?fields=access_token`, this.userAccessToken);
  }

  /**
   * Receives feed updates
   */
  public handlePosts(postParams: IPostParams) {
    const { post_id, video_id, link, photo_id, item, photos, created_time } = postParams;

    const doc: IMsgFacebook = {
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

    if (created_time) {
      doc.createdTime = (created_time * 1000).toString();
    }

    return doc;
  }

  /**
   * Receives comment
   */
  public async handleComments(commentParams: ICommentParams) {
    const { photo, video, post_id, parent_id, item, comment_id, verb, created_time } = commentParams;

    const doc: IMsgFacebook = {
      postId: post_id,
      item,
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

    if (created_time) {
      doc.createdTime = (created_time * 1000).toString();
    }

    // Counting post comments only
    await this.updateCommentCount(verb, post_id);

    return doc;
  }

  /**
   * Increase or decrease comment count
   */
  public async updateCommentCount(type: string, postId: string) {
    let count = -1;

    if (type === 'add') {
      count = 1;
    }

    return ConversationMessages.updateOne(
      { 'facebookData.postId': postId },
      { $inc: { 'facebookData.commentCount': count } },
    );
  }

  /**
   * Increase or decrease like count
   */
  public async updateLikeCount(type: string, selector: any) {
    let count = -1;

    if (type === 'add') {
      count = 1;
    }

    return ConversationMessages.updateMany(selector, {
      $inc: { 'facebookData.likeCount': count },
    });
  }

  /**
   * Updates reaction
   */
  public async updateReactions(type: string, selector: any, reactionType: string, from: IFbUser) {
    const reactionField = `facebookData.reactions.${reactionType}`;

    if (type === 'add') {
      return ConversationMessages.updateMany(selector, {
        $push: { [reactionField]: from },
      });
    }

    return ConversationMessages.updateMany(selector, {
      $pull: { [reactionField]: { id: from.id } },
    });
  }

  /**
   * Receives like and reaction
   */
  public async handleReactions(reactionParams: IReactionParams) {
    const { verb, post_id, comment_id, reaction_type, item, from } = reactionParams;
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
      await this.updateReactions(verb, selector, reaction_type || 'like', from);
    }
  }

  /*
   * Common get or create conversation helper using both in messenger and feed
   */
  public async getOrCreateConversation(params: IGetOrCreateConversationParams): Promise<string> {
    // extract params
    const { findSelector, status, facebookData, content, attachments, msgFacebookData } = params;
    const { senderId, senderName } = facebookData;

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
      (conversation.messageCount &&
        (conversation.messageCount > 1 && conversation.status === CONVERSATION_STATUSES.CLOSED))
    ) {
      const customer = await this.getOrCreateCustomer(senderId, senderName);

      if (!customer) {
        throw new Error("getOrCreateConversation: Couldn't create customer");
      }

      if (!this.currentPageId) {
        throw new Error("getOrCreateConversation: Couldn't set current page id");
      }

      conversation = await Conversations.createConversation({
        integrationId: this.integration._id,
        customerId: customer._id,
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

    // Restoring deleted facebook converation's data
    const restored = await this.restoreOldPosts({
      conversation,
      facebookData: msgFacebookData,
    });

    if (restored) {
      publishMessage(restored);

      publishClientMessage(restored);

      return 'restored';
    }

    // create new message
    const msg = await this.createMessage({
      conversation,
      content,
      attachments,
      facebookData: msgFacebookData,
    });

    return msg._id;
  }

  /*
   * Get or create new conversation by feed info
   * @param {Object} value - Webhook response item
   */
  public async getOrCreateConversationByFeed(value) {
    if (!this.integration.facebookData) {
      throw new Error('getOrCreateConversationByFeed: Integration doesnt have facebookData');
    }

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

    const messageText = value.message || '...';

    // value.post_id is returning different value even though same post
    // with the previous one. So fetch post info via graph api and
    // save returned value. This value will always be the same
    let postId = value.post_id;

    let response: any = await this.getPageAccessToken();

    // access token expired
    if (response === 'Error processing https request') {
      throw new Error("getOrCreateConversationByFeed: Couldn't get Page access token");
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
   */
  public async getOrCreateConversationByMessenger(event) {
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
    if (
      await ConversationMessages.findOne({
        'facebookData.messageId': messageId,
      })
    ) {
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
        senderId,
        senderName,
        messageId,
      },
    });
  }

  /**
   * Get or create customer using facebook data
   */
  public async getOrCreateCustomer(fbUserId?: string, fbUserName?: string): Promise<ICustomerDocument | null> {
    if (!fbUserId) {
      return null;
    }

    const integrationId = this.integration._id;

    const customer = await Customers.findOne({ 'facebookData.id': fbUserId });

    if (customer) {
      return customer;
    }

    let avatar;

    if (!fbUserName) {
      const pageTokenResponse = await this.getPageAccessToken();
      const pageToken = pageTokenResponse.access_token;

      const fbUserResponse = await graphRequest.get(`/${fbUserId}`, pageToken);

      fbUserName = `${fbUserResponse.first_name} ${fbUserResponse.last_name}`;

      avatar = fbUserResponse.profile_pic;
    }

    // get profile pic
    const getProfilePic = async (fbId: string) => {
      try {
        const response: any = await graphRequest.get(`/${fbId}/picture?height=600`);
        return response.image ? response.location : '';
      } catch (e) {
        return null;
      }
    };

    // when feed response will contain name field
    // when messeger response will not contain name field
    const firstName = fbUserName || 'N/A';

    // create customer
    const createdCustomer = await Customers.createCustomer({
      firstName,
      integrationId,
      avatar: avatar ? avatar : (await getProfilePic(fbUserId)) || '',
      facebookData: {
        id: fbUserId,
      },
    });

    return createdCustomer;
  }

  /*
   * Create new message
   */
  public async createMessage({
    conversation,
    content,
    attachments,
    facebookData,
    restoring,
  }: {
    conversation: IConversationDocument;
    content: string;
    attachments?: any;
    facebookData: IMsgFacebook;
    restoring?: boolean;
  }): Promise<IMessageDocument> {
    if (!conversation) {
      throw new Error('createMessage: Conversation not found');
    }

    const { senderId, senderName } = facebookData;

    const customer = await this.getOrCreateCustomer(senderId, senderName);

    if (!customer) {
      throw new Error("createMessage: Couldn't create customer");
    }

    // create new message
    const message = await ConversationMessages.createMessage({
      conversationId: conversation._id,
      customerId: customer._id,
      content,
      attachments,
      facebookData,
      internal: false,
    });

    // updating conversation content
    await Conversations.updateOne({ _id: conversation._id }, { $set: { content } });

    if (restoring) {
      return message;
    }

    // notifying conversation inserted
    publishClientMessage(message);

    // notify subscription server new message
    publishMessage(message, conversation.customerId);

    return message;
  }

  /**
   * Restore deleted facebook converation's data
   */
  public async restoreOldPosts({
    conversation,
    facebookData,
  }: {
    conversation: IConversationDocument;
    facebookData: IMsgFacebook;
  }): Promise<null | IMessageDocument> {
    const { item, postId } = facebookData;

    if (!postId) {
      return null;
    }

    if (item !== 'comment') {
      return null;
    }

    const parentPost = await ConversationMessages.findOne({
      conversationId: conversation._id,
      'facebookData.isPost': true,
      'facebookData.postId': postId,
    });

    if (parentPost) {
      return null;
    }

    // getting page access token
    const accessTokenResponse: any = await this.getPageAccessToken();
    const accessToken = accessTokenResponse.access_token;

    // creating parent post if comment has no parent
    // get post info
    const fields = `/${postId}?fields=caption,description,link,picture,source,message,from,created_time,comments.summary(true)`;
    const postResponse: IPost = await graphRequest.get(fields, accessToken);

    const postParams = await this.handlePosts({
      ...postResponse,
      item: 'status',
      post_id: postResponse.id,
    });

    const post = await this.createMessage({
      conversation,
      content: postResponse.message || '...',
      facebookData: {
        senderId: postResponse.from.id,
        senderName: postResponse.from.name,
        commentCount: postResponse.comments.summary.total_count,
        ...postParams,
      },
      restoring: true,
    });

    // getting all the comments of post
    const postComments = await findPostComments(accessToken, postId, []);

    // creating conversation message for each comment
    for (const comment of postComments) {
      await this.createMessage({
        conversation,
        content: comment.message,
        facebookData: {
          postId: postResponse.id,
          commentId: comment.id,
          item: 'comment',
          senderId: comment.from.id,
          senderName: comment.from.name,
          parentId: comment.parent && comment.parent.id,
          createdTime: (comment.created_time || 0 * 1000).toString(),
          commentCount: comment.comments.summary.total_count,
        },
        restoring: true,
      });
    }

    return post;
  }
}

/*
 * Receive per app webhook response
 */
export const receiveWebhookResponse = async data => {
  const integrations = await Integrations.find({
    kind: INTEGRATION_KIND_CHOICES.FACEBOOK,
    'facebookData.accountId': { $exists: true },
  });

  for (const integration of integrations) {
    const { facebookData } = integration;

    if (!facebookData) {
      throw new Error('Could not find integrations facebookData');
    }

    const account = await Accounts.findOne({ _id: facebookData.accountId });

    if (!account) {
      throw new Error('Could not find account');
    }

    // when new message or other kind of activity in page
    const saveWebhookResponse = new SaveWebhookResponse(account.token, integration, data);

    await saveWebhookResponse.start();
  }
};

/**
 * Post reply to page conversation or comment to wall post
 */
export const facebookReply = async (
  conversation: IConversationDocument,
  msg: IFacebookReply,
  message: IMessageDocument,
) => {
  const { attachment, commentId, text } = msg;
  const msgObj: any = {};

  const integration = await Integrations.findOne({
    _id: conversation.integrationId,
  });

  if (!integration || !integration.facebookData) {
    throw new Error('facebookReply: Integration not found');
  }

  if (!conversation.facebookData) {
    throw new Error("facebookReply: Conversation doesn't have facebookData");
  }

  const account = await Accounts.findOne({ _id: integration.facebookData.accountId });

  if (!account) {
    throw new Error('facebookReply: Account not found');
  }

  // page access token
  const response: any = await graphRequest.get(
    `${conversation.facebookData.pageId}/?fields=access_token`,
    account.token,
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

    const res: any = await graphRequest.post('me/messages', response.access_token, {
      recipient: { id: conversation.facebookData.senderId },
      ...msgObj,
    });

    // save commentId in message object
    await ConversationMessages.updateOne({ _id: message._id }, { $set: { 'facebookData.messageId': res.message_id } });
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
    const res: any = await graphRequest.post(`${id}/comments`, response.access_token, {
      ...msgObj,
    });

    const facebookData: IMsgFacebook = {
      commentId: res.id,
    };

    if (commentId) {
      facebookData.parentId = commentId;
    }

    if (attachment) {
      facebookData.link = attachment.url;
    }

    // save commentId and parentId in message object
    await ConversationMessages.updateOne({ _id: message._id }, { $set: { facebookData } });
  }
};

export const getConfig = () => {
  const FACEBOOK = getEnv({ name: 'FACEBOOK' });

  if (!FACEBOOK) {
    throw new Error("getConfig: Couldn't get facebook config");
  }

  return JSON.parse(FACEBOOK);
};
