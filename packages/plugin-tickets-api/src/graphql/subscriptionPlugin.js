var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'tickets',
  typeDefs: `
      ticketPipelinesChanged(_id: String!): PipelineChangeResponse

      ticketChecklistsChanged(contentType: String!, contentTypeId: String!): Checklist
      ticketChecklistDetailChanged(_id: String!): Checklist
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      ticketPipelinesChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`ticketPipelinesChanged:${_id}`),
      },
      ticketChecklistsChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.ticketChecklistsChanged._id },
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
            `ticketChecklistsChanged:${contentType}:${contentTypeId}`
          ),
      },

      ticketChecklistDetailChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.ticketChecklistDetailChanged._id },
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
          graphqlPubsub.asyncIterator(`ticketChecklistDetailChanged:${_id}`),
      },
    };
  },
};
