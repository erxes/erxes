var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'cloudflarecalls',
  typeDefs: `
      cloudflareReceiveCall(roomState: String, userId: String): CloudflareCall
      cloudflareReceivedCall(roomState: String): CloudflareCall
`,
  generateResolvers: (graphqlPubsub) => {
    return {
      cloudflareReceiveCall: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('cloudflareReceiveCall'),
          (payload,variables) => {
            return payload.cloudflareReceiveCall.roomState === variables.roomState && payload.cloudflareReceiveCall.userId === variables.userId;
          }
        )
      },
      cloudflareReceivedCall: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('cloudflareReceivedCall'),
          (payload,variables) => {
            return payload.cloudflareReceivedCall.roomState === variables.roomState;
          }
        )
      }
    };
  },
};
