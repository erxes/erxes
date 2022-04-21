var { withFilter } = require("graphql-subscriptions");

module.exports = {
  name: "chats",
  typeDefs: `
    chatMessageInserted(chatId: String!): ChatMessage
    chatInserted(userId: String!): Chat
    chatUnreadCountChanged(userId: String!): Int
  `,
  generateResolvers: (graphqlPubsub) => {
    return {
      chatMessageInserted: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator("chatMessageInserted"),
          (payload, variables) => {
            return payload.chatId === variables.chatId;
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
    };
  },
};
