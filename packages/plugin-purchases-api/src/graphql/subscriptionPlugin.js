var { withFilter } = require("graphql-subscriptions");

module.exports = {
  name: "purchases",
  typeDefs: `
      purchasesPipelinesChanged(_id: String!): PurchasesPipelineChangeResponse

      purchasesChecklistsChanged(contentType: String!, contentTypeId: String!): PurchasesChecklist
      purchasesChecklistDetailChanged(_id: String!): PurchasesChecklist
      purchasesProductsDataChanged(_id: String!): PurchasesProductsDataChangeResponse
		`,
  generateResolvers: graphqlPubsub => {
    return {
      purchasesPipelinesChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`purchasesPipelinesChanged:${_id}`)
      },
      purchasesChecklistsChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.purchasesChecklistsChanged._id },
            buildQueryUsingSelections: selections => `
              query Subscription_PurchasesGetChecklist($_id: String!) {
                purchasesChecklistDetail(_id: $_id) {
                  ${selections}
                }
              }
          `
          });
        },
        subscribe: (_, { contentType, contentTypeId }) =>
          graphqlPubsub.asyncIterator(
            `purchasesChecklistsChanged:${contentType}:${contentTypeId}`
          )
      },

      purchasesChecklistDetailChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.checklistDetailChanged._id },
            buildQueryUsingSelections: selections => `
              query Subscription_PurchasesGetChecklist($_id: String!) {
                purchasesChecklistDetail(_id: $_id) {
                  ${selections}
                }
              }
          `
          });
        },
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`purchasesChecklistDetailChanged:${_id}`)
      },

      purchasesProductsDataChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`purchasesProductsDataChanged:${_id}`)
      }
    };
  }
};
