import { gql } from '@apollo/client';

export const PAGE_LIST = gql`
  query PageList(
    $clientPortalId: String!
    $searchValue: String
    $language: String
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
  ) {
    cmsPageList(
      clientPortalId: $clientPortalId
      searchValue: $searchValue
      language: $language
      limit: $limit
      cursor: $cursor
      direction: $direction
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      pages {
        _id
        name
        description
        slug
        clientPortalId
        createdAt
        customFieldsData
        createdUser {
          _id
          email
          details {
            fullName
            firstName
            lastName
            middleName
            shortName
            avatar
            __typename
          }
          __typename
        }
        createdUserId
        updatedAt
        __typename
      }
      __typename
    }
  }
`;
