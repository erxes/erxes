export const types = `
  type Trigger {
    id: String
    type: String
    actionId: String
    style: JSON
    config: JSON
    icon: String
    label: String
    description: String
  }

  type Action {
    id: String
    type: String
    nextActionId: String
    style: JSON
    config: JSON
    icon: String
    label: String
    description: String
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
    type: String
    actionId: String
    style: JSON
    config: JSON
    icon: String
    label: String
    description: String
  }

  input ActionInput {
    id: String
    type: String
    nextActionId: String
    style: JSON
    config: JSON
    icon: String
    label: String
    description: String
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
  status: String
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
  automationsSaveAsTemplate(${commonFields}): Automation
  automationsEdit(_id: String, ${commonFields}): Automation
  automationsRemove(automationIds: [String]): [String]
`;
