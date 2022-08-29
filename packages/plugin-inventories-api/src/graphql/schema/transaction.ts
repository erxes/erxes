export const types = `
  type Transaction @key(fields: "_id") {
    _id: String

    branch: Branch
    branchId: String
    department: Department
    departmentId: String
    contentId: String
    contentType: String
    status: String

    createdAt: Date
  }

  type TransactionDetail @key(fields: "_id") {
    _id: String

    branch: Branch
    branchId: String
    department: Department
    departmentId: String
    contentId: String
    contentType: String
    status: String
    createdAt: Date

    transactionItems: [TransactionItem]
  }

  type TransactionItem {
    product: Product
    productId: String
    transactionId: String
    isDebit: Boolean
    count: Float
    uomId: String

    modifiedAt: Date
  }

  input TransactionProductInput {
    productId: String
    count: Float
    uomId: String
    isDebit: Boolean
  }
`;

export const queries = `
  transactions(
    branchId: String,
    departmentId: String,
    contentType: String,
    contentId: String,
    status: String,
    createdAt: Date
  ): [Transaction]
  transactionDetail(_id: String): TransactionDetail
`;

export const mutations = `
  transactionAdd(
    branchId: String,
    departmentId: String,
    contentType: String,
    contentId: String,
    status: String,
    products: [TransactionProductInput]
  ): JSON
`;
