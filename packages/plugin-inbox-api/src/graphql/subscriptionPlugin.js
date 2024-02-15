var { withFilter } = require("graphql-subscriptions");

module.exports = {
  name: "inbox",
  typeDefs: `
			conversationChanged(_id: String!): ConversationChangedResponse
			conversationMessageInserted(_id: String!): ConversationMessage
			conversationClientMessageInserted(subdomain: String!, userId: String!): ConversationMessage
			conversationClientTypingStatusChanged(_id: String!): ConversationClientTypingStatusChangedResponse
			conversationAdminMessageInserted(customerId: String): ConversationAdminMessageInsertedResponse
			conversationExternalIntegrationMessageInserted: JSON
			conversationBotTypingStatus(_id: String!): JSON
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      /*
       * Listen for conversation changes like status, assignee, read state
       */
      conversationChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`conversationChanged:${_id}`),
      },

      /*
       * Listen for new message insertion
       */
      conversationMessageInserted: {
        resolve(payload, args, { dataSources: { gatewayDataSource } }, info) {
          if(!payload) {
            console.error(`Subscription resolver error: conversationMessageInserted: payload is ${payload}`);
            return;
          }
          if(!payload.conversationMessageInserted) {
            console.error(`Subscription resolver error: conversationMessageInserted: payload.conversationMessageInserted is ${payload.conversationMessageInserted}`);
            return;
          }
          if(!payload.conversationMessageInserted._id) {
            console.error(`Subscription resolver error: conversationMessageInserted: payload.conversationMessageInserted._id is ${payload.conversationMessageInserted._id}`);
            return;
          }
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.conversationMessageInserted._id },
            buildQueryUsingSelections: (selections) => `
                  query Subscription_GetMessage($_id: String!) {
                    conversationMessage(_id: $_id) {
                      ${selections}
                    }
                  }
              `,
          });
        },
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`conversationMessageInserted:${_id}`),
      },

      /*
       * Show typing while waiting Bot response
       */
      conversationBotTypingStatus: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`conversationBotTypingStatus:${_id}`),
      },

      /*
       * Admin is listening for this subscription to show typing notification
       */
      conversationClientTypingStatusChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(
            `conversationClientTypingStatusChanged:${_id}`
          ),
      },

      /*
       * Admin is listening for this subscription to show unread notification
       */
      conversationClientMessageInserted: {
        resolve(payload, args, { dataSources: { gatewayDataSource } }, info) {
          if(!payload) {
            console.error(`Subscription resolver error: conversationClientMessageInserted: payload is ${payload}`);
            return;
          }
          if(!payload.conversationClientMessageInserted) {
            console.error(`Subscription resolver error: conversationClientMessageInserted: payload.conversationClientMessageInserted is ${payload.conversationClientMessageInserted}`);
            return;
          }
          if(!payload.conversationClientMessageInserted._id) {
            console.error(`Subscription resolver error: conversationClientMessageInserted: payload.conversationClientMessageInserted._id is ${payload.conversationClientMessageInserted._id}`);
            return;
          }
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.conversationClientMessageInserted._id },
            buildQueryUsingSelections: (selections) => `
                  query Subscription_GetMessage($_id: String!) {
                    conversationMessage(_id: $_id) {
                      ${selections}
                    }
                  }
              `,
          });
        },
        subscribe: withFilter(
          (_, { userId }) =>
            graphqlPubsub.asyncIterator(`conversationClientMessageInserted:${userId}`),
          async (payload, variables) => {
            const { conversation, integration } = payload;

            if (!conversation) {
              return false;
            }

            if (!integration) {
              return false;
            }

            return true;
          }
        ),
      },

      /*
       * Widget is listening for this subscription to show unread notification
       */
      conversationAdminMessageInserted: {
        subscribe: (_, { customerId }) => graphqlPubsub.asyncIterator(`conversationAdminMessageInserted:${customerId}`),
      },

      /*
       * Integrations api is listener
       */
      conversationExternalIntegrationMessageInserted: {
        subscribe: () =>
          graphqlPubsub.asyncIterator(
            "conversationExternalIntegrationMessageInserted"
          ),
      },
    };
  },
};
