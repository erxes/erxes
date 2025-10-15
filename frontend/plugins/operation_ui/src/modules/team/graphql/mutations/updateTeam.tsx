import gql from 'graphql-tag';

export const UPDATE_TEAM = gql`
  mutation teamUpdate(
    $_id: String!
    $name: String
    $icon: String
    $description: String
    $memberIds: [String]
    $estimateType: Int
    $cycleEnabled: Boolean
    $defaultStatusId: String
  ) {
    teamUpdate(
      _id: $_id
      name: $name
      icon: $icon
      description: $description
      memberIds: $memberIds
      estimateType: $estimateType
      cycleEnabled: $cycleEnabled
      defaultStatusId: $defaultStatusId
    ) {
      _id
    }
  }
`;
