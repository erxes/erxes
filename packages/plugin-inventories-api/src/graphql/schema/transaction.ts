export const types = `
  type Transaction @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String

    contentType: String
    contentId: String
    status: String

    createdAt: Date
  }

  input TransactionProductInput {
    branchId: String
    departmentId: String
    transactionId: String
    productId: String
    count: Float
    uomId: String
    isDebit: Boolean
  }
`;

export const queries = `
  transactions(
    contentType: String,
    contentId: String,
    status: String,
    date: Date
  ): [Transaction]
  transactionDetail(_id: String): Transaction
`;

export const mutations = `
  transactionAdd(
    contentType: String,
    contentId: String,
    status: String,
    products: [TransactionProductInput]
  ): JSON
`;
