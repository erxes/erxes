export const types = `
  type Trigger {
    type: String
    config: JSON
  }

  type Action {
    type: String
    config: JSON
    nextActionId: String
  }

  type Automation {
    _id: String!
    name: String
    triggers: [Trigger]
    actions: [Action]
  }

  type AutomationsListResponse {
    list: [Automation],
    totalCount: Float,
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  ids: [String]
  excludeIds: Boolean
  searchValue: String
  sortField: String
  sortDirection: Int
`;

export const queries = `
  automationsMain(${queryParams}): AutomationsListResponse
  automations(${queryParams}): [Automation]
  automationDetail(_id: String!): Automation
`;

const commonFields = `
  name: String
`;

export const mutations = `
  automationsAdd(${commonFields}): Automation
  automationsEdit(_id: String!, ${commonFields}): Automation
  automationsRemove(automationIds: [String]): [String]
`;
