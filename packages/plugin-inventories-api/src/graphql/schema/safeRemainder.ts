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
    createdAt: Date
    createdBy: String
    modifiedAt: Date
    modifiedBy: String
    date: Date
    description: String
    status: String
    branchId: String
    departmentId: String
    productCategoryId: String

    department: Department
    branch: Branch
    productCategory: ProductCategory
    modifiedUser: User
  }

  type SafeRemainders {
    remainders: [SafeRemainder],
    totalCount: Float,
  }

  type SafeRemItem {
    _id: String,
    modifiedAt: Date,
    lastTrDate: Date,
    remainderId: String,
    productId: String,
    quantity: Float,
    uomId: String,
    preCount: Float,
    count: Float,
    branchId: String,
    departmentId: String,

    product: Product
    uom: Uom_
  }

  type SafeRemItemCount {
    count: Int
  }
`;

export const queries = `
  safeRemainders(beginDate: Date, endDate: Date, productId: String, searchValue: String, page: Int, perPage: Int, sortField: String, sortDirection: Int, departmentId: String, branchId: String): SafeRemainders
  safeRemainderDetail(_id: String!): SafeRemainder
  safeRemItems(remainderId: String!, statuses: [String], productCategoryId: String, searchValue: String): [SafeRemItem]
  safeRemItemsCount(remainderId: String!, statuses: [String], productCategoryId: String, searchValue: String): Int
`;

export const mutations = `
  createSafeRemainder(branchId: String, departmentId: String, date: Date, description: String, productCategoryId: String): SafeRemainder
  removeSafeRemainder(_id: String!): JSON
`;
