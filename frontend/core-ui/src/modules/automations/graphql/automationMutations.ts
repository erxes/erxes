import { gql } from '@apollo/client';

export const AUTOMATION_REMOVE = gql`
  mutation AutomationsRemove($ids: [String]) {
    automationsRemove(automationIds: $ids)
  }
`;

export const AUTOMATION_EDIT = gql`
  mutation AutomationsEdit(
    $id: String
    $name: String
    $status: String
    $edgeType: String
    $flowDirection: String
    $triggers: [TriggerInput]
    $actions: [ActionInput]
    $workflows: [WorkflowInput]
  ) {
    automationsEdit(
      _id: $id
      name: $name
      status: $status
      edgeType: $edgeType
      flowDirection: $flowDirection
      triggers: $triggers
      actions: $actions
      workflows: $workflows
    ) {
      _id
      name
      status
    }
  }
`;

export const AUTOMATION_CREATE = gql`
  mutation AutomationsAdd(
    $name: String
    $status: String
    $edgeType: String
    $flowDirection: String
    $triggers: [TriggerInput]
    $actions: [ActionInput]
    $workflows: [WorkflowInput]
  ) {
    automationsAdd(
      name: $name
      status: $status
      edgeType: $edgeType
      flowDirection: $flowDirection
      triggers: $triggers
      actions: $actions
      workflows: $workflows
    ) {
      _id
      name
      status
    }
  }
`;
