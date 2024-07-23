var { withFilter } = require("graphql-subscriptions");

module.exports = {
  name: "tickets",
  typeDefs: `
      ticketsPipelinesChanged(_id: String!): TicketsPipelineChangeResponse

      ticketsChecklistsChanged(contentType: String!, contentTypeId: String!): TicketsChecklist
      ticketsChecklistDetailChanged(_id: String!): TicketsChecklist
      ticketsProductsDataChanged(_id: String!): TicketsProductsDataChangeResponse
		`,
  generateResolvers: graphqlPubsub => {
    return {
      ticketsPipelinesChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`ticketsPipelinesChanged:${_id}`)
      },
      ticketsChecklistsChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.checklistsChanged._id },
            buildQueryUsingSelections: selections => `
              query Subscription_TicketsGetChecklist($_id: String!) {
                ticketsChecklistDetail(_id: $_id) {
                  ${selections}
                }
              }
          `
          });
        },
        subscribe: (_, { contentType, contentTypeId }) =>
          graphqlPubsub.asyncIterator(
            `ticketsChecklistsChanged:${contentType}:${contentTypeId}`
          )
      },

      ticketsChecklistDetailChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { _id: payload.checklistDetailChanged._id },
            buildQueryUsingSelections: selections => `
              query Subscription_TicketsGetChecklist($_id: String!) {
                ticketsChecklistDetail(_id: $_id) {
                  ${selections}
                }
              }
          `
          });
        },
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`ticketsChecklistDetailChanged:${_id}`)
      },

      ticketsProductsDataChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`ticketsProductsDataChanged:${_id}`)
      }
    };
  }
};
