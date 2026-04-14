import { gql } from '@apollo/client';

export const CMS_TAGS = gql`
  query CmsTags(
    $clientPortalId: String
    $limit: Int
    $cursor: String
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
      limit: $limit
      cursor: $cursor
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
      }
    }
  }
`;
