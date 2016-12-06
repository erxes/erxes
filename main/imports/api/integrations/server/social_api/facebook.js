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

const graphRequest = (path, accessToken, method = 'get', ...otherParams) => {
  // set access token
  graph.setAccessToken(accessToken);

  const wrappedGraph = Meteor.wrapAsync(graph[method], graph);

  try {
    return wrappedGraph(path, ...otherParams);

  // catch session expired or some other error
  } catch (e) {
    throw new Error(e.message);
  }
};

/*
 * get list of pages that authorized user owns
 */
export const getPageList = (accessToken) => {
  const response = graphRequest('/me/accounts?limit=100', accessToken);

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

// when new message or other kind of activity in page
class ReceiveWebhookResponse {
  constructor(userAccessToken, integration, data) {
    this.userAccessToken = userAccessToken;
    this.integration = integration;
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
          this.receiveMessengerEvent(entry);
        }

        // receive new feed
        if (entry.changes) {
          this.receiveFeedEvent(entry);
        }
      });
    }
  }

  // via page messenger
  receiveMessengerEvent(entry) {
    _.each(entry.messaging, (messagingEvent) => {
      // someone sent us a message
      if (messagingEvent.message) {
        this.getOrCreateConversationByMessenger(messagingEvent);
      }
    });
  }

  // wall post
  receiveFeedEvent(entry) {
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
    let postId = value.post_id;

    // get page access token
    let response = graphRequest(
      `${this.currentPageId}/?fields=access_token`,
      this.userAccessToken
    );

    // get post object
    response = graphRequest(postId, response.access_token);

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
    let response = graphRequest(
      `${this.currentPageId}/?fields=access_token`,
      this.userAccessToken
    );

    // get user info
    response = graphRequest(`/${fbUserId}`, response.access_token);

    // create customer
    return Customers.insert({
      name: `${response.name}`,
      integrationId,
      facebookData: {
        id: fbUserId,
        profilePic: response.profile_pic,
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

    // track all facebook integrations for the first time
    const selector = { kind: KIND_CHOICES.FACEBOOK, 'facebookData.appId': app.ID };

    Integrations.find(selector).forEach((integration) => {
      // when new message or other kind of activity in page
      new ReceiveWebhookResponse(app.ACCESS_TOKEN, integration, req.body).start();
    });

    res.end('success');
  });
});

// post reply to page conversation
export const facebookReply = (conversation, text, messageId) => {
  const app = _.find(
    Meteor.settings.FACEBOOK_APPS,
    (a) => a.ID === conversation.integration().facebookData.appId
  );

  // page access token
  const response = graphRequest(
    `${conversation.facebookData.pageId}/?fields=access_token`,
    app.ACCESS_TOKEN
  );

  // messenger reply
  if (conversation.facebookData.kind === FACEBOOK_DATA_KINDS.MESSENGER) {
    return graphRequest('me/messages', response.access_token, 'post',
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
    const commentResponse = graphRequest(
      `${postId}/comments`, response.access_token,
      'post', { message: text }
    );

    // save commentId in message object
    Messages.update(
      { _id: messageId },
      { $set: { facebookCommentId: commentResponse.id } }
    );
  }

  return null;
};
