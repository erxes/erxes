var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'tumentech',
  typeDefs: `
    participantsChanged(dealId: String!): JSON
  `,
  generateResolvers: (graphqlPubsub) => {
    return {
      participantsChanged: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('participantsChanged'),
          (payload, variables) => {
            return payload.participantsChanged.dealId === variables.dealId;
          }
        ),
      },
    };
  },
};
