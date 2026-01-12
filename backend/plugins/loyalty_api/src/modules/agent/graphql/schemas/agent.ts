import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  enum AgentStatus {
    active
    draft
    archived
  }

  type Agent {
    _id: String!,
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

    rulesOfProducts: [JSON]
  }

  type AgentListResponse {
    list: [Agent],
    pageInfo: PageInfo,
    totalCount: Int
  }
`;

const queryParams = `
  status: String,
  number: String,
  hasReturn: Boolean,
  customerIds: [String],
  companyIds: [String]

  ${GQL_CURSOR_PARAM_DEFS}
`;

export const queries = `
  getAgent(_id: String!): Agent
  getAgents(${queryParams}): AgentListResponse
`;

const mutationParams = `
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

export const mutations = `
  createAgent(${mutationParams}): Agent
  updateAgent(_id: String!, ${mutationParams}): Agent
  removeAgent(_id: String!): Agent
`;
