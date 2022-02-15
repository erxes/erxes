var { withFilter } = require('graphql-subscriptions');

module.exports = {
  name: 'cards',
  typeDefs: `
      pipelinesChanged(_id: String!): PipelineChangeResponse
		`,
  generateResolvers: graphqlPubsub => {
    return {
      pipelinesChanged: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator('pipelinesChanged'),
          // filter by _id
          (payload, variables) => {
            return payload.pipelinesChanged._id === variables._id;
          }
        )
      }
    };
  }
};
