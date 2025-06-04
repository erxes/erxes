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
  discountPercent: Float,
  productRuleIds: [String]
`;

const addEditParamDefs = `
  ${fieldDefs}
`;

/**
 * TODO: fix loading order of graphql types
 * rulesOfProducts should return [ProductRule] but type Agent is being dynamically 
 * loaded before type ProductRule, therefore throwing "Unknown type ProductRule" error
 */
export const types = `
  enum AgentStatus {
    active
    draft
    archived
  }

  type Agent @key(fields: "_id") {
    _id: String!,
    ${fieldDefs},

    rulesOfProducts: [JSON]
  }

  type AgentList {
    list: [Agent],
    totalCount: Int
  }
`;

const listParams = `
  number: String,
  status: String,
  hasReturn: Boolean,
  customerIds: [String],
  companyIds: [String],
`;

const pageParams = `
  page: Int,
  perPage: Int
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
  agentsMain(${listParams}, ${pageParams}): AgentList
`;

export const mutations = `
  agentsAdd(${addEditParamDefs}): Agent
  agentsEdit(_id: String!, ${addEditParamDefs}): Agent
  agentsRemove(_id: String!): JSON
`;
