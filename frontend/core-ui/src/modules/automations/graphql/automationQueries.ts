import { gql } from '@apollo/client';
import { GQL_PAGE_INFO } from 'erxes-ui';
import {
  AUTOMATION_ACTION_FIELDS,
  AUTOMATION_NOTE_FIELDS,
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

export const AUTOMATION_NODE_OUTPUT = gql`
  query AutomationNodeOutput($nodeType: String!) {
    automationNodeOutput(nodeType: $nodeType)
  }
`;

export const AUTOMATION_REFERENCE_FIELDS = gql`
  query AutomationReferenceFields($type: String!, $field: String!) {
    automationReferenceFields(type: $type, field: $field)
  }
`;

export const AUTOMATION_DETAIL = gql`
query AutomationDetail($id: String!) {
  automationDetail(_id: $id) {
    _id
    name
    status
    edgeType
    flowDirection
    createdAt
    updatedAt
    createdBy
    updatedBy
    ownerId
    activatedAt
    ownerUser {
      _id
      email
      details {
        fullName
        avatar
      }
    }
    createdUser {
      _id
      details {
        fullName
        avatar
      }
    }
    updatedUser {
      _id
      details {
        fullName
        avatar
      }
    }
    duplicatedFrom
    duplicatedFromName
    triggers {
      ${AUTOMATION_TRIGGER_FIELDS}
    }
    actions {
      ${AUTOMATION_ACTION_FIELDS}
    }
    workflows {
      id
      automationId
      templateId
      nextActionId
      name
      description
      config
      actions 
      icon
      position
    }
    notes {
      ${AUTOMATION_NOTE_FIELDS}
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
        edgeType
        flowDirection
        createdAt
        updatedAt
        createdBy
        updatedBy
        tagIds
        # Slim node shape for the card view's flow preview. Never select
        # config, which is the heavy part of a trigger or action.
        triggers { id type icon label actionId }
        actions { id type icon label nextActionId }
        approvalLockState(action: "edit") {
          contentType
          contentId
          action
          locked
          hasAccess
          reason
        }
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
        failedActionId
        failedActionType
        errorCode
        handledFailureActionIds
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

export const AUTOMATION_WORKFLOW_TEMPLATES = gql`
  query AutomationWorkflowTemplates($searchValue: String) {
    automationWorkflowTemplates(searchValue: $searchValue) {
      _id
      name
      description
      entryActionId
      actions
      inputs
      createdAt
    }
  }
`;

export const AUTOMATION_EXECUTION_COUNTS = gql`
  query AutomationExecutionCounts($automationIds: [String!]!) {
    automationExecutionCounts(automationIds: $automationIds) {
      key
      count
    }
  }
`;
