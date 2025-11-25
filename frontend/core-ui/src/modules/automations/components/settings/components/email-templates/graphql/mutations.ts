import { gql } from '@apollo/client';

export const AUTOMATION_EMAIL_TEMPLATES_ADD = gql`
  mutation AutomationEmailTemplatesAdd(
    $name: String!
    $description: String
    $content: String!
  ) {
    automationEmailTemplatesAdd(
      name: $name
      description: $description
      content: $content
    ) {
      _id
      name
      description
      content
      createdBy
      createdAt
      updatedAt
    }
  }
`;

export const AUTOMATION_EMAIL_TEMPLATES_EDIT = gql`
  mutation AutomationEmailTemplatesEdit(
    $_id: String!
    $name: String!
    $description: String
    $content: String!
  ) {
    automationEmailTemplatesEdit(
      _id: $_id
      name: $name
      description: $description
      content: $content
    ) {
      _id
      name
      description
      content
      createdBy
      createdAt
      updatedAt
    }
  }
`;

export const AUTOMATION_EMAIL_TEMPLATES_REMOVE = gql`
  mutation AutomationEmailTemplatesRemove($_id: String!) {
    automationEmailTemplatesRemove(_id: $_id)
  }
`;
