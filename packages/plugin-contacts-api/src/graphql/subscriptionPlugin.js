var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'contacts',
  typeDefs: `
      customerConnectionChanged(_id: String): CustomerConnectionChangedResponse
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      /*
       * Listen for customer connection
       */
      customerConnectionChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`customerConnectionChanged:${_id}`),
      },
    };
  },
};
