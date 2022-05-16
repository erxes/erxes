var { withFilter } = require("graphql-subscriptions");

module.exports = {
  name: "inbox",
  typeDefs: `
			conversationChanged(_id: String!): ConversationChangedResponse
			conversationMessageInserted(_id: String!): ConversationMessage
			conversationClientMessageInserted(userId: String!): ConversationMessage
			conversationClientTypingStatusChanged(_id: String!): ConversationClientTypingStatusChangedResponse
			conversationAdminMessageInserted(customerId: String): ConversationAdminMessageInsertedResponse
			conversationExternalIntegrationMessageInserted: JSON
			conversationBotTypingStatus(_id: String!): JSON
      formInvoiceUpdated(messageId: String): JSON
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      /*
       * Listen for conversation changes like status, assignee, read state
       */
      conversationChanged: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator("conversationChanged"),
          // filter by conversationId
          (payload, variables) => {
            return payload.conversationChanged.conversationId === variables._id;
          }
        ),
      },

      /*
       * Listen for new message insertion
       */
      conversationMessageInserted: {
        resolve(
          payload,
          args,
          { dataSources: { gatewayDataSource } },
          info
        ) {
          return gatewayDataSource.queryAndMergeMissingConversationMessageData({
            payload,
            info,
          });
        },
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator("conversationMessageInserted"),
          // filter by conversationId
          (payload, variables) => {
            return (
              payload.conversationMessageInserted.conversationId ===
              variables._id
            );
          }
        ),
      },

      /*
       * Show typing while waiting Bot response
       */
      conversationBotTypingStatus: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator("conversationBotTypingStatus"),
          async (payload, variables) => {
            return (
              payload.conversationBotTypingStatus.conversationId ===
              variables._id
            );
          }
        ),
      },

      /*
       * Admin is listening for this subscription to show typing notification
       */
      conversationClientTypingStatusChanged: {
        subscribe: withFilter(
          () =>
            graphqlPubsub.asyncIterator(
              "conversationClientTypingStatusChanged"
            ),
          async (payload, variables) => {
            return (
              payload.conversationClientTypingStatusChanged.conversationId ===
              variables._id
            );
          }
        ),
      },

      /*
       * Admin is listening for this subscription to show unread notification
       */
      conversationClientMessageInserted: {
        resolve(
          payload,
          args,
          { dataSources: { gatewayDataSource } },
          info
        ) {
          return gatewayDataSource.queryAndMergeMissingConversationMessageData({
            payload,
            info,
          });
        },
        subscribe: withFilter(
          () =>
            graphqlPubsub.asyncIterator("conversationClientMessageInserted"),
          async (payload, variables) => {
            const { conversation, integration, channelMemberIds } = payload;

            if (!conversation) {
              return false;
            }

            if (!integration) {
              return false;
            }

            return channelMemberIds.includes(variables.userId);
          }
        ),
      },

      /*
       * Widget is listening for this subscription to show unread notification
       */
      conversationAdminMessageInserted: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator("conversationAdminMessageInserted"),
          // filter by conversationId
          (payload, variables) => {
            return (
              payload.conversationAdminMessageInserted.customerId ===
              variables.customerId
            );
          }
        ),
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

      formInvoiceUpdated: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('formInvoiceUpdated'),
          // filter by messageId
          (payload, variables) => {
            return payload.formInvoiceUpdated.messageId === variables.messageId;
          }
        )
      }
    };
  },
};