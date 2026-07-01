export const types = `
  type FixedAsset @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    code: String
    name: String
    categoryId: String
    description: String
    status: String

    depreciationMethod: String
    usefulLife: Float
    salvageValue: Float
    taxDepreciationMethod: String
    taxUsefulLife: Float
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
`;

export const mutations = `
  fixedAssetsAdd(
    code: String!
    name: String!
    categoryId: String!
    description: String
    status: String
    depreciationMethod: String
    usefulLife: Float
    salvageValue: Float
    taxDepreciationMethod: String
    taxUsefulLife: Float
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
    depreciationMethod: String
    usefulLife: Float
    salvageValue: Float
    taxDepreciationMethod: String
    taxUsefulLife: Float
    taxSalvageValue: Float
    propertiesData: JSON
  ): FixedAsset

  fixedAssetsRemove(_id: String!): JSON
`;
