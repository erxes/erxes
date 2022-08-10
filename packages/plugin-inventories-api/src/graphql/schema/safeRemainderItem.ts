export const types = `
  type SafeRemainderItem {
    _id: String,
    branchId: String,
    departmentId: String,
    remainderId: String,
    product: Product,
    productId: String,

    preCount: Float,
    count: Float,
    status: String,
    uom: Uom_,
    uomId: String,
    
    lastTransactionDate: Date,
    modifiedAt: Date,
    modifiedBy: String
  }
`;

const safeRemainderItemsFilterParams = `
  remainderId: String!,
  productCategoryId: String,
  status: String,
  searchValue: String,
  diffType: String
`;

export const queries = `
  safeRemainderItems(${safeRemainderItemsFilterParams}): [SafeRemainderItem]
  safeRemainderItemsCount(${safeRemainderItemsFilterParams}): Int
`;

export const mutations = `
  safeRemainderItemEdit(
    _id: String,
    status: String,
    remainder: Float
  ): SafeRemainderItem
  safeRemainderItemRemove(_id: String): JSON
`;
