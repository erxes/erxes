import { gql } from '@apollo/client';

export const GET_TAGS = gql`
  query Tags(
    $type: String
    $ids: [String]
    $excludeIds: Boolean
    $parentId: String
    $searchValue: String
    $isGroup: Boolean
  ) {
    tags(
      type: $type
      ids: $ids
      excludeIds: $excludeIds
      parentId: $parentId
      searchValue: $searchValue
      isGroup: $isGroup
    ) {
      list {
        _id
        name
        order
        type
      }
    }
  }
`;
