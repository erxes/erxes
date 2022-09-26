var { withFilter } = require("graphql-subscriptions");
var { gql } = require("apollo-server-express");

module.exports = {
  name: "chats",
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
            buildQueryUsingSelections: (selections) => gql`
              query Subscription_GetChatMessage($_id: String!) {
                chatMessageDetail(_id: $_id) {
                  ${selections}
                }
              }
          `,
          });
        },
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator("chatMessageInserted"),
          (payload, variables) => {
            return payload.chatMessageInserted.chatId === variables.chatId;
          }
        ),
      },

      chatInserted: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator("chatInserted"),
          (payload, variables) => {
            return payload.userId === variables.userId;
          }
        ),
      },

      chatUnreadCountChanged: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator("chatUnreadCountChanged"),
          (payload, variables) => {
            return payload.userId === variables.userId;
          }
        ),
      },

      /*
       * Subscription to show typing notification
       */
      chatTypingStatusChanged: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator("chatTypingStatusChanged"),
          async (payload, variables) => {
            console.log(
              payload.chatTypingStatusChanged.chatId === variables.chatId
            );
            return payload.chatTypingStatusChanged.chatId === variables.chatId;
          }
        ),
      },
    };
  },
};
