import { gql } from '@apollo/client';

export const TAGS_QUERY = gql`
  query Tags(
    $type: String
    $searchValue: String
    $parentId: String
    $cursor: String
    $limit: Int
    $direction: CURSOR_DIRECTION
    $ids: [String]
    $excludeIds: Boolean
  ) {
    tags(
      type: $type
      searchValue: $searchValue
      parentId: $parentId
      ids: $ids
      excludeIds: $excludeIds
      cursor: $cursor
      limit: $limit
      direction: $direction
    ) {
      list {
        _id
        colorCode
        name
        parentId
        totalObjectCount
        objectCount
        type
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const TAG_BADGE_QUERY = gql`
  query TagBadge($id: String!) {
    tagDetail(_id: $id) {
      _id
      name
    }
  }
`;

export const TAGS_TYPES = gql`
  query TagsTypes {
    tagsGetTypes
  }
`;
