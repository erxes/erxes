import { gql } from '@apollo/client';

export const ADD_STATUS = gql`
  mutation Mutation(
    $name: String!
    $teamId: String!
    $description: String
    $color: String
    $order: Int
    $type: Int
  ) {
    addStatus(
      name: $name
      teamId: $teamId
      description: $description
      color: $color
      order: $order
      type: $type
    ) {
      _id
      color
      description
      name
      order
      teamId
      type
    }
  }
`;
