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

    createdAt: Date
    updatedAt: Date
  }
`;

export const queries = '';

export const mutations = '';
