var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'growthhacks',
  typeDefs: `
      growthhacksPipelinesChanged(_id: String!): PipelineChangeResponse

      growthhacksChecklistsChanged(contentType: String!, contentTypeId: String!): Checklist
      growthhacksChecklistDetailChanged(_id: String!): Checklist
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      growthhacksPipelinesChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`growthhacksPipelinesChanged:${_id}`),
      },
      growthhacksChecklistsChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.growthhacksChecklistsChanged._id },
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
            `growthhacksChecklistsChanged:${contentType}:${contentTypeId}`
          ),
      },

      growthhacksChecklistDetailChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: {
              _id: payload.growthhacksChecklistDetailChanged._id,
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
          graphqlPubsub.asyncIterator(
            `growthhacksChecklistDetailChanged:${_id}`
          ),
      },
    };
  },
};
