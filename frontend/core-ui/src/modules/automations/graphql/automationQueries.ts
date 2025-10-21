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
query AutomationsMain($page: Int, $perPage: Int, $ids: [String], $excludeIds: [String], $searchValue: String, $sortField: String, $sortDirection: Int, $status: String, $tagIds: [String]) {
  automationsMain(page: $page, perPage: $perPage, ids: $ids, excludeIds: $excludeIds, searchValue: $searchValue, sortField: $sortField, sortDirection: $sortDirection, status: $status, tagIds: $tagIds) {
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
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}
`;

export const AUTOMATION_HISTORIES = gql`
query AutomationHistories($automationId: String!,${GQL_CURSOR_PARAM_DEFS}, $page: Int, $perPage: Int, $status: String, $triggerId: String, $triggerType: String, $beginDate: Date, $endDate: Date, $targetId: String, $targetIds: [String], $triggerTypes: [String], $ids: [String]) {
  automationHistories(automationId: $automationId,${GQL_CURSOR_PARAMS}, page: $page, perPage: $perPage, status: $status, triggerId: $triggerId, triggerType: $triggerType, beginDate: $beginDate, endDate: $endDate, targetId: $targetId, targetIds: $targetIds, triggerTypes: $triggerTypes, ids: $ids) {
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
    totalCount
     ${GQL_PAGE_INFO}
  }
}
`;

export const GET_AUTOMATION_WEBHOOK_ENDPOINT = gql`
  query Query($id: String!) {
    getAutomationWebhookEndpoint(_id: $id)
  }
`;
