var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'calls',
  typeDefs: `
      phoneCallReceived(customerPhone: String): JSON
      sessionTerminateRequested(userId: String): JSON
      waitingCallReceived(extension: String): String
      talkingCallReceived(extension: String): String
      agentCallReceived(extension: String): String
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      phoneCallReceived: {
        resolve(
          payload,
          _args,
          { dataSources: { gatewayDataSource } },
          info
        ) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { customerPhone: payload.phoneCallReceived.customerPhone },
            buildQueryUsingSelections: (selections) => `
              query Subscription_GetCalls($_id: String!) {
                clientPortalNotificationDetail(_id: $_id) {
                  ${selections}
                }
              }
          `,
          });
        },
        subscribe: (_, { customerPhone }) => graphqlPubsub.asyncIterator(`phoneCallReceived:${customerPhone}`),
      },
      sessionTerminateRequested: {
        subscribe: (_, { userId }, { subdomain }) =>
          graphqlPubsub.asyncIterator(
            `sessionTerminateRequested:${subdomain}:${userId}`,
          ),
      },
      waitingCallReceived: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator(`waitingCallReceived`),
          (payload, variables) => {

            const response = JSON.parse(payload.waitingCallReceived);
            return response.extension === variables.extension;
          }
        )
      },
      talkingCallReceived: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator(`talkingCallReceived`),
          (payload, variables) => {

            const response = JSON.parse(payload.talkingCallReceived);
            return response.extension === variables.extension;
          }
        )
      },

      agentCallReceived: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator(`agentCallReceived`),
          (payload, variables) => {

            const response = JSON.parse(payload.agentCallReceived);
            return response.extension === variables.extension;
          }
        )
      }

    };
  },
};
