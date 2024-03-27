var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'tasks',
  typeDefs: `
      taskPipelinesChanged(_id: String!): PipelineChangeResponse

      taskChecklistsChanged(contentType: String!, contentTypeId: String!): Checklist
      taskChecklistDetailChanged(_id: String!): Checklist
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      taskPipelinesChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`taskPipelinesChanged:${_id}`),
      },
      taskChecklistsChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.taskChecklistsChanged._id },
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
            `taskChecklistsChanged:${contentType}:${contentTypeId}`
          ),
      },

      taskChecklistDetailChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.taskChecklistDetailChanged._id },
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
          graphqlPubsub.asyncIterator(`taskChecklistDetailChanged:${_id}`),
      },
    };
  },
};
