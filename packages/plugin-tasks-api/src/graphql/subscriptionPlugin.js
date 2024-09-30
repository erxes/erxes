var { withFilter } = require("graphql-subscriptions");

module.exports = {
  name: "tasks",
  typeDefs: `
      tasksPipelinesChanged(_id: String!): TasksPipelineChangeResponse

      tasksChecklistsChanged(contentType: String!, contentTypeId: String!): TasksChecklist
      tasksChecklistDetailChanged(_id: String!): TasksChecklist
      tasksProductsDataChanged(_id: String!): TasksProductsDataChangeResponse
		`,
  generateResolvers: graphqlPubsub => {
    return {
      tasksPipelinesChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`tasksPipelinesChanged:${_id}`)
      },
      tasksChecklistsChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.checklistsChanged._id },
            buildQueryUsingSelections: selections => `
              query Subscription_TasksGetChecklist($_id: String!) {
                tasksChecklistDetail(_id: $_id) {
                  ${selections}
                }
              }
          `
          });
        },
        subscribe: (_, { contentType, contentTypeId }) =>
          graphqlPubsub.asyncIterator(
            `tasksChecklistsChanged:${contentType}:${contentTypeId}`
          )
      },

      tasksChecklistDetailChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.checklistDetailChanged._id },
            buildQueryUsingSelections: selections => `
              query Subscription_TasksGetChecklist($_id: String!) {
                tasksChecklistDetail(_id: $_id) {
                  ${selections}
                }
              }
          `
          });
        },
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`tasksChecklistDetailChanged:${_id}`)
      },

      tasksProductsDataChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`tasksProductsDataChanged:${_id}`)
      }
    };
  }
};
