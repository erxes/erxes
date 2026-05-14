export const types = `
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

  type BundleRule @key(fields: "_id") {
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
  bundleRules: [BundleRule]
  bundleRuleDetail( _id: String!): BundleRule
`;

const mutationParams = `
  name: String
  description: String
  code: String
  rules: [BundleRuleItemInput]
`;

export const mutations = `
  bundleRulesAdd(${mutationParams}): BundleRule
  bundleRulesEdit(_id: String! ${mutationParams}): BundleRule
  bundleRulesRemove(_ids: [String]): JSON
`;
