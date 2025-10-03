import { gql } from '@apollo/client';

export const POSITIONS_ADD = gql`
  mutation PositionsAdd(
    $title: String
    $code: String
    $parentId: String
    $userIds: [String]
    $status: String
  ) {
    positionsAdd(
      title: $title
      code: $code
      parentId: $parentId
      userIds: $userIds
      status: $status
    ) {
      _id
      title
      code
      order
      parentId
      status
      userIds
      userCount
    }
  }
`;
