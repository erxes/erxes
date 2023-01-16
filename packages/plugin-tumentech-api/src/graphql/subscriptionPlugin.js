var { withFilter } = require('graphql-subscriptions');
var { gql } = require('apollo-server-express');

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
            return payload.dealId === variables.dealId;
          }
        ),
      },
    };
  },
};
