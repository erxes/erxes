import { gql } from '@apollo/client';

export const POST_CMS_TAGS = gql`
  query CmsTags(
    $clientPortalId: String
    $cursor: String
    $limit: Int
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
    $sortMode: String
    $sortField: String
    $searchValue: String
    $language: String
    $aggregationPipeline: [JSON]
    $sortDirection: String
  ) {
    cmsTags(
      clientPortalId: $clientPortalId
      cursor: $cursor
      limit: $limit
      cursorMode: $cursorMode
      direction: $direction
      orderBy: $orderBy
      sortMode: $sortMode
      sortField: $sortField
      searchValue: $searchValue
      language: $language
      aggregationPipeline: $aggregationPipeline
      sortDirection: $sortDirection
    ) {
      tags {
        _id
        colorCode
        clientPortalId
        createdAt
        name
        slug
        updatedAt
        __typename
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      __typename
    }
  }
`;
