export const types = `
  type Transaction @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    contentType: String
    contentId: String
    status: String
    branchId: String
    departmentId: String
    createdAt: Date
    createdBy: String
  }

  input TransactionProductInput {
    branchId: String
    departmentId: String
    remainderId: String
    productId: String
    count: Float
    isDebit: Boolean
    uomId: String
  }
`;

export const queries = `
  transactions(contentType: String, contentId: String, status: String, date: Date): [Transaction]
  transactionDetail(_id: String): Transaction
`;

export const mutations = `
  transactionAdd(contentType: String, contentId: String, status: String, products: [TransactionProductInput]): JSON
`;
