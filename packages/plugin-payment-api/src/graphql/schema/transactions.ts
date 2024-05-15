export const types = `
type TransactionsTotalCount {
  total: Int
  byKind: JSON
  byStatus: JSON
}

  type PaymentTransaction @key(fields: "_id") {
    _id: String
    invoiceId: String
    invoice: Invoice
    paymentId: String
    paymentKind: String
    payment: Payment
    amount: Float
    status: String
    createdAt: Date
    updatedAt: Date

    details: JSON
    response: JSON
  }
`;

export const mutations = `
  paymentTransactionsAdd(
    invoiceId: String!
    paymentId: String!
    amount: Float!
    details: JSON
  ): PaymentTransaction
`;

export const queries = `
  paymentTransactions(_ids: [String], invoiceId: String, searchValue: String, kind: String, status: String): [PaymentTransaction]
  paymentTransactionsTotalCount(_ids: [String], invoiceId: String, searchValue: String, kind: String, status: String): TransactionsTotalCount
`;
