import { gql } from '@apollo/client';
import { GQL_PAGE_INFO } from 'erxes-ui';
import {
  AUTOMATION_ACTION_FIELDS,
  AUTOMATION_HISTORIES_PARAMS,
  AUTOMATION_HISTORIES_PARAMS_DEFS,
  AUTOMATION_MAIN_LIST_PARAMS,
  AUTOMATION_MAIN_LIST_PARAMS_DEFS,
  AUTOMATION_TRIGGER_FIELDS,
  COMMON_USER_FIELDS,
} from './graphqlConstants';

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
      ${AUTOMATION_TRIGGER_FIELDS}
    }
    actions {
      ${AUTOMATION_ACTION_FIELDS}
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
  query GetAutomationWebhookEndpoint($id: String!, $waitEventActionId: String) {
    getAutomationWebhookEndpoint(
      _id: $id
      waitEventActionId: $waitEventActionId
    )
  }
`;
