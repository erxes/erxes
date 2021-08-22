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
  createdUser {
    _id
    username
    email
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
  query automationNotes($automationId: String) {
    automationNotes(automationId: $automationId) {
      ${automationNoteFields}
    }
  }
`;

export default {
  automations,
  automationsMain,
  automationDetail,
  automationNotes
};
