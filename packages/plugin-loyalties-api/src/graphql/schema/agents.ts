const productRuleDefs = `
  categoryIds: [String],
  excludeCategoryIds: [String],
  productIds: [String],
  excludeProductIds: [String],
  tagIds: [String],
  excludeTagIds: [String],
  unitPrice: Float,
  bundleId: String
`;

const fieldDefs = `
  number: String!,
  customerIds: [String],
  companyIds: [String],
  status: AgentStatus!,
  startDate: Date,
  endDate: Date,
  startMonth: Date,
  endMonth: Date,
  startDay: Date,
  endDay: Date,
  hasReturn: Boolean!,
  returnAmount: Float,
  returnPercent: Float,
  prepaidPercent: Float,
  discountPercent: Float
`;

const addEditParamDefs = `
  ${fieldDefs}
  productRules: [ProductRuleInput]
`;

export const types = `
  enum AgentStatus {
    active
    draft
    archived
  }

  type ProductRule {
    ${productRuleDefs}
  }

  input ProductRuleInput {
    ${productRuleDefs}
  }

  type Agent @key(fields: "_id") {
    _id: String!,
    productRules: [ProductRule],
    ${fieldDefs}
  }
`;

export const queries = `
  agents(
    status: String,
    number: String,
    hasReturn: Boolean,
    customerIds: [String],
    companyIds: [String]
  ): [Agent]
  agentDetail(_id: String): Agent
`;

export const mutations = `
  agentsAdd(${addEditParamDefs}): Agent
  agentsEdit(_id: String!, ${addEditParamDefs}): Agent
`;
