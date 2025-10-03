import { gql } from '@apollo/client';

export const AUTOMATION_EDIT = gql`
  mutation AutomationsEdit(
    $id: String
    $name: String
    $status: String
    $triggers: [TriggerInput]
    $actions: [ActionInput]
  ) {
    automationsEdit(
      _id: $id
      name: $name
      status: $status
      triggers: $triggers
      actions: $actions
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
  ) {
    automationsAdd(
      name: $name
      status: $status
      triggers: $triggers
      actions: $actions
    ) {
      _id
      name
      status
    }
  }
`;
