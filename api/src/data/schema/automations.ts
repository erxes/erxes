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

    count: Int
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
    createdAt: Date
    updatedAt: Date
    createdBy: String
    updatedBy: String
    triggers: [Trigger]
    actions: [Action]

    createdUser: User
    updatedUser: User
  }

  type AutomationNote {
    _id: String
    description: String
    triggerId: String
    actionId: String
    createdUser: User
    createdAt: Date
  }

  type AutomationsListResponse {
    list: [Automation],
    totalCount: Float,
  }

  type automationsTotalCountResponse {
    total: Int
    byStatus: Int
  }

  type AutomationHistory {
    _id: String
    createdAt: Date
    modifiedAt: Date
    automationId: String
    triggerId: String
    triggerType: String
    triggerConfig: JSON
    nextActionId: String
    targetId: String
    target: JSON
    status: String
    description: String
    actions: [JSON]
    startWaitingDate: Date
    waitingActionId: String
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

const historiesParams = `
  automationId: String!,
  page: Int,
  perPage: Int,
  status: String,
  triggerId: String,
  triggerType: String,
  beginDate: Date,
  endDate: Date,
`;

export const queries = `
  automationsMain(${queryParams}): AutomationsListResponse
  automations(${queryParams}): [Automation]
  automationDetail(_id: String!): Automation
  automationNotes(automationId: String!, triggerId: String, actionId: String): [AutomationNote]
  automationHistories(${historiesParams}): [AutomationHistory]
  automationConfigPrievewCount(config: JSON): Int
  automationsTotalCount(status: String): automationsTotalCountResponse
`;

const commonFields = `
  name: String
  status: String
  triggers: [TriggerInput],
  actions: [ActionInput],
`;

const commonNoteFields = `
  automationId: String
  triggerId: String
  actionId: String
  description: String
`;

export const mutations = `
  automationsAdd(${commonFields}): Automation
  automationsEdit(_id: String, ${commonFields}): Automation
  automationsRemove(automationIds: [String]): [String]

  automationsSaveAsTemplate(_id: String!, name: String!): Automation
  automationsCreateFromTemplate(_id: String): Automation

  automationsAddNote(${commonNoteFields}): AutomationNote
  automationsEditNote(_id: String!, ${commonNoteFields}): AutomationNote
  automationsRemoveNote(_id: String!): AutomationNote
`;
