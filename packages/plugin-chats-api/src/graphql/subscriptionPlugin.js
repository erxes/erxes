var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'chats',
  typeDefs: `
    chatMessageInserted(chatId: String!): ChatMessage
    chatInserted(userId: String!): Chat
    chatUnreadCountChanged(userId: String!): Int
    chatTypingStatusChanged(chatId: String!) : ChatTypingStatusChangedResponse
  `,
  generateResolvers: (graphqlPubsub) => {
    return {
      chatMessageInserted: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.chatMessageInserted._id },
            buildQueryUsingSelections: (selections) => `
              query Subscription_GetChatMessage($_id: String!) {
                chatMessageDetail(_id: $_id) {
                  ${selections}
                }
              }
          `,
          });
        },
        subscribe: (_, { chatId }) =>
          graphqlPubsub.asyncIterator(`chatMessageInserted:${chatId}`),
      },

      chatInserted: {
        subscribe: (_, { userId }) =>
          graphqlPubsub.asyncIterator(`chatInserted:${userId}`),
      },

      chatUnreadCountChanged: {
        subscribe: (_, { userId }) =>
          graphqlPubsub.asyncIterator(`chatUnreadCountChanged:${userId}`),
      },

      /*
       * Subscription to show typing notification
       */
      chatTypingStatusChanged: {
        subscribe: (_, { chatId }) =>
          graphqlPubsub.asyncIterator(`chatTypingStatusChanged:${chatId}`),
      },
    };
  },
};
