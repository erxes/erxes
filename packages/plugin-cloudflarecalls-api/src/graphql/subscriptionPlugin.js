var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'cloudflarecalls',
  typeDefs: `
      cloudflareReceiveCall(roomState: String, userId: String, audioTrack: String): CloudflareCall
      cloudflareReceivedCall(roomState: String, audioTrack: String): CloudflareCall
`,
  generateResolvers: (graphqlPubsub) => {
    return {
      cloudflareReceiveCall: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('cloudflareReceiveCall'),
          (payload,variables) => {
            return payload.cloudflareReceiveCall.userId === variables.userId && 'leave' !== variables.roomState || 'leave' === variables.roomState && payload.cloudflareReceiveCall.audioTrack === variables.audioTrack;
          }
        )
      },
      cloudflareReceivedCall: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('cloudflareReceivedCall'),
          (payload,variables) => {
            return 'leave' !== variables.roomState || payload.cloudflareReceivedCall.audioTrack === variables.audioTrack && variables.roomState === 'leave';
          }
        )
      }
    };
  },
};
