var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'purchases',
  typeDefs: `
      purchasesPipelinesChanged(_id: String!): PipelineChangeResponse

      purchasesChecklistsChanged(contentType: String!, contentTypeId: String!): Checklist
      purchasesChecklistDetailChanged(_id: String!): Checklist
      purchasesProductsDataChanged(_id: String!): ProductsDataChangeResponse
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      purchasesPipelinesChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`purchasesPipelinesChanged:${_id}`),
      },
      purchasesChecklistsChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.purchasesChecklistsChanged._id },
            buildQueryUsingSelections: (selections) => `
              query Subscription_GetChecklist($_id: String!) {
                checklistDetail(_id: $_id) {
                  ${selections}
                }
              }
          `,
          });
        },
        subscribe: (_, { contentType, contentTypeId }) =>
          graphqlPubsub.asyncIterator(
            `purchasesChecklistsChanged:${contentType}:${contentTypeId}`
          ),
      },

      purchasesChecklistDetailChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: {
              _id: payload.purchasesChecklistDetailChanged._id,
            },
            buildQueryUsingSelections: (selections) => `
              query Subscription_GetChecklist($_id: String!) {
                checklistDetail(_id: $_id) {
                  ${selections}
                }
              }
          `,
          });
        },
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`purchasesChecklistDetailChanged:${_id}`),
      },

      purchasesProductsDataChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`purchasesProductsDataChanged:${_id}`),
      },
    };
  },
};
