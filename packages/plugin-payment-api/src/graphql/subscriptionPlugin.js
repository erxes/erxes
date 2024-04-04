var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'payment',
  typeDefs: `
    invoiceUpdated(_id: String!): JSON
  `,
  generateResolvers: (graphqlPubsub) => {
    return {
      invoiceUpdated: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`invoiceUpdated:${_id}`),
      },
    };
  },
};
