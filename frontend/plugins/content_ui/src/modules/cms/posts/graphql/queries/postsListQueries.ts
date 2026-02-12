import { gql } from '@apollo/client';

export const POSTS_LIST = gql`
  query PostList(
    $clientPortalId: String!
    $type: String
    $featured: Boolean
    $searchValue: String
    $status: PostStatus
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
    $tagIds: [String]
    $sortField: String
    $sortDirection: String
  ) {
    cmsPostList(
      clientPortalId: $clientPortalId
      featured: $featured
      type: $type
      searchValue: $searchValue
      status: $status
      limit: $limit
      cursor: $cursor
      direction: $direction
      tagIds: $tagIds
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      posts {
        _id
        type
        customPostType {
          _id
          code
          label
          __typename
        }
        authorKind
        author {
          ... on User {
            username
            email
            details {
              fullName
              shortName
              avatar
              firstName
              lastName
              middleName
              __typename
            }
            __typename
          }
          __typename
        }
        featured
        status
        tagIds
        authorId
        createdAt
        autoArchiveDate
        scheduledDate
        excerpt
        thumbnail {
          url
          __typename
        }
        title
        updatedAt
        __typename
      }
      __typename
    }
  }
`;
