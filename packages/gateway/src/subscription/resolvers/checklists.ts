import { gql } from 'apollo-server-express';
import { withFilter } from 'graphql-subscriptions';
import graphqlPubsub from '../pubsub';

export default {
  /*
   * Listen for checklist updates
   */
  checklistsChanged: {
    resolve(
      payload: any,
      args: any,
      { dataSources: { gatewayDataSource } }: any,
      info: any
    ) {
      return gatewayDataSource.queryAndMergeMissingData({
        payload,
        info,
        queryVariables: { _id: payload.checklistsChanged._id },
        buildQueryUsingSelections: (selections: any) => gql`
          query Subscription_GetChecklist($_id: ID!) {
            checklistDetail(_id: $_id) {
              ${selections}
            }
          }
      `,
      });
    },
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('checklistsChanged'),
      (payload, variables) => {
        const { contentType, contentTypeId } = payload.checklistsChanged;

        return (
          contentType === variables.contentType &&
          contentTypeId === variables.contentTypeId
        );
      }
    )
  },

  checklistDetailChanged: {
    resolve(
      payload: any,
      args: any,
      { dataSources: { gatewayDataSource } }: any,
      info: any
    ) {
      return gatewayDataSource.queryAndMergeMissingData({
        payload,
        info,
        queryVariables: { _id: payload.checklistDetailChanged._id },
        buildQueryUsingSelections: (selections: any) => gql`
          query Subscription_GetChecklist($_id: ID!) {
            checklistDetail(_id: $_id) {
              ${selections}
            }
          }
      `,
      });
    },
    subscribe: withFilter(
      () => graphqlPubsub.asyncIterator('checklistDetailChanged'),
      (payload, variables) => {
        return payload.checklistDetailChanged._id === variables._id;
      }
    )
  }
};
