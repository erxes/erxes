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

export const types = `
  enum AgentStatus {
    active
    draft
    archived
  }

  type Agent @key(fields: "_id") {
    _id: String!,
    ${fieldDefs},
  }

  type AgentList {
    list: [Agent],
    totalCount: Int
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
  agentsMain: AgentList
`;

export const mutations = `
  agentsAdd(${addEditParamDefs}): Agent
  agentsEdit(_id: String!, ${addEditParamDefs}): Agent
`;
