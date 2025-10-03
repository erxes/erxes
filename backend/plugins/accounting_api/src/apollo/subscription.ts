export default {
  name: 'accounting',
  typeDefs: `
			accountingAdjustInventoryChanged(adjustId: String!): AdjustInventory
		`,
  generateResolvers: (graphqlPubsub) => {
    return {
      /*
       * Listen for conversation changes like status, assignee, read state
       */
      accountingAdjustInventoryChanged: {
        subscribe: (_, { adjustId }) =>
          graphqlPubsub.asyncIterator(`accountingAdjustInventoryChanged:${adjustId}`),
      },
    };
  },
};
