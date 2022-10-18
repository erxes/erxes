var { withFilter } = require("graphql-subscriptions");

module.exports = {
  name: "posclient",
  typeDefs: `
    ordersOrdered(statuses: [String], customerId: String): Order
    orderItemsOrdered(statuses: [String]): PosOrderItem
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
            const { status, customerId } = payload.ordersOrdered;
            if (variables.customerId) {
              return (
                variables.statuses.includes(status) && variables.customerId === customerId
              )
            }

            return (
              variables.statuses.includes(status)
            );
          }
        )
      }, 
      orderItemsOrdered: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('orderItemsOrdered'),
          (payload, variables) => {
            const { status } = payload.orderItemsOrdered;
            return variables.statuses.includes(status);
          }
        )
      }
    }
  },
};