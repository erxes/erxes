var { withFilter } = require("graphql-subscriptions");

module.exports = {
  name: "cards",
  typeDefs: `
      pipelinesChanged(_id: String!): PipelineChangeResponse

      checklistsChanged(contentType: String!, contentTypeId: String!): Checklist
      checklistDetailChanged(_id: String!): Checklist
      productsDataChanged(_id: String!): ProductsDataChangeResponse
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      pipelinesChanged: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator("pipelinesChanged"),
          // filter by _id
          (payload, variables) => {
            return payload.pipelinesChanged._id === variables._id;
          }
        ),
      },
      checklistsChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.checklistsChanged._id },
            buildQueryUsingSelections: (selections) => `
              query Subscription_GetChecklist($_id: String!) {
                checklistDetail(_id: $_id) {
                  ${selections}
                }
              }
          `,
          });
        },
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator("checklistsChanged"),
          (payload, variables) => {
            const { contentType, contentTypeId } = payload.checklistsChanged;

            return (
              contentType === variables.contentType &&
              contentTypeId === variables.contentTypeId
            );
          }
        ),
      },

      checklistDetailChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.checklistDetailChanged._id },
            buildQueryUsingSelections: (selections) => `
              query Subscription_GetChecklist($_id: String!) {
                checklistDetail(_id: $_id) {
                  ${selections}
                }
              }
          `,
          });
        },
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator("checklistDetailChanged"),
          (payload, variables) => {
            return payload.checklistDetailChanged._id === variables._id;
          }
        ),
      },

      productsDataChanged: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator("productsDataChanged"),
          // filter by _id
          (payload, variables) => {
            return payload.productsDataChanged._id === variables._id;
          }
        ),
      }
    };
  },
};
