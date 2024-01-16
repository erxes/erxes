var { withFilter } = require("graphql-subscriptions");

function queryAndMergeMissingConversationMessageData({
  gatewayDataSource,
  payload,
  info,
}) {
  const conversationMessage = Object.values(payload)[0];

  return gatewayDataSource.queryAndMergeMissingData({
    payload,
    info,
    queryVariables: { _id: conversationMessage._id },
    buildQueryUsingSelections: (selections) => `
          query Subscription_GetMessage($_id: String!) {
            conversationMessage(_id: $_id) {
              ${selections}
            }
          }
      `,
  });
}

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
          return queryAndMergeMissingConversationMessageData({
            gatewayDataSource,
            payload,
            info,
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
          return queryAndMergeMissingConversationMessageData({
            gatewayDataSource,
            payload,
            info,
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
