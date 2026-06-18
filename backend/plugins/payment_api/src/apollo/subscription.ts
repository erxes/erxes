//tslint:disable
export default {
  name: 'payment',
  typeDefs: `
        invoiceUpdated(_id: String!): JSON
        invoiceScanned: JSON
        transactionUpdated(invoiceId: String!): JSON
	`,
  generateResolvers: (graphqlPubsub) => {
    return {
      invoiceUpdated: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`invoiceUpdated:${_id}`),
      },

      invoiceScanned: {
        subscribe: () =>
          graphqlPubsub.asyncIterator('invoiceScanned'),
      },

      transactionUpdated: {
        subscribe: (_, { invoiceId }) =>
          graphqlPubsub.asyncIterator(`transactionUpdated:${invoiceId}`),
      },
    };
  },
};
