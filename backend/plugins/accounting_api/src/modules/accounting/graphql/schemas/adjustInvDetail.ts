export const types = `
  type AdjustInvDetail @key(fields: "_id") @cacheControl(maxAge: 3){
    _id: String
    adjustId: String
    createdAt: Date
    updatedAt: Date

    productId: String
    accountId: String
    departmentId: String
    branchId: String

    remainder: Float
    cost: Float
    unitCost: Float
    soonInCount: Float
    soonOutCount: Float

    error: String
    warning: String
    byDate: JSON

    product: Product
    account: Account
    branch: Branch
    department: Department
  }

  type AdjustInventory @key(fields: "_id") @cacheControl(maxAge: 3){
    _id: String
    createdAt: Date
    createdBy: String
    updatedAt: Date
    modifiedBy: String

    date: Date
    description: String
    status: String
    error: String
    warning: String
    beginDate: Date
    successDate: Date
    checkedAt: Date
  }
`;

const AdjustInventoriesQueryParams = `
  startDate: Date
  endDate: Date
  description: String
  status: String
  error: String
  warning: String
  startBeginDate: Date
  endBeginDate: Date
  startSuccessDate: Date
  endSuccessDate: Date
  startCheckedAt: Date
  endCheckedAt: Date
`;

const adjustInvParams = `
  date: Date
  description: String
  beginDate: Date
  successDate: Date
  checkedAt: Date
`;

export const queries = `
  adjustInventories(
    ${AdjustInventoriesQueryParams},
    page: Int,
    perPage: Int,
    sortField: String
    sortDirection: Int
  ): [AdjustInventory]
  adjustInventoriesCount(${AdjustInventoriesQueryParams}): Int
  adjustInventoryDetail(_id: String): AdjustInventory
  adjustInventoryDetails(
    _id: String!,
    page: Int,
    perPage: Int,
    sortField: String
    sortDirection: Int
  ): [AdjustInvDetail]
  adjustInventoryDetailsCount(_id: String!): Int
`;

export const mutations = `
  adjustInventoryAdd(${adjustInvParams}): AdjustInventory
  adjustInventoryPublish(adjustId: String!): AdjustInventory
  adjustInventoryCancel(adjustId: String!): AdjustInventory
  adjustInventoryRemove(adjustId: String!): String
  adjustInventoryRun(adjustId: String!): AdjustInventory
  adjustInventoryClear(adjustId: String!): AdjustInventory
`;
