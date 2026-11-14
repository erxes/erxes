import { gql } from '@apollo/client';

export const AUTOMATION_FOLDERS = gql`
  query AutomationFolders {
    automationFolders {
      _id
      name
      icon
      installationId
      createdAt
      automationCount
      activeCount
    }
  }
`;

export const AUTOMATION_FOLDERS_ADD = gql`
  mutation AutomationFoldersAdd($name: String!, $icon: String) {
    automationFoldersAdd(name: $name, icon: $icon) {
      _id
      name
    }
  }
`;

export const AUTOMATION_FOLDERS_EDIT = gql`
  mutation AutomationFoldersEdit($_id: String!, $name: String!, $icon: String) {
    automationFoldersEdit(_id: $_id, name: $name, icon: $icon) {
      _id
      name
      icon
    }
  }
`;

export const AUTOMATION_FOLDERS_REMOVE = gql`
  mutation AutomationFoldersRemove($_id: String!) {
    automationFoldersRemove(_id: $_id)
  }
`;

export const AUTOMATIONS_MOVE_TO_FOLDER = gql`
  mutation AutomationsMoveToFolder(
    $automationIds: [String!]!
    $folderId: String
  ) {
    automationsMoveToFolder(automationIds: $automationIds, folderId: $folderId)
  }
`;
