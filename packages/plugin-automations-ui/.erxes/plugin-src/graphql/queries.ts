const userFields = `
  _id
  username
  email
  details {
    avatar
    fullName
  }
`;
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
    count
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
  createdAt
  updatedAt
  createdBy
  updatedBy
  createdUser {
    ${userFields}
  }
  updatedUser {
    ${userFields}
  }
`;

export const automationNoteFields = `
  _id
  description
  triggerId
  actionId
  createdUser {
    ${userFields}
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
        createdBy
        updatedBy
        createdUser {
          ${userFields}
        }
        updatedUser {
          ${userFields}
        }
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

const automationHistories = `
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

const automationsTotalCount = `
  query automationsTotalCount($status: String){
    automationsTotalCount(status: $status){
      byStatus
      total
    }
  }
`;

const automationConfigPrievewCount = `
  query automationConfigPrievewCount($config: JSON){
    automationConfigPrievewCount(config: $config)
  }
`;

export const commonFields = `
  brandId
  name
  kind
  code
  brand {
    _id
    name
    code
  }
  channels {
    _id
    name
  }
  languageCode
  leadData
  formId
  tags {
    _id
    name
    colorCode
  }
  tagIds
  form {
    _id
    title
    code
    description
    type
    buttonText
    numberOfPages
    createdDate
    createdUserId
    createdUser {
      _id
      details {
        avatar
        fullName
        position
      }
    }
  }
  isActive
`;

const integrations = `
  query leadIntegrations($perPage: Int, $page: Int, $kind: String, $tag: String, $brandId: String, $status: String, $sortField: String, $sortDirection: Int) {
    integrations(perPage: $perPage, page: $page, kind: $kind, tag: $tag, brandId: $brandId, status: $status, sortField: $sortField, sortDirection: $sortDirection) {
      _id
      ${commonFields}
    }
  }
`;

const fieldsCombinedByContentType = `
  query fieldsCombinedByContentType($contentType: String!,$usageType: String, $excludedNames: [String], $segmentId: String, $pipelineId: String, $formId: String) {
    fieldsCombinedByContentType(contentType: $contentType,usageType: $usageType, excludedNames: $excludedNames, segmentId: $segmentId, pipelineId: $pipelineId, formId: $formId)
  }
`;

const fields = `
  query fields($contentType: String!, $contentTypeId: String) {
    fields(contentType: $contentType, contentTypeId: $contentTypeId) {
      _id
      type
      validation
      text
      content
      description
      options
      isRequired
      order
      column
      logicAction
      logics {
        fieldId
        logicOperator
        logicValue
      }
      groupName
      associatedFieldId
      associatedField {
        _id
        text
        contentType
      }
      pageNumber
    }
  }
`;

export default {
  automations,
  automationsMain,
  automationDetail,
  automationNotes,
  automationHistories,
  automationsTotalCount,
  automationConfigPrievewCount,
  integrations,
  fieldsCombinedByContentType,
  fields
};
