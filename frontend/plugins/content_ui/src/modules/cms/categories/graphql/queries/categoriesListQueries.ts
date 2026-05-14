import { gql } from '@apollo/client';

export const CMS_CATEGORIES = gql`
  query CmsCategories(
    $clientPortalId: String!
    $searchValue: String
    $status: CategoryStatus
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
    $sortField: String
    $sortDirection: String
  ) {
    cmsCategories(
      clientPortalId: $clientPortalId
      searchValue: $searchValue
      status: $status
      limit: $limit
      cursor: $cursor
      direction: $direction
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      list {
        _id
        clientPortalId
        createdAt
        description
        name
        slug
        status
        customFieldsData
        parent {
          _id
          clientPortalId
          name
          slug
          description
          parentId
          status
          parent {
            _id
            clientPortalId
            name
            slug
            description
            parentId
            status
            parent {
              _id
              clientPortalId
              name
              slug
              description
              parentId
              status
              createdAt
              updatedAt
              customFieldsData
              customFieldsMap
            }
            createdAt
            updatedAt
            customFieldsData
            customFieldsMap
          }
          createdAt
          updatedAt
          customFieldsData
          customFieldsMap
        }
        parentId
        __typename
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
