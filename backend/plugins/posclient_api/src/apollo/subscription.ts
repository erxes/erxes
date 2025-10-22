import { withFilter } from 'graphql-subscriptions';

export default {
  name: 'posclient',
  typeDefs: `
      ordersOrdered(posToken: String, statuses: [String], customerId: String): Order
      orderItemsOrdered(posToken: String, statuses: [String]): PosOrderItem
      slotsStatusUpdated(posToken: String): [PosclientSlot]
    `,
  generateResolvers: (graphqlPubsub) => {
    return {
      ordersOrdered: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('ordersOrdered'),
          (payload, variables) => {
            const { status, customerId, posToken, subToken } = payload
              .ordersOrdered._doc
              ? payload.ordersOrdered._doc
              : payload.ordersOrdered;
            if (variables.customerId) {
              return (
                (variables.posToken === posToken ||
                  variables.posToken === subToken) &&
                variables.statuses.includes(status) &&
                variables.customerId === customerId
              );
            }

            return (
              (variables.posToken === posToken ||
                variables.posToken === subToken) &&
              variables.statuses.includes(status)
            );
          },
        ),
      },
      orderItemsOrdered: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('orderItemsOrdered'),
          (payload, variables) => {
            const { status, posToken } = payload.orderItemsOrdered;
            return (
              variables.posToken === posToken &&
              variables.statuses.includes(status)
            );
          },
        ),
      },
      slotsStatusUpdated: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('slotsStatusUpdated'),
          (payload, variables) => {
            if (!variables.posToken) {
              return false;
            }

            return Boolean(
              (payload.slotsStatusUpdated || []).filter(
                (s) => s.posToken === variables.posToken,
              ).length,
            );
          },
        ),
      },
    };
  },
};
