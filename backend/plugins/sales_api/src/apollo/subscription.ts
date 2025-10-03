//tslint:disable
import sift from 'sift';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { withFilter } from 'graphql-subscriptions';

export default {
  name: 'sales',
  typeDefs: `
    salesDealChanged(_id: String!): DealSubscription
    salesDealListChanged(pipelineId: String!, userId: String, filter: IDealFilter): DealSubscription
  `,
  // salesDealActivityChanged(contentId: String!): SalesActivitySubscription

  generateResolvers: (graphqlPubsub) => {
    return {
      // salesDealActivityChanged: {
      //   resolve: (payload) => payload.salesDealActivityChanged,
      //   subscribe: (_, { contentId }) =>
      //     graphqlPubsub.asyncIterator(`salesDealActivityChanged:${contentId}`),
      // },
      salesDealChanged: {
        resolve: (payload) => payload.salesDealChanged,
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`salesDealChanged:${_id}`),
      },
      salesDealListChanged: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('salesDealListChanged'),
          async (payload, variables) => {
            const { deal, oldDeal, pipelineIds } = payload.salesDealListChanged;

            const { userId, pipelineId, filter } = variables;

            if (!pipelineIds.includes(pipelineId)) {
              return false;
            }

            const filterParams = await sendTRPCMessage({
              pluginName: 'sales',
              module: 'deal',
              action: 'getFilterParams',
              input: {
                filter,
                userId
              }
            });

            const matchesOld = sift(filterParams)(oldDeal);
            const matchesNew = sift(filterParams)(deal);

            if (!matchesOld && !matchesNew) {
              return false;
            }

            payload.matches = { matchesOld, matchesNew }
            return true;
          },
        ),
        resolve: async (payload) => {
          const { matchesOld, matchesNew } = payload.matches;

          if (matchesOld && !matchesNew) {
            return { ...payload.salesDealListChanged, action: 'remove' }
          }

          if (!matchesOld && matchesNew) {
            return { ...payload.salesDealListChanged, action: 'add' }
          }

          return { ...payload.salesDealListChanged, action: 'update' }
        },
      },
    };
  },
};
