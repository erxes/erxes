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

  type SafeRemainderItem {
    _id: String,
    modifiedAt: Date,
    status: String,
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
`;

const safeRemainderItemsFilterParams = `
  remainderId: String!,
  status: String,
  productCategoryId: String,
  searchValue: String,
  diffType: String
`;

export const queries = `
  safeRemainders(beginDate: Date, endDate: Date, productId: String, searchValue: String, page: Int, perPage: Int, sortField: String, sortDirection: Int, departmentId: String, branchId: String): SafeRemainders
  safeRemainderDetail(_id: String!): SafeRemainder
  safeRemainderItems(${safeRemainderItemsFilterParams}): [SafeRemainderItem]
  safeRemainderItemsCount(${safeRemainderItemsFilterParams}): Int
`;

export const mutations = `
  createSafeRemainder(branchId: String, departmentId: String, date: Date, description: String, productCategoryId: String): SafeRemainder
  removeSafeRemainder(_id: String!): JSON
  updateSafeRemainderItem(_id: String, status: String, remainder: Float): SafeRemainderItem
  removeSafeRemainderItem(_id: String): JSON
`;
