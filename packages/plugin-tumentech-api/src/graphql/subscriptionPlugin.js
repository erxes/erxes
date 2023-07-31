var { withFilter } = require("graphql-subscriptions");
var { gql } = require("apollo-server-express");

module.exports = {
  name: "tumentech",
  typeDefs: `
    participantsChanged(dealId: String!): JSON,
    participantsCountChanged(userId: String!): JSON 
  `,
  generateResolvers: (graphqlPubsub) => {
    return {
      participantsChanged: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator("participantsChanged"),
          (payload, variables) => {
            return payload.participantsChanged.dealId === variables.dealId;
          }
        ),
      },
      participantsCountChanged: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator("participantsCountChanged"),
          (payload, variables) => {
            return payload.participantsCountChanged._id === variables.userId;
          }
        ),
      },
    };
  },
};
