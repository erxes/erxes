export const types = `
  type SafeRemainder @key(fields: "_id") {
    _id: String!
    branch: Branch
    branchId: String
    department: Department
    departmentId: String
    productCategory: ProductCategory
    productCategoryId: String

    date: Date
    description: String
    status: String    

    createdAt: Date
    createdBy: String
    modifiedAt: Date
    modifiedBy: String
    modifiedUser: User
  }

  type SafeRemainders {
    remainders: [SafeRemainder],
    totalCount: Float,
  }

  input SafeRemainderSubmitProduct {
    transactionId: String
    productId: String
    preCount: Float
    count: Float
    uomId: String
    isDebit: Boolean
  }
`;

export const queries = `
  safeRemainders(
    branchId: String,
    departmentId: String,
    productId: String,
    searchValue: String,
    beginDate: Date,
    endDate: Date,
    page: Int,
    perPage: Int,
    sortField: String,
    sortDirection: Int,
  ): SafeRemainders
  safeRemainderDetail(_id: String!): SafeRemainder
`;

export const mutations = `
  safeRemainderAdd(
    branchId: String,
    departmentId: String,
    date: Date,
    description: String,
    productCategoryId: String
  ): SafeRemainder
  safeRemainderRemove(_id: String!): JSON
  safeRemainderSubmit(
    branchId: String,
    departmentId: String,
    status: String,
    contentType: String,
    contentId: String,
    products: [SafeRemainderSubmitProduct]
  ): JSON
`;
