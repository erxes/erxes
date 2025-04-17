export const types = `
  type BundleCondition @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    name: String
    description: String
    code: String
    userId: String
    isDefault: Boolean
    createdAt: Date
  }
  enum PriceType {
    thisProductPricePercent
    mainPricePercent
    price
  }

  type BundleRuleItem  {
    code: String!
    productIds: [String]
    products: [Product]
    allowSkip: Boolean
    quantity: Int
    priceType: PriceType
    priceAdjustType: String
    priceAdjustFactor: String,
    priceValue: Float,
    percent:Float,
  }

  type BundleRule @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    name: String
    description: String
    code: String
    userId: String
    createdAt: Date
    rules: [BundleRuleItem]
  }

  input BundleRuleItemInput {
    code: String!,
    productIds: [String]
    allowSkip: Boolean
    quantity: Int
    priceType: PriceType
    priceAdjustType: String
    priceAdjustFactor: String,
    priceValue: Float
    percent:Float
  }
 
`;

export const queries = `
  allBundleConditions: [BundleCondition]
  bundleConditions(page: Int, perPage: Int, searchValue: String): [BundleCondition]
  bundleConditionDetail(_id: String!): BundleCondition
  bundleConditionTotalCount: Int
  bundleRules: [BundleRule]
  bundleRuleDetail( _id: String!): BundleRule
`;

const mutationParams = `
  name: String!
  description: String
  code: String
`;
const mutationParamsBundleRule = `
  name: String!
  description: String
  code: String
  rules: [BundleRuleItemInput]
`;

export const mutations = `
  bundleConditionAdd(${mutationParams}): BundleCondition
  bundleConditionEdit(_id: String! ${mutationParams}): BundleCondition
  bundleConditionRemove(_id: String!): JSON
  bundleConditionDefault(_id: String!): JSON
  bundleConditionSetBulk(productIds:[String],bundleId:String!): JSON
  bundleRulesAdd(${mutationParamsBundleRule}): BundleRule
  bundleRulesEdit(_id: String! ${mutationParamsBundleRule}): BundleRule
  bundleRulesRemove(_id: String!): JSON

`;
