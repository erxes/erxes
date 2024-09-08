var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'cards',
  typeDefs: `
      loansContractChanged(_id: String!): LoanContract
      loansSchedulesChanged(contractId: String!): [LoanSchedule]
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      loansContractChanged: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`loansContractChanged:${_id}`),
      },
      loansSchedulesChanged: {
        resolve(payload, _args, { dataSources: { gatewayDataSource } }, info) {
          return gatewayDataSource.queryAndMergeMissingData({
            payload,
            info,
            queryVariables: { contractId: payload.loansSchedulesChanged.contractId },
            buildQueryUsingSelections: (selections) => `
              query Subscription_GetSchedules($contractId: String!) {
                schedules(contractId: $contractId) {
                  ${selections}
                }
              }
          `,
          });
        },
        subscribe: (_, { contractId }) =>
          graphqlPubsub.asyncIterator(
            `loansSchedulesChanged:${contractId}`
          ),
      }
    };
  },
};
