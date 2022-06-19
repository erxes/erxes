var { withFilter } = require("graphql-subscriptions");

module.exports = {
  name: "posclient",
  typeDefs: `
			
   extend type Subscription {
    ordersOrdered(statuses: [String]): Order
   }
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      /*
   * Listen for orders ordered
   */
  ordersOrdered: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('ordersOrdered'),
      (payload, variables) => {
        const { status } = payload.ordersOrdered;
        return variables.statuses.includes(status);
      }
    )
  }
    }
  },
};