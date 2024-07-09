var { withFilter } = require("graphql-subscriptions");

module.exports = {
  name: "cards",
  typeDefs: `
      salesPipelinesChanged(_id: String!): PipelineChangeResponse

      salesChecklistsChanged(contentType: String!, contentTypeId: String!): Checklist
      salesChecklistDetailChanged(_id: String!): Checklist
      salesProductsDataChanged(_id: String!): ProductsDataChangeResponse
		`,
  generateResolvers: graphqlPubsub => {
    return {
      salesPipelinesChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`pipelinesChanged:${_id}`)
      },
      salesChecklistsChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.checklistsChanged._id },
            buildQueryUsingSelections: selections => `
              query Subscription_GetChecklist($_id: String!) {
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

      salesChecklistDetailChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.checklistDetailChanged._id },
            buildQueryUsingSelections: selections => `
              query Subscription_GetChecklist($_id: String!) {
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

      salesProductsDataChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`productsDataChanged:${_id}`)
      }
    };
  }
};
