import { gql } from 'apollo-server-express';
import { withFilter } from 'graphql-subscriptions';
import graphqlPubsub from '../pubsub';

export default {
  /*
   * Listen for import history updates
   */
  importHistoryChanged: {
    resolve(
      payload: any,
      args: any,
      { dataSources: { gatewayDataSource } }: any,
      info: any
    ) {
      return gatewayDataSource.queryAndMergeMissingData({
        payload,
        info,
        queryVariables: { _id: payload.importHistoryChanged._id._id },
        buildQueryUsingSelections: (selections: any) => gql`
          query Subscription_GetImportHistory($_id: ID!) {
            importHistoryDetail(_id: $_id) {
              ${selections}
            }
          }
      `,
      });
    },
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('importHistoryChanged'),
      // filter by importHistoryId
      (payload, variables) => {
        return payload.importHistoryChanged._id === variables._id;
      }
    )
  }
};
