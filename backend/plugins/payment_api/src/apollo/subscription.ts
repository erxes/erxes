//tslint:disable
export default {
  name: 'payment',
  typeDefs: `
        invoiceUpdated(_id: String!): JSON
        transactionUpdated(invoiceId: String!): JSON
	`,
  generateResolvers: (graphqlPubsub) => {
    return {
      invoiceUpdated: {
        subscribe: (_, { _id }) =>
          graphqlPubsub.asyncIterator(`invoiceUpdated:${_id}`),
      },

      transactionUpdated: {
        subscribe: (_, { invoiceId }) =>
          graphqlPubsub.asyncIterator(`transactionUpdated:${invoiceId}`),
      },
    };
  },
};
