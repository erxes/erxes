export const types = `
  type EbarimtProductRule {
    _id: String
    createdAt: Date
    modifiedAt: Date
    title: String
    productIds: [String]
    productCategoryIds: [String]
    excludeCategoryIds: [String]
    excludeProductIds: [String]
    tagIds: [String]
    excludeTagIds: [String]
    kind: String
    taxType: String
    taxCode: String
    taxPercent: Float
  }

  type EbarimtProductRuleListResponse {
    list: [EbarimtProductRule]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

const queryParams = `
  searchValue: String,
  productId: String,
  kind: String,
  taxCode: String,
  taxType: String,
`;

export const queries = `
  ebarimtProductRules(${queryParams}): EbarimtProductRuleListResponse
  ebarimtProductRulesCount(${queryParams}): Int
`;

const mutationParams = `
  title: String
  productIds: [String]
  productCategoryIds: [String]
  excludeCategoryIds: [String]
  excludeProductIds: [String]
  tagIds: [String]
  excludeTagIds: [String]
  kind: String
  taxType: String
  taxCode: String
  taxPercent: Float
`;

export const mutations = `
  ebarimtProductRuleCreate(${mutationParams}): EbarimtProductRule
  ebarimtProductRuleUpdate(_id: String, ${mutationParams}): EbarimtProductRule
  ebarimtProductRulesRemove(ids: [String]): JSON
`;
