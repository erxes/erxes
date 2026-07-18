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

export const AUTOMATION_WORKFLOW_TEMPLATE_ADD = gql`
  mutation AutomationWorkflowTemplatesAdd(
    $name: String!
    $description: String
    $entryActionId: String
    $actions: JSON
    $inputs: JSON
  ) {
    automationWorkflowTemplatesAdd(
      name: $name
      description: $description
      entryActionId: $entryActionId
      actions: $actions
      inputs: $inputs
    ) {
      _id
    }
  }
`;

export const AUTOMATION_WORKFLOW_TEMPLATE_EDIT = gql`
  mutation AutomationWorkflowTemplatesEdit(
    $_id: String!
    $entryActionId: String
    $actions: JSON
    $inputs: JSON
  ) {
    automationWorkflowTemplatesEdit(
      _id: $_id
      entryActionId: $entryActionId
      actions: $actions
      inputs: $inputs
    ) {
      _id
    }
  }
`;

export const AUTOMATION_WORKFLOW_TEMPLATE_REMOVE = gql`
  mutation AutomationWorkflowTemplatesRemove($_id: String!) {
    automationWorkflowTemplatesRemove(_id: $_id)
  }
`;
