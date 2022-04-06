var { withFilter } = require("graphql-subscriptions");

module.exports = {
  name: "ebarimt",
  typeDefs: `
      automationResponded(userId: String, sessionCode: String): AutomationResponse
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      automationResponded: {
        subscribe: withFilter(
          () => graphqlPubsub.asyncIterator("automationResponded"),
          // filter by _id
          (payload, variables) => {
            return (
              payload.automationResponded.userId === variables.userId &&
              payload.automationResponded.sessionCode === variables.sessionCode
            );
          }
        ),
      },
    };
  },
};
