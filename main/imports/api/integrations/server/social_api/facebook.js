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
 * get list of pages that authorized user owns
 */
export const getPageList = (accessToken) => {
  graph.setAccessToken(accessToken);

  const wrappedGraphGet = Meteor.wrapAsync(graph.get, graph);

  try {
    const response = wrappedGraphGet('/me/accounts');
    const pages = [];

    // collect only some fields
    _.each(response.data, (page) => {
      pages.push({
        id: page.id,
        name: page.name,
      });
    });

    return {
      status: 'ok',
      pages,
    };

  // catch session expired or some other error
  } catch (e) {
    return {
      status: 'error',
      message: e.message,
    };
  }
};

const getUser = (fbUserId) => {
  const user = Meteor.users.findOne({
    'details.facebookId': fbUserId,
  });

  if (user) {
    return user._id;
  }

  return null;
};

// get or create customer using facebook data
const getOrCreateCustomer = (integrationId, fbUserId) => {
  // if user is one of the admins then customer has to be null
  if (getUser(fbUserId)) {
    return null;
  }

  const customer = Customers.findOne({
    integrationId,
    'facebookData.id': fbUserId,
  });

  if (customer) {
    return customer._id;
  }

  // create customer
  return Customers.insert({
    name: fbUserId,
    integrationId,
    facebookData: {
      id: fbUserId,
    },
  });
};


const createMessage = (conversation, content, userId) => {
  if (conversation) {
    // create new message
    Messages.insert({
      conversationId: conversation._id,
      customerId: getOrCreateCustomer(conversation.integrationId, userId),
      userId: getUser(userId),
      content,
      internal: false,
    });
  }
};

// get or create new conversation by page messenger
const getOrCreateConversationByMessenger = (pageId, event, integration) => {
  const senderId = event.sender.id;
  const recipientId = event.recipient.id;
  const messageText = event.message.text;

  // try to find conversation by senderId, recipientId keys
  let conversation = Conversations.findOne({
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
  });

  // create new conversation
  if (!conversation) {
    const conversationId = Conversations.insert({
      content: messageText,
      integrationId: integration._id,
      customerId: getOrCreateCustomer(integration._id, senderId),
      status: CONVERSATION_STATUSES.NEW,

      // save facebook infos
      facebookData: {
        kind: FACEBOOK_DATA_KINDS.MESSENGER,
        senderId,
        recipientId,
        pageId,
      },
    });
    conversation = Conversations.findOne(conversationId);
  }

  // create new message
  createMessage(conversation, messageText, senderId);
};

// when new message or other kind of activity in page
const hookCallback = (integration, data) => {
  if (data.object === 'page') {
    _.each(data.entry, (entry) => {
      _.each(entry.messaging, (messagingEvent) => {
        // someone sent us a message
        if (messagingEvent.message) {
          getOrCreateConversationByMessenger(entry.id, messagingEvent, integration);
        }
      });
    });
  }
};

const trackFacebookIntegration = (integration) => {
  const appId = integration.facebookData.appId;
  const app = _.find(Meteor.settings.FACEBOOK_APPS, (a) => a.ID === appId);

  Picker.route(`/service/facebook/${appId}/webhook-callback`, (params, req, res) => {
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

    // when new message or other kind of activity in page
    hookCallback(integration, req.body);

    res.end('success');
  });
};

// track all facebook integrations for the first time
Integrations.find({ kind: KIND_CHOICES.FACEBOOK }).forEach((integration) => {
  trackFacebookIntegration(integration);
});

// post reply to page conversation
export const facebookReply = (conversation, text) => {
  const app = _.find(
    Meteor.settings.FACEBOOK_APPS,
    (a) => a.ID === conversation.integration().facebookData.appId
  );

  // set app access token
  graph.setAccessToken(app.ACCESS_TOKEN);

  // page access token
  graph.get(
    `${conversation.facebookData.pageId}/?fields=access_token`,
    (err, data) => {
      // send reply to sender
      graph.setAccessToken(data.access_token);

      graph.post(
        'me/messages',
        {
          recipient: { id: conversation.facebookData.senderId },
          message: { text },
        },
        () => {}
      );
    }
  );
};
