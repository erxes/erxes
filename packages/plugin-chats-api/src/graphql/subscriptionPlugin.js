var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'chats',
  typeDefs: `
    chatMessageInserted(chatId: String!): ChatMessage
    chatInserted(_id: String!): Chat
    chatUnreadCountChanged(userId: String!): Int
  `,
  generateResolvers: graphqlPubsub => {
    return {
      chatMessageInserted: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('chatMessageInserted'),
          (payload, variables) => {
            return payload.chatMessageInserted.chatId === variables._id;
          }
        )
      },

      chatInserted: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('chatInserted'),
          (payload, variables) => {
            return payload.chatInserted.userId === variables.userId;
          }
        )
      },

      chatUnreadCountChanged: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('chatUnreadCountChanged'),
          (payload, variables) => {
            return payload.chatUnreadCountChanged.userId === variables.userId;
          }
        )
      }
    };
  }
};
