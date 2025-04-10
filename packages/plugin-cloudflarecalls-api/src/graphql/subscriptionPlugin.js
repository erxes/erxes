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
            return (payload.cloudflareReceiveCall.userId === variables.userId && 'ready' === variables.roomState) || 'leave' === variables.roomState && payload.cloudflareReceiveCall.audioTrack === variables.audioTrack || 'answered' === variables.roomState && payload.cloudflareReceiveCall.customerAudioTrack === variables.audioTrack || 'busy' === variables.roomState && payload.cloudflareReceiveCall.audioTrack === variables.audioTrack;
          }
        )
      },
      cloudflareReceivedCall: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('cloudflareReceivedCall'),
          (payload,variables) => {
            return payload.cloudflareReceivedCall.customerAudioTrack === variables.audioTrack;
          }
        )
      }
    };
  },
};
