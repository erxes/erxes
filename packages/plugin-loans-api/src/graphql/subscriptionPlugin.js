var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'loans',
  typeDefs: `
      loansContractChanged(ids: [String]): LoanContract
      loansSchedulesChanged(contractId: String!): [LoanSchedule]
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      loansContractChanged: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator(`loansContractChanged`),
          (payload, variables) => {
            const contract = payload.loansContractChanged._doc ? payload.loansContractChanged._doc : payload.loansContractChanged;

            if (variables.ids.includes(contract._id)) {
              return true;
            };
            return false;
          }

        ),
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
