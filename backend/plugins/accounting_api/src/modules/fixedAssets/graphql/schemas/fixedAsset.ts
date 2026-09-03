export const types = `
  type FixedAssetLocationRemainder {
    fixedAssetId: String
    branchId: String
    departmentId: String
    remainder: Float
  }

  type FixedAsset @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    code: String
    name: String
    categoryId: String
    description: String
    status: String

    accountId: String
    count: Float
    currentCount: Float
    originalCost: Float
    acquisitionDate: Date
    depreciationStartDate: Date
    transactionId: String
    transactionDetailId: String
    depreciationMethod: String
    annualDepreciationRate: Float
    salvageValue: Float
    taxDepreciationMethod: String
    taxAnnualDepreciationRate: Float
    taxSalvageValue: Float
    propertiesData: JSON

    createdAt: Date
    updatedAt: Date
    createdBy: String
    modifiedBy: String
  }
`;

export const queries = `
  fixedAssets(searchValue: String, ids: [String], categoryId: String, status: String, limit: Int): [FixedAsset]
  fixedAssetDetail(_id: String!): FixedAsset
  fixedAssetLocationRemainder(fixedAssetId: String!, branchId: String, departmentId: String, date: Date, excludeTransactionId: String): FixedAssetLocationRemainder
  fixedAssetLocationRemainders(searchValue: String, fixedAssetId: String, categoryId: String, branchId: String, departmentId: String, date: Date, limit: Int): [FixedAssetLocationRemainder]
`;

export const mutations = `
  fixedAssetsAdd(
    code: String!
    name: String!
    categoryId: String!
    description: String
    status: String
    accountId: String
    count: Float
    currentCount: Float
    originalCost: Float
    acquisitionDate: Date
    depreciationStartDate: Date
    transactionId: String
    transactionDetailId: String
    depreciationMethod: String
    annualDepreciationRate: Float
    salvageValue: Float
    taxDepreciationMethod: String
    taxAnnualDepreciationRate: Float
    taxSalvageValue: Float
    propertiesData: JSON
  ): FixedAsset

  fixedAssetsEdit(
    _id: String!
    code: String!
    name: String!
    categoryId: String!
    description: String
    status: String
    accountId: String
    count: Float
    currentCount: Float
    originalCost: Float
    acquisitionDate: Date
    depreciationStartDate: Date
    transactionId: String
    transactionDetailId: String
    depreciationMethod: String
    annualDepreciationRate: Float
    salvageValue: Float
    taxDepreciationMethod: String
    taxAnnualDepreciationRate: Float
    taxSalvageValue: Float
    propertiesData: JSON
  ): FixedAsset

  fixedAssetsRemove(_id: String!): JSON
`;
