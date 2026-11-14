import { gql } from '@apollo/client';

export const TEMPLATE_INSTALL = gql`
  mutation templateInstall(
    $pluginName: String!
    $id: String!
    $answers: JSON!
  ) {
    templateInstall(pluginName: $pluginName, id: $id, answers: $answers) {
      _id
      partIds
      automationIds
    }
  }
`;

export const TEMPLATE_INSTALLATION_REMOVE = gql`
  mutation templateInstallationRemove($_id: String!) {
    templateInstallationRemove(_id: $_id)
  }
`;
