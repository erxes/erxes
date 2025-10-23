import {
  GQL_PAGE_INFO,
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
} from 'erxes-ui';
import { gql } from '@apollo/client';

const COMMON_USER_FIELDS = `
      _id
      username
      email
      details {
        fullName
        avatar
        shortName
        firstName
        middleName
        lastName
      }
`;

const AUTOMATION_MAIN_LIST_PARAMS = `
  ${GQL_CURSOR_PARAM_DEFS}
  $searchValue: String
  $status: String
  $tagIds: [String],
  $createdByIds: [String],
  $updatedByIds: [String],
  $createdAtFrom: Date,
  $createdAtTo: Date,
  $updatedAtFrom: Date,
  $updatedAtTo: Date,
  $triggerTypes: [String],
  $actionTypes: [String],
`;

const AUTOMATION_MAIN_LIST_PARAMS_DEFS = `
  ${GQL_CURSOR_PARAMS}
  searchValue: $searchValue
  status: $status
  tagIds: $tagIds
  createdByIds: $createdByIds
  updatedByIds: $updatedByIds
  createdAtFrom: $createdAtFrom
  createdAtTo: $createdAtTo
  updatedAtFrom: $updatedAtFrom
  updatedAtTo: $updatedAtTo
  triggerTypes: $triggerTypes
  actionTypes: $actionTypes
`;

const AUTOMATION_HISTORIES_PARAMS = `
${GQL_CURSOR_PARAM_DEFS}
  $automationId: String!
  $page: Int
  $perPage: Int
  $status: String
  $triggerId: String
  $triggerType: String
  $beginDate: Date
  $endDate: Date
  $targetId: String
  $targetIds: [String]
  $triggerTypes: [String]
  $ids: [String]
`;

const AUTOMATION_HISTORIES_PARAMS_DEFS = `
  ${GQL_CURSOR_PARAMS}
  automationId: $automationId
  page: $page
  perPage: $perPage
  status: $status
  triggerId: $triggerId
  triggerType: $triggerType
  beginDate: $beginDate
  endDate: $endDate
  targetId: $targetId
  targetIds: $targetIds
  triggerTypes: $triggerTypes
  ids: $ids
`;

export const AUTOMATION_CONSTANTS = gql`
  query automationConstants {
    automationConstants
  }
`;

export const AUTOMATION_DETAIL = gql`
query AutomationDetail($id: String!) {
  automationDetail(_id: $id) {
    _id
    name
    status
    createdAt
    updatedAt
    createdBy
    updatedBy
    triggers {
      id
      type
      style
      config
      icon
      label
      description
      position
      workflowId
      actionId
      isCustom
      count
    }
    actions {
      id
      type
      style
      config
      icon
      label
      description
      position
      workflowId
      nextActionId
    }
    workflows {
      id
      automationId
      name
      description
      config
      position
    }
    createdUser {
      ${COMMON_USER_FIELDS}
    }
    updatedUser {
      ${COMMON_USER_FIELDS}
    }
  }
}
`;

export const AUTOMATIONS_MAIN_LIST = gql`
  query AutomationsMain(${AUTOMATION_MAIN_LIST_PARAMS}) {
    automationsMain(${AUTOMATION_MAIN_LIST_PARAMS_DEFS}) {
      list {
        _id
        name
        status
        createdAt
        updatedAt
        createdBy
        updatedBy
        tagIds
        triggers { id }
        actions { id }
        createdUser {
          ${COMMON_USER_FIELDS}
        }
        updatedUser {
          ${COMMON_USER_FIELDS}
        }
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const AUTOMATION_HISTORIES = gql`
  query AutomationHistories(${AUTOMATION_HISTORIES_PARAMS}) {
    automationHistories(${AUTOMATION_HISTORIES_PARAMS_DEFS}) {
      list {
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
       ${GQL_PAGE_INFO}
    }
  }
`;

export const GET_AUTOMATION_WEBHOOK_ENDPOINT = gql`
  query Query($id: String!) {
    getAutomationWebhookEndpoint(_id: $id)
  }
`;
