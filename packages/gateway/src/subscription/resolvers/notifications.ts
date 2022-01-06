import { gql } from 'apollo-server-express';
import { withFilter } from 'graphql-subscriptions';
import graphqlPubsub from '../pubsub';

export default {
  /*
   * Listen for notification
   */
  notificationInserted: {
    resolve(
      payload: any,
      args: any,
      { dataSources: { gatewayDataSource } }: any,
      info: any
    ) {
      return gatewayDataSource.queryAndMergeMissingData({
        payload,
        info,
        queryVariables: { _id: payload.notificationInserted._id },
        buildQueryUsingSelections: (selections: any) => gql`
          query Subscription_GetNotification($_id: String!) {
            notificationDetail(_id: $_id) {
              ${selections}
            }
          }
      `,
      });
    },
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('notificationInserted'),
      (payload, variables) => {
        return payload.notificationInserted.userId === variables.userId;
      }
    )
  },

  notificationRead: {
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('notificationRead'),
      (payload, variables) => {
        return payload.notificationRead.userId === variables.userId;
      }
    )
  }
};
