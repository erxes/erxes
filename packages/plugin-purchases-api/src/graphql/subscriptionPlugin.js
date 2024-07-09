var { withFilter } = require("graphql-subscriptions");

module.exports = {
  name: "cards",
  typeDefs: `
      purchasePipelinesChanged(_id: String!): PipelineChangeResponse

      purchaseChecklistsChanged(contentType: String!, contentTypeId: String!): Checklist
      purchaseChecklistDetailChanged(_id: String!): Checklist
      purchaseProductsDataChanged(_id: String!): ProductsDataChangeResponse
		`,
  generateResolvers: graphqlPubsub => {
    return {
      purchasePipelinesChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`pipelinesChanged:${_id}`)
      },
      purchaseChecklistsChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.checklistsChanged._id },
            buildQueryUsingSelections: selections => `
              query Subscription_PurchaseGetChecklist($_id: String!) {
                checklistDetail(_id: $_id) {
                  ${selections}
                }
              }
          `
          });
        },
        subscribe: (_, { contentType, contentTypeId }) =>
          graphqlPubsub.asyncIterator(
            `checklistsChanged:${contentType}:${contentTypeId}`
          )
      },

      purchaseChecklistDetailChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.checklistDetailChanged._id },
            buildQueryUsingSelections: selections => `
              query Subscription_PurchaseGetChecklist($_id: String!) {
                checklistDetail(_id: $_id) {
                  ${selections}
                }
              }
          `
          });
        },
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`checklistDetailChanged:${_id}`)
      },

      purchaseProductsDataChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`productsDataChanged:${_id}`)
      }
    };
  }
};
