export const types = `
  type PaymentTransactionsTotalCount {
    total: Int
    byKind: JSON
    byStatus: JSON
  }

  type PaymentTransaction @key(fields: "_id") {
    _id: String
    invoiceId: String
    invoice: PaymentInvoice
    paymentId: String
    paymentKind: String
    payment: PaymentMethod
    amount: Float
    status: String
    createdAt: Date
    updatedAt: Date
    details: JSON
    response: JSON
  }
`;

export const inputs = `
  input PaymentTransactionInput {
    invoiceId: String!
    paymentId: String!
    amount: Float!
    details: JSON
  }
`;

export const mutations = `
  paymentTransactionsAdd(input: PaymentTransactionInput!): PaymentTransaction

  cpPaymentTransactionsAdd(input: PaymentTransactionInput!): PaymentTransaction
`;

const queryParams = `
  _ids: [String]
  invoiceId: String
  searchValue: String
  kind: String
  status: String
`;

export const queries = `
  paymentTransactions(${queryParams}): [PaymentTransaction]
  paymentTransactionsTotalCount(${queryParams}): PaymentTransactionsTotalCount
`;