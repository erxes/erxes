export const types = `
  type Trigger {
    id: String
    mainType: String
    type: String
    actionId: String
    style: JSON
    config: JSON
  }

  type Action {
    id: String
    type: String
    nextActionId: String
    style: JSON
    config: JSON
  }

  type Automation {
    _id: String!
    name: String
    status: String
    triggers: [Trigger]
    actions: [Action]
  }

  type AutomationsListResponse {
    list: [Automation],
    totalCount: Float,
  }

  input TriggerInput {
    id: String
    mainType: String
    type: String
    actionId: String
    style: JSON
    config: JSON
  }

  input ActionInput {
    id: String
    type: String
    nextActionId: String
    style: JSON
    config: JSON
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
  status: String
  triggers: [TriggerInput],
  actions: [ActionInput],
`;

export const mutations = `
  automationsAdd(${commonFields}): Automation
  automationsEdit(_id: String, ${commonFields}): Automation
  automationsRemove(automationIds: [String]): [String]
`;
