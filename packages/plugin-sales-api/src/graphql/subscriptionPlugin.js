var { withFilter } = require("graphql-subscriptions");

module.exports = {
  name: "sales",
  typeDefs: `
      salesPipelinesChanged(_id: String!): SalesPipelineChangeResponse

      salesChecklistsChanged(contentType: String!, contentTypeId: String!): SalesChecklist
      salesChecklistDetailChanged(_id: String!): SalesChecklist
      salesProductsDataChanged(_id: String!): SalesProductsDataChangeResponse
		`,
  generateResolvers: graphqlPubsub => {
    return {
      salesPipelinesChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`salesPipelinesChanged:${_id}`)
      },
      salesChecklistsChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.checklistsChanged._id },
            buildQueryUsingSelections: selections => `
              query Subscription_SalesGetChecklist($_id: String!) {
                salesChecklistDetail(_id: $_id) {
                  ${selections}
                }
              }
          `
          });
        },
        subscribe: (_, { contentType, contentTypeId }) =>
          graphqlPubsub.asyncIterator(
            `salesChecklistsChanged:${contentType}:${contentTypeId}`
          )
      },

      salesChecklistDetailChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.checklistDetailChanged._id },
            buildQueryUsingSelections: selections => `
              query Subscription_SalesGetChecklist($_id: String!) {
                salesChecklistDetail(_id: $_id) {
                  ${selections}
                }
              }
          `
          });
        },
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`salesChecklistDetailChanged:${_id}`)
      },

      salesProductsDataChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`salesProductsDataChanged:${_id}`)
      }
    };
  }
};
