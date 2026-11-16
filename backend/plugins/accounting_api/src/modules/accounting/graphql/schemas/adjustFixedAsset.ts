export const types = `
  type AdjustFixedAsset @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    expenseAccountId: String
    taxExpenseAccountId: String
    date: Date
    description: String
    status: String
    error: String
    warning: String
    beginDate: Date
    successDate: Date
    checkedAt: Date

    createdAt: Date
    createdBy: String
    updatedAt: Date
    modifiedBy: String
  }

  type AdjustFxaDetail @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    adjustId: String
    fixedAssetId: String
    categoryId: String
    accountId: String
    branchId: String
    departmentId: String

    count: Float
    originalCost: Float
    salvageValue: Float
    accumulatedDepreciation: Float
    depreciationAmount: Float
    taxDepreciationAmount: Float
    taxAccumulatedDepreciation: Float
    temporaryDifference: Float
    deferredTaxAsset: Float
    deferredTaxLiability: Float
    revaluationLoss: Float
    revaluationReserve: Float
    previous: AdjustFxaDetail

    transactionId: String
    transactionDetailId: String
    error: String
    warning: String
    account: Account
    fixedAsset: FixedAsset

    createdAt: Date
    updatedAt: Date
  }
`;

const adjustFixedAssetsQueryParams = `
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

const adjustFixedAssetParams = `
  date: Date
  description: String
  beginDate: Date
  successDate: Date
  checkedAt: Date
`;

export const queries = `
  adjustFixedAssets(
    ${adjustFixedAssetsQueryParams}
    page: Int
    perPage: Int
    sortField: String
    sortDirection: Int
  ): [AdjustFixedAsset]
  adjustFixedAssetsCount(${adjustFixedAssetsQueryParams}): Int
  adjustFixedAssetDetail(_id: String!): AdjustFixedAsset
  adjustFxaDetails(
    _id: String!
    page: Int
    perPage: Int
    sortField: String
    sortDirection: Int
  ): [AdjustFxaDetail]
  adjustFxaDetailsCount(_id: String!): Int
`;

export const mutations = `
  adjustFixedAssetAdd(${adjustFixedAssetParams}): AdjustFixedAsset
  adjustFixedAssetPublish(adjustId: String!): AdjustFixedAsset
  adjustFixedAssetCancel(adjustId: String!): AdjustFixedAsset
  adjustFixedAssetRemove(adjustId: String!): String
  adjustFixedAssetClear(adjustId: String!): AdjustFixedAsset
  adjustFixedAssetRun(adjustId: String!): AdjustFixedAsset
  adjustFixedAssetTransaction(adjustId: String!, expenseAccountId: String!, taxExpenseAccountId: String): AdjustFixedAsset
`;
