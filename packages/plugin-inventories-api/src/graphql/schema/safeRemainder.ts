export const types = `
  extend type Branch @key(fields: "_id") {
    _id: String! @external
  }

  extend type Department @key(fields: "_id") {
    _id: String! @external
  }

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  extend type Product @key(fields: "_id") {
    _id: String! @external
  }

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
`;

export const queries = `
  safeRemainders(
    departmentId: String,
    branchId: String
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
`;
