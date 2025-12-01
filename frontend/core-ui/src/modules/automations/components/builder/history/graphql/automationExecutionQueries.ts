import { gql } from '@apollo/client';
export const GET_AUTOMATION_EXECUTION_DETAIL = gql`
  query GetAutomationExecutionDetail($executionId: String!) {
    getAutomationExecutionDetail(executionId: $executionId) {
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
