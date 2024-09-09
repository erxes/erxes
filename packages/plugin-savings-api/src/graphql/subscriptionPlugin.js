var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'savings',
  typeDefs: `
      savingsContractChanged(_id: String!): SavingContract
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      savingsContractChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`savingsContractChanged:${_id}`),
      }
    };
  },
};