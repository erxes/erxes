export const types = `
  type Remainder @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    branchId: String
    departmentId: String
    productId: String
    count: Float
    uomId: String
    modifiedAt: Date
  }

  type RemainderCount {
    _id: String
    remainder: Float
    uomId: String
    uom: JSON
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
    uom: Uom_
    uomId: String
    category: ProductCategory
    categoryId: String
    remainder: Float
    unitPrice: Float
    createdAt: Date
  }

  type RemainderProducts {
    products: [RemainderProduct],
    totalCount: Float,
  }
`;

export const queries = `
  remainders(
    departmentId: String,
    branchId: String,
    productCategoryId: String,
    productIds: [String]
  ): [Remainder]
  remainderDetail(_id: String): Remainder
  remainderCount(
    departmentId: String,
    branchId: String,
    productId: String,
    uomId: String
  ): RemainderCount
  remainderProducts(
    departmentId: String,
    branchId: String,
    categoryId: String,
    search: String,
    searchValue: String,
    page: Int,
    perPage: Int,
    sortField: String,
    sortDirection: Int,
  ): RemainderProducts
`;

export const mutations = `
  remaindersUpdate(
    departmentId: String,
    branchId: String,
    productCategoryId: String,
    productIds: [String],
  ): [RemainderProduct]
`;
