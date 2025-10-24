import { gql } from '@apollo/client';

export const AUTOMATION_REMOVE = gql`
  mutation AutomationsRemove($ids: [String]) {
    automationsRemove(ids: $ids)
  }
`;

export const AUTOMATION_EDIT = gql`
  mutation AutomationsEdit(
    $id: String
    $name: String
    $status: String
    $triggers: [TriggerInput]
    $actions: [ActionInput]
    $workflows: [WorkflowInput]
  ) {
    automationsEdit(
      _id: $id
      name: $name
      status: $status
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
    $triggers: [TriggerInput]
    $actions: [ActionInput]
    $workflows: [WorkflowInput]
  ) {
    automationsAdd(
      name: $name
      status: $status
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
