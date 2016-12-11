import graph from 'fbgraph';
import { Picker } from 'meteor/meteorhacks:picker';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Conversations } from '/imports/api/conversations/conversations';
import { Messages } from '/imports/api/conversations/messages';
import { Customers } from '/imports/api/customers/customers';
import { Integrations } from '/imports/api/integrations/integrations';
import { KIND_CHOICES } from '/imports/api/integrations/constants';
import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';
import { FACEBOOK_DATA_KINDS } from '/imports/api/conversations/constants';

/*
 * Common graph api request wrapper
 * catchs auth token or other type of exceptions
 */
export const graphRequest = {
  base(method, path, accessToken, ...otherParams) {
    // set access token
    graph.setAccessToken(accessToken);

    const wrappedGraph = Meteor.wrapAsync(graph[method], graph);

    try {
      return wrappedGraph(path, ...otherParams);

    // catch session expired or some other error
    } catch (e) {
      throw new Error(e.message);
    }
  },

  get(...args) {
    return this.base('get', ...args);
  },

  post(...args) {
    return this.base('post', ...args);
  },
};

/*
 * get list of pages that authorized user owns
 */
export const getPageList = (accessToken) => {
  const response = graphRequest.get('/me/accounts?limit=100', accessToken);

  const pages = [];

  // collect only some fields
  _.each(response.data, (page) => {
    pages.push({
      id: page.id,
      name: page.name,
    });
  });

  return pages;
};

/*
 * save webhook response
 * create conversation, customer, message using transmitted data
 */

export class SaveWebhookResponse {
  constructor(userAccessToken, integration, data) {
    this.userAccessToken = userAccessToken;

    this.integration = integration;

    // received facebook data
    this.data = data;

    this.currentPageId = null;
  }

  start() {
    const data = this.data;
    const integration = this.integration;

    if (data.object === 'page') {
      _.each(data.entry, (entry) => {
        // check receiving page is in integration's page list
        if (!integration.facebookData.pageIds.includes(entry.id)) {
          return;
        }

        // set current page
        this.currentPageId = entry.id;

        // receive new messenger message
        if (entry.messaging) {
          this.viaMessengerEvent(entry);
        }

        // receive new feed
        if (entry.changes) {
          this.viaFeedEvent(entry);
        }
      });
    }
  }

  // via page messenger
  viaMessengerEvent(entry) {
    _.each(entry.messaging, (messagingEvent) => {
      // someone sent us a message
      if (messagingEvent.message) {
        this.getOrCreateConversationByMessenger(messagingEvent);
      }
    });
  }

  // wall post
  viaFeedEvent(entry) {
    _.each(entry.changes, (event) => {
      // someone posted on our wall
      this.getOrCreateConversationByFeed(event.value);
    });
  }

  // common get or create conversation helper using both in messenger and feed
  getOrCreateConversation(findSelector, senderId, content, facebookData) {
    let conversation = Conversations.findOne({
      ...findSelector,
      status: { $ne: CONVERSATION_STATUSES.CLOSED },
    });

    // create new conversation
    if (!conversation) {
      const conversationId = Conversations.insert({
        integrationId: this.integration._id,
        customerId: this.getOrCreateCustomer(senderId),
        status: CONVERSATION_STATUSES.NEW,
        content,

        // save facebook infos
        facebookData: {
          ...facebookData,
          pageId: this.currentPageId,
        },
      });
      conversation = Conversations.findOne(conversationId);

    // reset read history
    } else {
      Conversations.update(
        { _id: conversation._id },
        { $set: { readUserIds: [] } }
      );
    }

    // create new message
    this.createMessage(conversation, content, senderId);
  }

  // get or create new conversation by feed info
  getOrCreateConversationByFeed(value) {
    const commentId = value.comment_id;

    // if this is already saved then ignore it
    if (commentId && Messages.findOne({ facebookCommentId: commentId })) {
      return;
    }

    const senderId = value.sender_id;
    const messageText = value.message;

    // value.post_id is returning different value even though same post
    // with the previous one. So fetch post info via graph api and
    // save returned value. This value will always be the same
    let postId = value.post_id;

    // get page access token
    let response = graphRequest.get(
      `${this.currentPageId}/?fields=access_token`,
      this.userAccessToken
    );

    // get post object
    response = graphRequest.get(postId, response.access_token);

    postId = response.id;

    this.getOrCreateConversation(
      {
        'facebookData.kind': FACEBOOK_DATA_KINDS.FEED,
        'facebookData.postId': postId,
      },
      senderId,
      messageText,
      // facebookData
      {
        kind: FACEBOOK_DATA_KINDS.FEED,
        senderId,
        postId,
      }
    );
  }

  // get or create new conversation by page messenger
  getOrCreateConversationByMessenger(event) {
    const senderId = event.sender.id;
    const recipientId = event.recipient.id;
    const messageText = event.message.text;

    this.getOrCreateConversation(
      // try to find conversation by senderId, recipientId keys
      {
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
      senderId,
      messageText,
      // facebookData
      {
        kind: FACEBOOK_DATA_KINDS.MESSENGER,
        senderId,
        recipientId,
      }
    );
  }

  // get or create customer using facebook data
  getOrCreateCustomer(fbUserId) {
    const integrationId = this.integration._id;

    const customer = Customers.findOne({
      integrationId,
      'facebookData.id': fbUserId,
    });

    if (customer) {
      return customer._id;
    }

    // get page access token
    let res = graphRequest.get(
      `${this.currentPageId}/?fields=access_token`,
      this.userAccessToken
    );

    // get user info
    res = graphRequest.get(`/${fbUserId}`, res.access_token);

    // when feed response will contain name field
    // when messeger response will not contain name field
    const name = res.name || `${res.first_name} ${res.last_name}`;

    // create customer
    return Customers.insert({
      name,
      integrationId,
      facebookData: {
        id: fbUserId,
        profilePic: res.profile_pic,
      },
    });
  }

  createMessage(conversation, content, userId) {
    if (conversation) {
      // create new message
      Messages.insert({
        conversationId: conversation._id,
        customerId: this.getOrCreateCustomer(userId),
        content,
        internal: false,
      });
    }
  }
}

/*
 * receive per app webhook response
 */
export const receiveWebhookResponse = (app, data) => {
  const selector = { kind: KIND_CHOICES.FACEBOOK, 'facebookData.appId': app.ID };

  Integrations.find(selector).forEach((integration) => {
    // when new message or other kind of activity in page
    const saveWebhookResponse = new SaveWebhookResponse(
      app.ACCESS_TOKEN,
      integration,
      data
    );

    saveWebhookResponse.start();
  });
};

_.each(Meteor.settings.FACEBOOK_APPS, (app) => {
  Picker.route(`/service/facebook/${app.ID}/webhook-callback`, (params, req, res) => {
    const query = params.query;

    // when the endpoint is registered as a webhook, it must echo back
    // the 'hub.challenge' value it receives in the query arguments
    if (query['hub.mode'] === 'subscribe' && query['hub.challenge']) {
      if (query['hub.verify_token'] !== app.VERIFY_TOKEN) {
        res.end('Verification token mismatch');
      }

      res.end(query['hub.challenge']);
    }

    res.statusCode = 200; // eslint-disable-line no-param-reassign

    // receive per app webhook response
    receiveWebhookResponse(app, req.body);

    res.end('success');
  });
});

/*
 * post reply to page conversation or comment to wall post
 */
export const facebookReply = (conversation, text, messageId) => {
  const app = _.find(
    Meteor.settings.FACEBOOK_APPS,
    (a) => a.ID === conversation.integration().facebookData.appId
  );

  // page access token
  const response = graphRequest.get(
    `${conversation.facebookData.pageId}/?fields=access_token`,
    app.ACCESS_TOKEN
  );

  // messenger reply
  if (conversation.facebookData.kind === FACEBOOK_DATA_KINDS.MESSENGER) {
    return graphRequest.post('me/messages', response.access_token,
      {
        recipient: { id: conversation.facebookData.senderId },
        message: { text },
      },

      () => {}
    );
  }

  // feed reply
  if (conversation.facebookData.kind === FACEBOOK_DATA_KINDS.FEED) {
    const postId = conversation.facebookData.postId;

    // post reply
    const commentResponse = graphRequest.post(
      `${postId}/comments`, response.access_token,
      { message: text }
    );

    // save commentId in message object
    Messages.update(
      { _id: messageId },
      { $set: { facebookCommentId: commentResponse.id } }
    );
  }

  return null;
};
