import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import graph from 'fbgraph';
import { Integrations } from '/imports/api/integrations/integrations';
import { KIND_CHOICES } from '/imports/api/integrations/constants';
import { Conversations } from '/imports/api/conversations/conversations';
import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';
import { Messages } from '/imports/api/conversations/messages';
import { Customers } from '/imports/api/customers/customers';

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
        accessToken: page.access_token,
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

/*
 * get or create conversation
 */
// const getOrCreateConversation = (data, integration) => {
//   let conversation = Conversations.findOne({
//     'facebookData.id': data.id,
//   });
//
//   // create new conversation
//   if (!conversation) {
//     const conversationId = Conversations.insert({
//       content: data.snippet,
//       integrationId: integration._id,
//       customerId: getOrCreateCustomer(integration._id, data.sender),
//       status: CONVERSATION_STATUSES.NEW,
//
//       // save tweet id
//       twitterData: {
//         id: data.id,
//         idStr: data.id_str,
//         screenName: data.sender.screen_name,
//         isDirectMessage: true,
//         directMessage: {
//           senderId: data.sender_id,
//           senderIdStr: data.sender_id_str,
//           recipientId: data.recipient_id,
//           recipientIdStr: data.recipient_id_str,
//         },
//       },
//     });
//     conversation = Conversations.findOne(conversationId);
//   }
// };


export const trackFacebookIntegration = {
  start(integration) {
    this.integration = integration;

    // wrap async
    this.wrappedGraphGet = Meteor.wrapAsync(graph.get, graph);

    // collect new
    this.newConversations = [];

    // or message count changed conversations
    this.changedConversations = [];

    // iterate through all pages
    _.each(integration.facebookData.pages, (page) => {
      // collect all change conversations
      this.trackPage(page);

      // create conversations
      this.createConversations();
    });
  },

  trackPage(page) {
    // set page access token
    graph.setAccessToken(page.accessToken);

    // get only conversationId, messageCount fields
    const response = this.wrappedGraphGet(
      `${page.id}/conversations?fields=message_count`
    );

    _.each(response.data, (fbConversation) => {
      const conversation = Conversations.findOne({
        'facebookData.id': fbConversation.id,
      });

      // new conversation
      if (!conversation) {
        this.newConversations.push(fbConversation.id);

      // added new message
      } else if (conversation.facebookData.messageCount !== fbConversation.message_count) {
        this.changedConversations.push(fbConversation.id);
      }
    });
  },

  // get or create customer
  getOrCreateCustomer(user) {
    const integrationId = this.integration._id;

    const customer = Customers.findOne({
      integrationId,
      'facebookData.id': user.id,
    });

    if (customer) {
      return customer._id;
    }

    // create customer
    return Customers.insert({
      name: user.name,
      integrationId,
      facebookData: {
        id: user.id,
        name: user.name,
      },
    });
  },

  // create converstions
  createConversations() {
    _.each(this.newConversations, (fbConversationId) => {
      let conversationId;

      // get conversation messages
      const response = this.wrappedGraphGet(
        `${fbConversationId}/messages?fields=message,id,from`
      );

      _.each(response.data, (fbMessage) => {
        // create conversation using first message
        if (!conversationId) {
          conversationId = Conversations.insert({
            content: fbMessage.message,
            integrationId: this.integration._id,
            customerId: this.getOrCreateCustomer(fbMessage.from),
            status: CONVERSATION_STATUSES.NEW,

            // save conversation id
            facebookData: {
              id: fbConversationId,
            },
          });
        }

        // create message
        Messages.insert({
          conversationId,
          customerId: this.getOrCreateCustomer(fbMessage.from),
          content: fbMessage.message,
          internal: false,
        });
      });
    });
  },
};

// track all facebook integrations for the first time
Integrations.find({ kind: KIND_CHOICES.FACEBOOK }).forEach((integration) => {
  trackFacebookIntegration.start(integration);
});
