var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'savings',
  typeDefs: `
      savingsContractChanged(ids: [String]): SavingContract
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      savingsContractChanged: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator(`savingsContractChanged`),
          (payload, variables) => {
            const contract = payload.savingsContractChanged._doc ? payload.savingsContractChanged._doc : payload.savingsContractChanged;

            if (variables.ids.includes(contract._id)) {
              return true;
            };
            return false;
          }

        ),
      }
    };
  },
};