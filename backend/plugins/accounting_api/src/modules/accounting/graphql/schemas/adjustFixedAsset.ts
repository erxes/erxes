export const types = `
  type AdjustFixedAsset @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
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
    fxaInstanceId: String
    fixedAssetId: String
    categoryId: String
    accountId: String
    branchId: String
    departmentId: String

    originalCost: Float
    salvageValue: Float
    openingBookValue: Float
    openingAccumulatedDepreciation: Float
    depreciationAmount: Float
    bookDepreciationAmount: Float
    closingAccumulatedDepreciation: Float
    closingBookValue: Float

    openingTaxBase: Float
    openingTaxAccumulatedDepreciation: Float
    taxDepreciationAmount: Float
    closingTaxAccumulatedDepreciation: Float
    closingTaxBase: Float

    openingTemporaryDifference: Float
    temporaryDifferenceAmount: Float
    closingTemporaryDifference: Float
    deferredTaxAmount: Float
    deferredTaxType: String
    deferredTaxTransactionId: String
    deferredTaxTrDetailId: String

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
  adjustFixedAssetRemove(adjustId: String!): String
  adjustFixedAssetRun(adjustId: String!): AdjustFixedAsset
  adjustFixedAssetTransaction(adjustId: String!, expenseAccountId: String!): AdjustFixedAsset
`;
