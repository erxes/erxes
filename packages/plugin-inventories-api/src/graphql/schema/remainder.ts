export const types = `
  type Remainder @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    modifiedAt: Date
    productId: String
    quantity: Float
    uomId: String
    count: Float
    branchId: String
    departmentId: String
  }

  type GetRemainder {
    _id: String
    remainder: Float
    uomId: String

    uom: JSON
  }

  extend type ProductCategory @key(fields: "_id") {
    _id: String! @external
  }

  type Uom_ {
    _id: String!
    code: String
    name: String
  }

  type RemainderProduct @key(fields: "_id") {
    _id: String!
    name: String
    code: String
    type: String
    uomId: String
    unitPrice: Float
    categoryId: String
    createdAt: Date
    remainder: Float
    category: ProductCategory
    uom: Uom_
  }

  type RemainderProducts {
    products: [RemainderProduct],
    totalCount: Float,
  }
`;

export const queries = `
  getRemainder(productId: String, departmentId: String, branchId: String, uomId: String): GetRemainder
  remainders(departmentId: String, branchId: String, productCategoryId: String, productIds: [String]): [Remainder]
  remainderDetail(_id: String): Remainder
  remainderProducts(categoryId: String, searchValue: String, page: Int, perPage: Int, sortField: String, sortDirection: Int, search: String, departmentId: String, branchId: String): RemainderProducts
`;

export const mutations = `
  updateRemainders(productCategoryId: String, productIds: [String], departmentId: String, branchId: String): [RemainderProduct]
`;
