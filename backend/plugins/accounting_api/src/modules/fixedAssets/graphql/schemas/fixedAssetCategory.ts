export const types = `
  type FixedAssetAccounts {
    fixedAssetAccountId: String
    accumulatedDepreciationAccountId: String
    depreciationExpenseAccountId: String
    gainAccountId: String
    lossAccountId: String
    revaluationReserveAccountId: String
    deferredTaxAssetAccountId: String
    deferredTaxLiabilityAccountId: String
    incomeTaxExpenseAccountId: String
  }

  type FixedAssetCategory @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    code: String
    name: String
    description: String
    parentId: String
    status: String

    accounts: FixedAssetAccounts

    depreciationMethod: String
    defaultUsefulLife: Float
    defaultSalvageValue: Float
    taxDepreciationMethod: String
    defaultTaxUsefulLife: Float
    defaultTaxSalvageValue: Float

    createdAt: Date
    updatedAt: Date
    createdBy: String
    modifiedBy: String
  }
`;

export const queries = `
  fixedAssetCategories(searchValue: String, ids: [String], status: String): [FixedAssetCategory]
  fixedAssetCategoryDetail(_id: String!): FixedAssetCategory
`;

export const mutations = `
  fixedAssetCategoriesAdd(
    code: String!
    name: String!
    description: String
    parentId: String
    status: String
    accounts: JSON
    depreciationMethod: String
    defaultUsefulLife: Float
    defaultSalvageValue: Float
    taxDepreciationMethod: String
    defaultTaxUsefulLife: Float
    defaultTaxSalvageValue: Float
  ): FixedAssetCategory

  fixedAssetCategoriesEdit(
    _id: String!
    code: String!
    name: String!
    description: String
    parentId: String
    status: String
    accounts: JSON
    depreciationMethod: String
    defaultUsefulLife: Float
    defaultSalvageValue: Float
    taxDepreciationMethod: String
    defaultTaxUsefulLife: Float
    defaultTaxSalvageValue: Float
  ): FixedAssetCategory

  fixedAssetCategoriesRemove(_id: String!): JSON
`;
