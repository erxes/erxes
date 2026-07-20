export const types = `
  type FxaInstance @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    fixedAssetId: String
    categoryId: String
    code: String
    sequence: Int
    status: String

    originalCost: Float
    accumulatedDepreciation: Float
    bookValue: Float
    depreciationMethod: String
    usefulLife: Float
    salvageValue: Float
    taxDepreciationMethod: String
    taxUsefulLife: Float
    taxSalvageValue: Float
    acquisitionDate: Date
    depreciationStartDate: Date
    lastDepreciationDate: Date

    branchId: String
    departmentId: String
    responsibleUserId: String
    locationId: String

    transactionId: String
    transactionDetailId: String
    acquisitionTransactionId: String
    acquisitionTrDetailId: String
    disposalDate: Date
    disposalTransactionId: String
    disposalTrDetailId: String

    createdAt: Date
    updatedAt: Date
    createdBy: String
    modifiedBy: String
  }
`;

export const queries = `
  fxaInstances(
    ids: [String]
    fixedAssetIds: [String]
    status: String
    branchId: String
    departmentId: String
  ): [FxaInstance]
`;

export const mutations = '';
