var { withFilter } = require("graphql-subscriptions");

module.exports = {
  name: "contacts",
  typeDefs: `
      customerConnectionChanged(_id: String): CustomerConnectionChangedResponse
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      /*
       * Listen for customer connection
       */
      customerConnectionChanged: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('customerConnectionChanged'),
          // filter by customerId
          (payload, variables) => {
            return payload.customerConnectionChanged._id === variables._id;
          }
        )
      }
    };
  },
};