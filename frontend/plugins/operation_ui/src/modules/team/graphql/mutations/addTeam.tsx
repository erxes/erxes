import gql from 'graphql-tag';

export const ADD_TEAM = gql`
  mutation teamAdd(
    $name: String!
    $icon: String!
    $description: String
    $memberIds: [String]
  ) {
    teamAdd(
      name: $name
      icon: $icon
      description: $description
      memberIds: $memberIds
    ) {
      _id
    }
  }
`;
