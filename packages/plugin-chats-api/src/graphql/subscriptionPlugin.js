var { withFilter } = require("graphql-subscriptions");

module.exports = {
  name: "chats",
  typeDefs: `
    chatMessageInserted(chatId: String!): ChatMessage
    chatInserted(_id: String!): Chat
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
            return payload.userId === variables._id;
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
