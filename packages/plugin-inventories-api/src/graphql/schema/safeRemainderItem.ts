export const types = `
  type SafeRemainderItem {
    _id: String,
    modifiedAt: Date,
    status: String,
    lastTransactionDate: Date,
    remainderId: String,
    productId: String,
    preCount: Float,
    count: Float,
    uomId: String,
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
  safeRemainderItems(${safeRemainderItemsFilterParams}): [SafeRemainderItem]
  safeRemainderItemsCount(${safeRemainderItemsFilterParams}): Int
`;

export const mutations = `
  updateSafeRemainderItem(_id: String, status: String, remainder: Float): SafeRemainderItem
  removeSafeRemainderItem(_id: String): JSON
`;
