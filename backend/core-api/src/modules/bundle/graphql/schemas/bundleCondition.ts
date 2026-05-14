export const types = `
  type BundleCondition @key(fields: "_id") {
    _id: String!
    name: String
    description: String
    code: String
    userId: String
    isDefault: Boolean
    createdAt: Date
  }
`;

export const queries = `
  allBundleConditions: [BundleCondition]
  bundleConditions(searchValue: String): [BundleCondition]
  bundleConditionDetail(_id: String!): BundleCondition
  bundleConditionTotalCount: Int
`;

const mutationParams = `
  name: String
  description: String
  code: String
`;

export const mutations = `
  bundleConditionAdd(${mutationParams}): BundleCondition
  bundleConditionEdit(_id: String! ${mutationParams}): BundleCondition
  bundleConditionRemove(_ids: [String]): JSON
  bundleConditionDefault(_id: String!): JSON
  bundleConditionSetBulk(productIds:[String],bundleId:String!): JSON
`;
