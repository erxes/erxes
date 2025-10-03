import gql from 'graphql-tag';

export const UPDATE_TEAM_STATUS = gql`
  mutation updateStatus(
    $_id: String!
    $name: String
    $description: String
    $color: String
    $order: Int
    $type: Int
  ) {
    updateStatus(
      _id: $_id
      name: $name
      description: $description
      color: $color
      order: $order
      type: $type
    ) {
      _id
    }
  }
`;
