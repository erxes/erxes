import gql from 'graphql-tag';

export const templateAddMutation = gql`
  mutation operationTemplateAdd(
    $name: String!
    $defaults: JSON!
    $teamId: String!
  ) {
    operationTemplateAdd(
      name: $name
      defaults: $defaults
      teamId: $teamId
    ) {
      _id
    }
  }
`;

export const templateEditMutation = gql`
  mutation operationTemplateEdit(
    $_id: String!
    $name: String
    $defaults: JSON
  ) {
    operationTemplateEdit(
      _id: $_id
      name: $name
      defaults: $defaults
    ) {
      _id
    }
  }
`;

export const templateRemoveMutation = gql`
  mutation operationTemplateRemove($_id: String!) {
    operationTemplateRemove(_id: $_id)
  }
`;
