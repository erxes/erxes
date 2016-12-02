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
 * start tracking facebook page
 */

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

      // update conversations
      this.updateConversations();
    });
  },

  /*
   * Sends request to graph api and goes to next page recursively
   */
  graphGet(url) {
    let results = [];

    const doRequest = (subUrl) => {
      const response = this.wrappedGraphGet(subUrl);

      // add current page info to total result
      results = _.union(results, response.data);

      // if there is another page then go to there
      if (response.paging && response.paging.next) {
        doRequest(response.paging.next);
      }
    };

    doRequest(url);

    return results;
  },

  trackPage(page) {
    // set page access token
    graph.setAccessToken(page.accessToken);

    // get only conversationId, messageCount fields
    const fbConversations = this.graphGet(
      `${page.id}/conversations?fields=message_count`
    );

    _.each(fbConversations, (fbConversation) => {
      const conversation = Conversations.findOne({
        'facebookData.id': fbConversation.id,
      });

      // new conversation
      if (!conversation) {
        this.newConversations.push(fbConversation.id);

      // added new message
      } else if (conversation.facebookData.messageCount !== fbConversation.message_count) {
        this.changedConversations.push({
          id: conversation._id,
          fbConversationId: fbConversation.id,
        });
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

  getMessages(fbConversationId) {
    const fbMessages = this.graphGet(
      `${fbConversationId}/messages?fields=message,id,from,created_time`
    );

    // sort by created_time
    return fbMessages.sort(
      (prev, next) =>
      new Date(prev.created_time) > new Date(next.created_time)
    );
  },

  // create converstions
  createConversations() {
    _.each(this.newConversations, (fbConversationId) => {
      let conversationId;

      // get conversation messages
      const fbMessages = this.getMessages(fbConversationId);

      _.each(fbMessages, (fbMessage) => {
        // create conversation using first message
        if (!conversationId) {
          conversationId = Conversations.insert({
            content: fbMessage.message,
            integrationId: this.integration._id,
            customerId: this.getOrCreateCustomer(fbMessage.from),
            status: CONVERSATION_STATUSES.NEW,

            // save fb conversation id
            facebookData: {
              id: fbConversationId,
              messageCount: fbMessages.length,
            },
          });
        }

        // create message
        this.createMessage(conversationId, fbMessage);
      });
    });
  },

  createMessage(conversationId, fbMessage) {
    Messages.insert({
      conversationId,
      customerId: this.getOrCreateCustomer(fbMessage.from),
      content: fbMessage.message,
      internal: false,
      facebookMessageId: fbMessage.id,
    });
  },

  // update conversations
  updateConversations() {
    _.each(this.changedConversations, ({ id, fbConversationId }) => {
      // fetch conversation messages
      const fbMessages = this.getMessages(fbConversationId);

      // update messageCount and mark as unread
      Conversations.update(
        { _id: id },
        {
          $set: {
            'facebookData.messageCount': fbMessages.length,
            readUserIds: [],
          },
        }
      );

      _.each(fbMessages, (fbMessage) => {
        // if message is not already fetched then create it
        if (Messages.find({ facebookMessageId: fbMessage.id }).count() === 0) {
          this.createMessage(id, fbMessage);
        }
      });
    });
  },
};

// track all facebook integrations for the first time
Integrations.find({ kind: KIND_CHOICES.FACEBOOK }).forEach((integration) => {
  trackFacebookIntegration.start(integration);
});
