export const types = `
  type PaymentTransaction @key(fields: "_id") {
    _id: String
    invoiceId: String
    paymentId: String
    paymentKind: String
    amount: Float
    status: String
    createdAt: Date
    updatedAt: Date

    response: JSON
  }
`;

export const mutations = `
  transactionsAdd(
    invoiceId: String!
    paymentId: String!
    amount: Float!
    details: JSON
  ): PaymentTransaction
`;

export const queries = `
  transactions(_ids: [String], invoiceId: String): [PaymentTransaction]
`;
