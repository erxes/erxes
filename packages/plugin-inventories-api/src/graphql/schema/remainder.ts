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
`;

export const queries = `
  getRemainder(productId: String, departmentId: String, branchId: String, uomId: String): GetRemainder
  remainders(departmentId: String, branchId: String, productCategoryId: String, productIds: [String]): [Remainder]
  remainderDetail(_id: String): Remainder
`;

export const mutations = `
  updateRemainders(productId: String, productCategoryId: String, productIds: [String], departmentId: String, branchId: String): [Remainder]
`;
