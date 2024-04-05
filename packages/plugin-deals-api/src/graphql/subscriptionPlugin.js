var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'deals',
  typeDefs: `
      dealsPipelinesChanged(_id: String!): PipelineChangeResponse

      dealsChecklistsChanged(contentType: String!, contentTypeId: String!): Checklist
      dealsChecklistDetailChanged(_id: String!): Checklist
      dealsProductsDataChanged(_id: String!): ProductsDataChangeResponse
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      dealsPipelinesChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`dealsPipelinesChanged:${_id}`),
      },
      dealsChecklistsChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.dealsChecklistsChanged._id },
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
            `dealsChecklistsChanged:${contentType}:${contentTypeId}`
          ),
      },

      dealsChecklistDetailChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.dealsChecklistDetailChanged._id },
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
          graphqlPubsub.asyncIterator(`dealsChecklistDetailChanged:${_id}`),
      },

      dealsProductsDataChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`dealsProductsDataChanged:${_id}`),
      },
    };
  },
};
