import { gql } from '@apollo/client';

export const CMS_TAGS = gql`
  query CmsTags(
    $clientPortalId: String
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
        translations {
          language
          title
        }
      }
    }
  }
`;

export const CMS_TAG_DETAIL = gql`
  query CmsTagDetail($_id: String!, $clientPortalId: String) {
    cmsTag(_id: $_id, clientPortalId: $clientPortalId) {
      _id
      clientPortalId
      name
      slug
      colorCode
      createdAt
      updatedAt
      translations {
        language
        title
      }
    }
  }
`;
