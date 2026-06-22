export const types = `
  type FxaInstance @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    fixedAssetId: String
    categoryId: String
    code: String
    status: String

    originalCost: Float
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

export const queries = '';

export const mutations = '';
