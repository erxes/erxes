export const automationFields = `
  _id
  name
  status
  triggers {
    id
    type
    actionId
    style
    config
    icon
    label
    description
  }
  actions {
    id
    type
    nextActionId
    style
    config
    icon
    label
    description
  }
`;

export const automationNoteFields = `
  _id
  description
  triggerId
  actionId
  createdUser {
    _id
    username
    email
    details {
      avatar
      fullName
    }
  }
  createdAt
`;

const listParamsDef = `
  $page: Int
  $perPage: Int
  $ids: [String]
  $excludeIds: Boolean
  $searchValue: String
  $sortField: String
  $sortDirection: Int
  $status: String
`;

const listParamsValue = `
  page: $page
  perPage: $perPage
  ids: $ids
  excludeIds: $excludeIds
  searchValue: $searchValue
  sortField: $sortField
  sortDirection: $sortDirection
  status: $status
`;

export const automations = `
  query automations(${listParamsDef}) {
    automations(${listParamsValue}) {
      ${automationFields}
    }
  }
`;

export const automationsMain = `
  query automationsMain(${listParamsDef}) {
    automationsMain(${listParamsValue}) {
      list {
        _id
        name
        status
        triggers {
          id
        }
        actions {
          id
        }
        createdAt
        updatedAt
      }

      totalCount
    }
  }
`;

export const automationDetail = `
  query automationDetail($_id: String!) {
    automationDetail(_id: $_id) {
      ${automationFields}
    }
  }
`;

export const automationNotes = `
  query automationNotes($automationId: String!, $triggerId: String, $actionId: String) {
    automationNotes(automationId: $automationId, triggerId: $triggerId, actionId: $actionId) {
      ${automationNoteFields}
    }
  }
`;

const historiesParamDef = `
  $automationId: String!,
  $page: Int,
  $perPage: Int,
  $status: String,
  $triggerId: String,
  $triggerType: String,
  $beginDate: Date,
  $endDate: Date,
`;

const historiesParamValue = `
  automationId: $automationId,
  page: $page,
  perPage: $perPage,
  status: $status,
  triggerId: $triggerId,
  triggerType: $triggerType,
  beginDate: $beginDate,
  endDate: $endDate,
`;

export const automationHistories = `
  query automationHistories(${historiesParamDef}) {
    automationHistories(${historiesParamValue}) {
      _id
      createdAt
      modifiedAt
      automationId
      triggerId
      triggerType
      triggerConfig
      nextActionId
      targetId
      target
      status
      description
      actions
      startWaitingDate
      waitingActionId
    }
  }
`;

export default {
  automations,
  automationsMain,
  automationDetail,
  automationNotes,
  automationHistories
};
