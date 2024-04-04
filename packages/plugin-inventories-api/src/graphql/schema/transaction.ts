export const types = `
  type InventoriesTransaction @key(fields: "_id") {
    _id: String

    contentId: String
    contentType: String
    status: String

    createdAt: Date
  }

  type InventoriesTransactionDetail @key(fields: "_id") {
    _id: String

    branch: Branch
    branchId: String
    department: Department
    departmentId: String
    contentId: String
    contentType: String
    status: String
    createdAt: Date

    transactionItems: [InventoriesTransactionItem]
  }

  type InventoriesTransactionItem {
    product: Product
    productId: String
    transactionId: String
    isDebit: Boolean
    count: Float
    uom: String

    modifiedAt: Date
  }

  input InventoriesTransactionProductInput {
    productId: String
    count: Float
    uom: String
    isDebit: Boolean
  }
`;

export const queries = `
  inventoriesTransactions(
    branchId: String,
    departmentId: String,
    contentType: String,
    contentId: String,
    status: String,
    createdAt: Date
  ): [InventoriesTransaction]
  inventoriesTransactionDetail(_id: String): InventoriesTransactionDetail
`;

export const mutations = `
  inventoriesTransactionAdd(
    branchId: String,
    departmentId: String,
    contentType: String,
    contentId: String,
    status: String,
    products: [InventoriesTransactionProductInput]
  ): JSON
`;
